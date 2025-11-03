// ========================================
// CARRINHO.JS - SISTEMA DE CARRINHO DE COMPRAS
// ========================================

const Carrinho = {
    items: [],

    /**
     * Inicializa o carrinho
     */
    init() {
        this.carregarDoLocalStorage();
        this.renderizarBotao();
        this.criarModal();
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
            preco: tipo === 'compra' ? livro.vlCompra : livro.vlAluguel
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

    const userId = Auth.getUserId();
    const btnFinalizar = document.getElementById('btn-finalizar-compra');
    
    // Mostrar resumo antes de finalizar
    const resumo = this.items.map(item => 
        `${item.titulo} - ${item.tipo.toUpperCase()} (${UI.formatCurrency(item.preco)})`
    ).join('\n');
    
    Modal.confirm(
        'Confirmar Compra',
        `Você está prestes a finalizar ${this.items.length} item(ns):\n\n${resumo}\n\nTotal: ${UI.formatCurrency(this.calcularTotal())}`,
        async () => {
            try {
                Modal.showLoading('Processando compra...');

                // Criar uma compra para cada item
                for (const item of this.items) {
                    const tipoUpper = item.tipo.toUpperCase();
                    const compra = {
                        cliente: { idPessoa: parseInt(userId) },
                        livro: { idLivro: item.idLivro },
                        // Status por tipo: COMPRA -> FINALIZADA, ALUGUEL -> PENDENTE
                        status: tipoUpper === 'COMPRA' ? 'FINALIZADA' : 'PENDENTE',
                        tipo: tipoUpper, // COMPRA ou ALUGUEL
                        vlTotal: parseFloat(item.preco)
                    };

                    await CompraAPI.criar(compra);
                }

                Modal.hideLoading();
                Modal.showSuccess(
                    'modal-carrinho',
                    'Compra realizada com sucesso!',
                    () => {
                        this.limpar();
    window.location.href = '/pages/cliente.html';
                    }
                );

            } catch (error) {
                console.error('Erro ao finalizar compra:', error);
                Modal.hideLoading();
                Modal.showError(
                    'Erro na Compra',
                    error.message || 'Não foi possível finalizar a compra. Tente novamente.'
                );
            }
        }
    );
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
            html += `
                <div class="cart-item">
                    <div class="cart-item-image">${iniciais}</div>
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
