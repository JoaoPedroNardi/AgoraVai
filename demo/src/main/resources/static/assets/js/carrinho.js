// ========================================
// CARRINHO.JS - SISTEMA DE CARRINHO DE COMPRAS
// ========================================

const Carrinho = {
    items: [],

    // Helpers para resolver URL da capa
    isValidHttpUrl(url) {
        if (!url || typeof url !== 'string') return false;
        try {
            const u = new URL(url);
            return u.protocol === 'http:' || u.protocol === 'https:';
        } catch (e) { return false; }
    },
    resolveCoverUrl(url) {
        if (!url) return null;
        const raw = String(url).trim();
        if (this.isValidHttpUrl(raw)) return raw;
        try {
            if (raw.startsWith('/') || raw.startsWith('./') || /^[^:]+\//.test(raw)) {
                return new URL(raw, window.location.origin).href;
            }
        } catch(e) { return null; }
        return null;
    },

    /**
     * Inicializa o carrinho
     */
    init() {
        this.carregarDoLocalStorage();
        this.renderizarBotao();
        this.criarModal();
        this.criarModalPagamento();
        this.atualizarBadge();
    },

    /**
     * Adiciona item ao carrinho
     */
    adicionar(livro, tipo = 'aluguel') {
        // Verificar se já existe
        const existe = this.items.find(item => 
            item.idLivro === livro.idLivro && item.tipo === tipo
        );

        if (existe) {
            Toast.warning('Este item já está no carrinho');
            return;
        }

        const item = {
            idLivro: livro.idLivro,
            titulo: livro.titulo,
            autor: livro.autor,
            tipo: tipo,
            preco: tipo === 'compra' ? livro.vlCompra : livro.vlAluguel,
            capaUrl: livro.capaUrl || null
        };

        this.items.push(item);
        this.salvarNoLocalStorage();
        this.atualizarBadge();
        Toast.success(`${livro.titulo} adicionado ao carrinho`);
    },

    /**
     * Remove item do carrinho
     */
    remover(idLivro, tipo) {
        this.items = this.items.filter(item => 
            !(item.idLivro === idLivro && item.tipo === tipo)
        );
        this.salvarNoLocalStorage();
        this.atualizarBadge();
        this.renderizarItens();
        Toast.info('Item removido do carrinho');
    },

    /**
     * Limpa todo o carrinho
     */
    limpar() {
        this.items = [];
        this.salvarNoLocalStorage();
        this.atualizarBadge();
        this.renderizarItens();
    },

    /**
     * Calcula total do carrinho
     */
    calcularTotal() {
        return this.items.reduce((total, item) => {
            return total + parseFloat(item.preco || 0);
        }, 0);
    },

    /**
     * Abre modal do carrinho
     */
    abrir() {
        this.renderizarItens();
        Modal.open('modal-carrinho');
    },

    /**
     * Finaliza compra
     */
    async finalizar() {
    if (this.items.length === 0) {
        Toast.warning('Carrinho vazio');
        return;
    }

    if (!Auth.isLoggedIn()) {
        Modal.confirm(
            'Login Necessário',
            'Você precisa estar logado para finalizar a compra. Deseja ir para o login?',
            () => {
    window.location.href = '/pages/login.html';
            }
        );
        return;
    }
    // Abre o modal de pagamento (apenas visual)
    this.abrirPagamento();
},

    /**
     * Renderiza botão flutuante
     */
    renderizarBotao() {
        const botao = document.createElement('button');
        botao.className = 'cart-button';
        botao.id = 'cart-button';
        botao.innerHTML = `
            <svg viewBox="0 0 24 24">
                <circle cx="9" cy="21" r="1"/>
                <circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            <span class="cart-badge" id="cart-badge" style="display: none;">0</span>
        `;
        document.body.appendChild(botao);
        botao.addEventListener('click', () => this.abrir());
    },

    /**
     * Cria modal do carrinho
     */
    criarModal() {
        const modalHTML = `
            <div id="cart-items-container" class="cart-items">
                <!-- Itens serão inseridos aqui -->
            </div>
        `;

        const footerHTML = `
            <button type="button" class="btn btn-outline" data-action="close">
                Continuar Comprando
            </button>
            <button type="button" class="btn btn-gold" id="btn-finalizar-compra">
                <svg width="16" height="16" viewBox="0 0 24 24" style="margin-right: 0.5rem;">
                    <polyline points="20 6 9 17 4 12" stroke="currentColor" fill="none" stroke-width="2"/>
                </svg>
                Finalizar Compra
            </button>
        `;

        Modal.create(
            'modal-carrinho',
            '<svg width="24" height="24" viewBox="0 0 24 24" style="margin-right: 0.5rem;"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>Meu Carrinho',
            modalHTML,
            footerHTML
        );

        // Listener para finalizar compra
        const btnFinalizar = document.getElementById('btn-finalizar-compra');
        if (btnFinalizar) {
            btnFinalizar.addEventListener('click', () => this.finalizar());
        }
    },

    /**
     * Cria modal de pagamento (visual)
     */
    criarModalPagamento() {
        const conteudo = `
            <div class="payment-content" style="display:flex;flex-direction:column;gap:1rem;">
                <div class="payment-summary" id="payment-summary">
                    <!-- Resumo será preenchido dinamicamente -->
                </div>
                <div class="payment-methods">
                    <label class="muted">Método de Pagamento</label>
                    <div class="method-list" style="display:grid;gap:0.5rem;">
                        <label class="radio">
                            <input type="radio" name="metodo-pagamento" value="pix" checked>
                            <span>Pix</span>
                        </label>
                        <label class="radio">
                            <input type="radio" name="metodo-pagamento" value="cartao">
                            <span>Cartão de Crédito</span>
                        </label>
                        <label class="radio">
                            <input type="radio" name="metodo-pagamento" value="boleto">
                            <span>Boleto</span>
                        </label>
                    </div>
                </div>
                <div class="payment-card" id="payment-card" style="display:none;">
                    <label class="muted">Dados do Cartão (visual)</label>
                    <div style="display:grid;grid-template-columns:1fr;gap:0.5rem;">
                        <input type="text" placeholder="Número do cartão" disabled>
                        <input type="text" placeholder="Nome impresso" disabled>
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;">
                            <input type="text" placeholder="Validade" disabled>
                            <input type="text" placeholder="CVV" disabled>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const rodape = `
            <button type="button" class="btn btn-outline" data-action="close">Cancelar</button>
            <button type="button" class="btn btn-gold" id="btn-confirmar-pagamento">
                <svg width="16" height="16" viewBox="0 0 24 24" style="margin-right:0.5rem;">
                    <polyline points="20 6 9 17 4 12" stroke="currentColor" fill="none" stroke-width="2"/>
                </svg>
                Confirmar Pagamento
            </button>
        `;

        Modal.create('modal-pagamento', 'Pagamento', conteudo, rodape);

        // Listeners internos
        const container = document.getElementById('modal-pagamento');
        if (container) {
            container.addEventListener('change', (e) => {
                const radio = e.target.closest('input[type="radio"][name="metodo-pagamento"]');
                if (!radio) return;
                const cartaoBox = document.getElementById('payment-card');
                if (cartaoBox) {
                    cartaoBox.style.display = radio.value === 'cartao' ? 'block' : 'none';
                }
            });
        }

        const btnConfirmar = document.getElementById('btn-confirmar-pagamento');
        if (btnConfirmar) {
            btnConfirmar.addEventListener('click', () => {
                const metodo = (document.querySelector('input[name="metodo-pagamento"]:checked')?.value) || 'pix';
                this.realizarCheckout(metodo);
            });
        }
    },

    /**
     * Abre modal de pagamento preenchendo resumo
     */
    abrirPagamento() {
        const resumoEl = document.getElementById('payment-summary');
        if (resumoEl) {
            const linhas = this.items.map(item => `
                <div style="display:flex;justify-content:space-between;gap:0.5rem;">
                    <span>${item.titulo} <span class="muted">• ${item.tipo.toUpperCase()}</span></span>
                    <span>${UI.formatCurrency(item.preco)}</span>
                </div>
            `).join('');
            resumoEl.innerHTML = `
                <div class="card" style="padding:1rem;">
                    <div class="card-title">Resumo do Pedido</div>
                    <div style="display:grid;gap:0.25rem;">${linhas}</div>
                    <div style="display:flex;justify-content:space-between;margin-top:0.75rem;font-weight:600;">
                        <span>Total</span>
                        <span>${UI.formatCurrency(this.calcularTotal())}</span>
                    </div>
                </div>
            `;
        }
        // Reset método para Pix
        const pixRadio = document.querySelector('input[name="metodo-pagamento"][value="pix"]');
        if (pixRadio) pixRadio.checked = true;
        const cartaoBox = document.getElementById('payment-card');
        if (cartaoBox) cartaoBox.style.display = 'none';
        Modal.open('modal-pagamento');
    },

    /**
     * Realiza checkout com base no método selecionado (visual)
     */
    async realizarCheckout(metodo) {
        try {
            const userId = Auth.getUserId();
            Modal.showLoading('Processando pagamento...');

            for (const item of this.items) {
                const tipoUpper = item.tipo.toUpperCase();
                const compra = {
                    cliente: { idPessoa: parseInt(userId) },
                    livro: { idLivro: item.idLivro },
                    status: tipoUpper === 'COMPRA' ? 'FINALIZADA' : 'PENDENTE',
                    tipo: tipoUpper,
                    vlTotal: parseFloat(item.preco)
                };
                await CompraAPI.criar(compra);
            }

            Modal.hideLoading();
            Modal.showSuccess(
                'modal-pagamento',
                `Pagamento (${metodo.toUpperCase()}) confirmado!`,
                () => {
                    this.limpar();
                    window.location.href = '/pages/cliente.html';
                }
            );
        } catch (error) {
            console.error('Erro ao finalizar compra:', error);
            Modal.hideLoading();
            Modal.showError(
                'Erro no Pagamento',
                error.message || 'Não foi possível concluir o pagamento. Tente novamente.'
            );
        }
    },

    /**
     * Renderiza itens do carrinho
     */
    renderizarItens() {
        const container = document.getElementById('cart-items-container');
        if (!container) return;

        if (this.items.length === 0) {
            container.innerHTML = `
                <div class="cart-empty">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <circle cx="9" cy="21" r="1"/>
                        <circle cx="20" cy="21" r="1"/>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                    </svg>
                    <p>Seu carrinho está vazio</p>
                </div>
            `;
            return;
        }

        let html = '';
        this.items.forEach(item => {
            const iniciais = item.titulo.substring(0, 2).toUpperCase();
            const cover = this.resolveCoverUrl(item.capaUrl);
            html += `
                <div class="cart-item">
                    <div class="cart-item-image">
                        ${cover ? `<img src="${cover}" alt="Capa de ${item.titulo}" style="width:100%;height:100%;object-fit:cover;border-radius:8px;"/>` : `${iniciais}`}
                    </div>
                    <div class="cart-item-details">
                        <div class="cart-item-title">${item.titulo}</div>
                        <div class="cart-item-author">${item.autor}</div>
                        <span class="cart-item-type">${item.tipo === 'compra' ? 'Compra' : 'Aluguel'}</span>
                    </div>
                    <div class="cart-item-price">${UI.formatCurrency(item.preco)}</div>
                    <button class="cart-item-remove" data-id-livro="${item.idLivro}" data-tipo="${item.tipo}" title="Remover">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                    </button>
                </div>
            `;
        });

        // Adicionar resumo
        html += `
            <div class="cart-summary">
                <div class="cart-summary-row">
                    <span>Subtotal:</span>
                    <span>${UI.formatCurrency(this.calcularTotal())}</span>
                </div>
                <div class="cart-summary-row total">
                    <span>Total:</span>
                    <span>${UI.formatCurrency(this.calcularTotal())}</span>
                </div>
            </div>
        `;

        container.innerHTML = html;

        // Delegação para remover itens
        container.addEventListener('click', (e) => {
            const btn = e.target.closest('.cart-item-remove');
            if (!btn) return;
            const idLivro = parseInt(btn.dataset.idLivro, 10);
            const tipo = btn.dataset.tipo;
            this.remover(idLivro, tipo);
        });
    },

    /**
     * Atualiza badge do carrinho
     */
    atualizarBadge() {
        const badge = document.getElementById('cart-badge');
        if (!badge) return;

        const quantidade = this.items.length;
        
        if (quantidade > 0) {
            badge.textContent = quantidade;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    },

    /**
     * Salva no localStorage
     */
    salvarNoLocalStorage() {
        localStorage.setItem('carrinho', JSON.stringify(this.items));
    },

    /**
     * Carrega do localStorage
     */
    carregarDoLocalStorage() {
        const dados = localStorage.getItem('carrinho');
        if (dados) {
            try {
                this.items = JSON.parse(dados);
            } catch (e) {
                this.items = [];
            }
        }
    }
};

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    Carrinho.init();
});

// Exportar para uso global
window.Carrinho = Carrinho;
