// ========================================
// LIVRO-MODALS.JS - MODAIS PARA GESTÃO DE LIVROS
// ========================================

const LivroModals = {
    /**
     * Inicializa os modais de livros
     */
    init() {
        this.criarModalNovoLivro();
        this.criarModalEditarLivro();
        this.criarModalDetalhesLivro();
        this.criarModalAvaliacao();
    },

    /**
     * Modal para adicionar novo livro
     */
    criarModalNovoLivro() {
        const formHTML = `
            <form id="form-novo-livro">
                <div class="form-group required">
                    <label for="livro-titulo">Título</label>
                    <input type="text" id="livro-titulo" name="titulo" required>
                </div>

                <div class="form-group required">
                    <label for="livro-autor">Autor</label>
                    <input type="text" id="livro-autor" name="autor" required>
                </div>

                <div class="form-group-inline">
                    <div class="form-group">
                        <label for="livro-genero">Gênero</label>
                        <select id="livro-genero" name="genero">
                            <option value="">Selecione...</option>
                            <option value="Ficção">Ficção</option>
                            <option value="Romance">Romance</option>
                            <option value="Mistério">Mistério</option>
                            <option value="Fantasia">Fantasia</option>
                            <option value="Terror">Terror</option>
                            <option value="Biografia">Biografia</option>
                            <option value="História">História</option>
                            <option value="Ciência">Ciência</option>
                            <option value="Autoajuda">Autoajuda</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="livro-data-publicacao">Data de Publicação</label>
                        <input type="date" id="livro-data-publicacao" name="dtPublicacao">
                    </div>
                </div>

                <div class="form-group-inline">
                    <div class="form-group required">
                        <label for="livro-preco-compra">Preço de Compra (R$)</label>
                        <input type="number" id="livro-preco-compra" name="vlCompra" step="0.01" min="0" required>
                    </div>

                    <div class="form-group required">
                        <label for="livro-preco-aluguel">Preço de Aluguel (R$)</label>
                        <input type="number" id="livro-preco-aluguel" name="vlAluguel" step="0.01" min="0" required>
                    </div>
                </div>

                <div class="form-group">
                    <label for="livro-capa-url">URL da Capa (Imagem)</label>
                    <input type="url" id="livro-capa-url" name="capaUrl" placeholder="https://...">
                </div>
                <div class="form-group">
                    <label for="livro-resumo-curto">Resumo Curto</label>
                    <input type="text" id="livro-resumo-curto" name="resumoCurto" maxlength="512" placeholder="Resumo curto (até 512 caracteres)">
                </div>
                <div class="form-group">
                    <label for="livro-sinopse">Sinopse</label>
                    <textarea id="livro-sinopse" name="sinopse" rows="4" placeholder="Sinopse do livro"></textarea>
                </div>
            </form>
        `;

        const footerHTML = `
            <button type="button" class="btn btn-outline" data-action="close">
                Cancelar
            </button>
            <button type="button" class="btn btn-gold" data-action="salvar-novo-livro">
                <svg width="16" height="16" viewBox="0 0 24 24" style="margin-right: 0.5rem;">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" stroke="currentColor" fill="none"/>
                    <polyline points="17 21 17 13 7 13 7 21" stroke="currentColor" fill="none"/>
                    <polyline points="7 3 7 8 15 8" stroke="currentColor" fill="none"/>
                </svg>
                Salvar Livro
            </button>
        `;

        Modal.create(
            'modal-novo-livro',
            '<svg width="24" height="24" viewBox="0 0 24 24" style="margin-right: 0.5rem;"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" stroke="currentColor" fill="none"/></svg>Novo Livro',
            formHTML,
            footerHTML
        );

        // Event listener para o formulário
        document.getElementById('form-novo-livro').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.salvarNovoLivro();
        });

        // Delegação por overlay para ações com data-action
        const overlayNovo = document.getElementById('modal-novo-livro');
        overlayNovo.addEventListener('click', (ev) => {
            const btn = ev.target.closest('[data-action]');
            if (!btn) return;
            const action = btn.dataset.action;
            if (action === 'salvar-novo-livro') {
                const form = document.getElementById('form-novo-livro');
                form && form.requestSubmit();
            }
        });
    },

    /**
     * Modal para editar livro existente
     */
    criarModalEditarLivro() {
        const formHTML = `
            <form id="form-editar-livro">
                <input type="hidden" id="edit-livro-id">
                
                <div class="form-group required">
                    <label for="edit-livro-titulo">Título</label>
                    <input type="text" id="edit-livro-titulo" name="titulo" required>
                </div>

                <div class="form-group required">
                    <label for="edit-livro-autor">Autor</label>
                    <input type="text" id="edit-livro-autor" name="autor" required>
                </div>

                <div class="form-group-inline">
                    <div class="form-group">
                        <label for="edit-livro-genero">Gênero</label>
                        <select id="edit-livro-genero" name="genero">
                            <option value="">Selecione...</option>
                            <option value="Ficção">Ficção</option>
                            <option value="Romance">Romance</option>
                            <option value="Mistério">Mistério</option>
                            <option value="Fantasia">Fantasia</option>
                            <option value="Terror">Terror</option>
                            <option value="Biografia">Biografia</option>
                            <option value="História">História</option>
                            <option value="Ciência">Ciência</option>
                            <option value="Autoajuda">Autoajuda</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="edit-livro-data-publicacao">Data de Publicação</label>
                        <input type="date" id="edit-livro-data-publicacao" name="dtPublicacao">
                    </div>
                </div>

                <div class="form-group-inline">
                    <div class="form-group required">
                        <label for="edit-livro-preco-compra">Preço de Compra (R$)</label>
                        <input type="number" id="edit-livro-preco-compra" name="vlCompra" step="0.01" min="0" required>
                    </div>

                    <div class="form-group required">
                        <label for="edit-livro-preco-aluguel">Preço de Aluguel (R$)</label>
                        <input type="number" id="edit-livro-preco-aluguel" name="vlAluguel" step="0.01" min="0" required>
                    </div>
                </div>

                <div class="form-group">
                    <label for="edit-livro-capa-url">URL da Capa (Imagem)</label>
                    <input type="url" id="edit-livro-capa-url" name="capaUrl" placeholder="https://...">
                </div>

                <div class="form-group">
                    <label for="edit-livro-resumo-curto">Resumo Curto</label>
                    <input type="text" id="edit-livro-resumo-curto" name="resumoCurto" maxlength="512" placeholder="Resumo curto (até 512 caracteres)">
                </div>

                <div class="form-group">
                    <label for="edit-livro-sinopse">Sinopse</label>
                    <textarea id="edit-livro-sinopse" name="sinopse" rows="4" placeholder="Sinopse do livro"></textarea>
                </div>
            </form>
        `;

        const footerHTML = `
            <button type="button" class="btn btn-outline" data-action="close">
                Cancelar
            </button>
            <button type="button" form="form-editar-livro" class="btn btn-gold" data-action="salvar-edicao-livro">
                <svg width="16" height="16" viewBox="0 0 24 24" style="margin-right: 0.5rem;">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" stroke="currentColor" fill="none"/>
                </svg>
                Salvar Alterações
            </button>
        `;

        Modal.create(
            'modal-editar-livro',
            '<svg width="24" height="24" viewBox="0 0 24 24" style="margin-right: 0.5rem;"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" stroke="currentColor" fill="none"/></svg>Editar Livro',
            formHTML,
            footerHTML
        );

        // Event listener para o formulário
        document.getElementById('form-editar-livro').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.salvarEdicaoLivro();
        });

        // Delegação por overlay para ações com data-action
        const overlayEditar = document.getElementById('modal-editar-livro');
        overlayEditar.addEventListener('click', (ev) => {
            const btn = ev.target.closest('[data-action]');
            if (!btn) return;
            const action = btn.dataset.action;
            if (action === 'salvar-edicao-livro') {
                const form = document.getElementById('form-editar-livro');
                form && form.requestSubmit();
            }
        });
    },

    /**
     * Modal de detalhes do livro (para clientes)
     */
    criarModalDetalhesLivro() {
        const contentHTML = `
            <div id="livro-detalhes-content">
                <!-- Conteúdo será preenchido dinamicamente -->
            </div>
        `;

        const footerHTML = `
            <button type="button" class="btn btn-outline" data-action="close">
                Fechar
            </button>
            <button type="button" class="btn btn-gold" id="btn-adicionar-carrinho-compra" data-action="comprar-livro" style="display: none;">
                <svg width="16" height="16" viewBox="0 0 24 24" style="margin-right: 0.5rem;">
                    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
                Comprar
            </button>
            <button type="button" class="btn btn-outline" id="btn-adicionar-carrinho-aluguel" data-action="alugar-livro" style="display: none;">
                <svg width="16" height="16" viewBox="0 0 24 24" style="margin-right: 0.5rem;">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" fill="none"/>
                    <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor"/>
                    <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor"/>
                </svg>
                Alugar
            </button>
        `;

        Modal.create(
            'modal-detalhes-livro',
            '<svg width="24" height="24" viewBox="0 0 24 24" style="margin-right: 0.5rem;"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" stroke="currentColor" fill="none"/></svg>Detalhes do Livro',
            contentHTML,
            footerHTML,
            'modal-wide'
        );

        // Delegação por overlay para compra/aluguel via data-action
        const overlayDetalhes = document.getElementById('modal-detalhes-livro');
        overlayDetalhes.addEventListener('click', (ev) => {
            const btn = ev.target.closest('[data-action]');
            if (!btn) return;
            const action = btn.dataset.action;
            if (action === 'comprar-livro' || action === 'alugar-livro') {
                const livroAtual = LivroModals._livroAtualDetalhes;
                if (!livroAtual) return;
                const tipo = action === 'comprar-livro' ? 'compra' : 'aluguel';
                Carrinho.adicionar(livroAtual, tipo);
                const textoTipo = tipo === 'compra' ? 'COMPRA' : 'ALUGUEL';
                Toast.success(`${livroAtual.titulo} adicionado ao carrinho para ${textoTipo}!`);
                Modal.close('modal-detalhes-livro');
            }
        });
    },

    /**
     * Modal para avaliação de livro
     */
    criarModalAvaliacao() {
        const formHTML = `
            <form id="form-avaliar-livro">
                <input type="hidden" id="aval-livro-id">
                
                <div class="form-group">
                    <p id="aval-livro-titulo" style="font-size: 1.1rem; font-weight: 600; color: #0a2342; margin-bottom: 1.5rem;"></p>
                </div>

                <div class="form-group required">
                    <label>Sua Avaliação</label>
                    <div class="rating-input">
                        <input type="radio" name="nota" id="star5" value="5.0">
                        <label for="star5">★</label>
                        <input type="radio" name="nota" id="star4" value="4.0">
                        <label for="star4">★</label>
                        <input type="radio" name="nota" id="star3" value="3.0">
                        <label for="star3">★</label>
                        <input type="radio" name="nota" id="star2" value="2.0">
                        <label for="star2">★</label>
                        <input type="radio" name="nota" id="star1" value="1.0">
                        <label for="star1">★</label>
                    </div>
                </div>
            </form>
        `;

        const footerHTML = `
            <button type="button" class="btn btn-outline" data-action="close">
                Cancelar
            </button>
            <button type="button" form="form-avaliar-livro" class="btn btn-gold" data-action="salvar-avaliacao">
                <svg width="16" height="16" viewBox="0 0 24 24" style="margin-right: 0.5rem;">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" stroke="currentColor" fill="none"/>
                </svg>
                Enviar Avaliação
            </button>
        `;

        Modal.create(
            'modal-avaliar-livro',
            '<svg width="24" height="24" viewBox="0 0 24 24" style="margin-right: 0.5rem;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" stroke="currentColor" fill="none"/></svg>Avaliar Livro',
            formHTML,
            footerHTML
        );

        // Event listener para o formulário
        document.getElementById('form-avaliar-livro').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.salvarAvaliacao();
        });

        // Delegação por overlay para ações com data-action
        const overlayAvaliar = document.getElementById('modal-avaliar-livro');
        overlayAvaliar.addEventListener('click', (ev) => {
            const btn = ev.target.closest('[data-action]');
            if (!btn) return;
            const action = btn.dataset.action;
            if (action === 'salvar-avaliacao') {
                const form = document.getElementById('form-avaliar-livro');
                form && form.requestSubmit();
            }
        });
    },

    /**
     * Abre modal de novo livro
     */
    abrirNovoLivro() {
        Modal.clearForm('modal-novo-livro');
        Modal.open('modal-novo-livro');
    },

    /**
     * Abre modal de edição com dados do livro
     */
    async abrirEditarLivro(idLivro) {
        try {
            const livro = await LivroAPI.buscarPorId(idLivro);
            
            document.getElementById('edit-livro-id').value = livro.idLivro;
            document.getElementById('edit-livro-titulo').value = livro.titulo;
            document.getElementById('edit-livro-autor').value = livro.autor;
            // Garantir que o gênero atual seja selecionável mesmo se não existir nas opções
            const selGenero = document.getElementById('edit-livro-genero');
            const generoAtual = livro.genero || '';
            if (selGenero) {
                const temOpcao = Array.from(selGenero.options).some(opt => String(opt.value) === String(generoAtual));
                if (!temOpcao && generoAtual) {
                    const opt = document.createElement('option');
                    opt.value = generoAtual;
                    opt.textContent = generoAtual;
                    selGenero.appendChild(opt);
                }
                selGenero.value = generoAtual;
            }
            document.getElementById('edit-livro-data-publicacao').value = livro.dtPublicacao || '';
            document.getElementById('edit-livro-preco-compra').value = livro.vlCompra || '';
            document.getElementById('edit-livro-preco-aluguel').value = livro.vlAluguel || '';
            const elCapa = document.getElementById('edit-livro-capa-url');
            if (elCapa) elCapa.value = livro.capaUrl || '';
            const elResumo = document.getElementById('edit-livro-resumo-curto');
            if (elResumo) elResumo.value = livro.resumoCurto || '';
            const elSinopse = document.getElementById('edit-livro-sinopse');
            if (elSinopse) elSinopse.value = livro.sinopse || '';
            
            Modal.open('modal-editar-livro');
        } catch (error) {
            console.error('Erro ao carregar livro:', error);
            Toast.error('Erro ao carregar dados do livro');
        }
    },

    /**
     * Abre modal de detalhes
     */
    async abrirDetalhesLivro(idLivro) {
        try {
            const livro = await LivroAPI.buscarPorId(idLivro);
            const avaliacoes = await AvaliacaoAPI.buscarPorLivro(idLivro);

            // Guardar estado atual do livro para delegação por overlay
            LivroModals._livroAtualDetalhes = livro;
            
            const container = document.getElementById('livro-detalhes-content');
            const iniciais = livro.titulo.substring(0, 2).toUpperCase();
            
            let avaliacoesHTML = '';
            if (avaliacoes && avaliacoes.length > 0) {
                avaliacoesHTML = `
                    <div style="margin-top: 2rem; padding-top: 2rem; border-top: 1px solid #e5e7eb;">
                        <h3 style="margin-bottom: 1rem;">Avaliações dos Leitores</h3>
                        ${avaliacoes.map(aval => `
                            <div style="padding: 1rem; background: #f9fafb; border-radius: 8px; margin-bottom: 1rem;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                                    <strong>${aval.cliente.nome}</strong>
                                    <div class="stars">${Utils.renderizarEstrelas(parseFloat(aval.nota))}</div>
                                </div>
                                <p style="margin:0.25rem 0 0.5rem;">${Utils.comentarioPorEstrelas(parseFloat(aval.nota), aval.comentario)}</p>
                                <p style="color: #6b7280; font-size: 0.875rem;">${UI.formatDate(aval.dtAvaliacao)}</p>
                            </div>
                        `).join('')}
                    </div>
                `;
            }
            
            container.innerHTML = `
                <div style="display: grid; grid-template-columns: 200px 1fr; gap: 2rem;">
                    <div>
                        <div style="width: 200px; height: 280px; background: linear-gradient(135deg, #8c6d4e 0%, #d4af37 100%); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-size: 2rem; font-weight: 700;">
                            ${iniciais}
                        </div>
                    </div>
                    <div>
                        <h2 style="margin-bottom: 0.5rem; color: #0a2342;">${livro.titulo}</h2>
                        <p style="font-size: 1.1rem; color: #6b7280; margin-bottom: 1rem;">por ${livro.autor}</p>
                        
                        ${livro.avaliacao ? `
                            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1.5rem;">
                                <div class="stars">${Utils.renderizarEstrelas(parseFloat(livro.avaliacao))}</div>
                                <span style="color: #6b7280;">${livro.avaliacao} / 5.0</span>
                            </div>
                        ` : ''}
                        
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 1.5rem;">
                            <div>
                                <span style="color: #6b7280; font-size: 0.875rem;">Gênero</span>
                                <p style="font-weight: 600;">${livro.genero || 'Não informado'}</p>
                            </div>
                            <div>
                                <span style="color: #6b7280; font-size: 0.875rem;">Publicação</span>
                                <p style="font-weight: 600;">${livro.dtPublicacao ? UI.formatDate(livro.dtPublicacao) : 'Não informado'}</p>
                            </div>
                            <div>
                                <span style="color: #6b7280; font-size: 0.875rem;">Compra</span>
                                <p style="font-weight: 700; color: #d4af37; font-size: 1.25rem;">${UI.formatCurrency(livro.vlCompra)}</p>
                            </div>
                            <div>
                                <span style="color: #6b7280; font-size: 0.875rem;">Aluguel</span>
                                <p style="font-weight: 700; color: #d4af37; font-size: 1.25rem;">${UI.formatCurrency(livro.vlAluguel)}</p>
                            </div>
                        </div>
                        
                        
                    </div>
                </div>
                ${avaliacoesHTML}
            `;
            
            // Configurar botões
            const btnCompra = document.getElementById('btn-adicionar-carrinho-compra');
            const btnAluguel = document.getElementById('btn-adicionar-carrinho-aluguel');
            
            if (Auth.isLoggedIn()) {
                btnCompra.style.display = 'inline-flex';
                btnAluguel.style.display = 'inline-flex';
            } else {
                btnCompra.style.display = 'none';
                btnAluguel.style.display = 'none';
            }
            
            // Propagar id no overlay para referência
            const overlayDetalhes = document.getElementById('modal-detalhes-livro');
            if (overlayDetalhes) overlayDetalhes.dataset.idLivro = String(livro.idLivro);
            
            Modal.open('modal-detalhes-livro');
        } catch (error) {
            console.error('Erro ao carregar detalhes:', error);
            Toast.error('Erro ao carregar detalhes do livro');
        }
    },

    /**
     * Abre modal de avaliação
     */
    async abrirAvaliarLivro(idLivro, tituloLivro) {
        // Exigir login
        if (!Auth.isLoggedIn()) {
            Modal.confirm(
                'Login Necessário',
                'Você precisa estar logado para avaliar. Ir para o login?',
                () => window.location.href = '/pages/login.html'
            );
            return;
        }

        // Verificar elegibilidade por compra/aluguel não cancelada
        try {
            const minhasCompras = await CompraAPI.listarMinhas();
            const elegivel = (minhasCompras || []).some(c => {
                const id = c?.livro?.idLivro;
                const status = String(c?.status || '').toUpperCase();
                return id === idLivro && status !== 'CANCELADA';
            });
            if (!elegivel) {
                Toast.info('Você só pode avaliar livros que comprou ou alugou.');
                return;
            }
        } catch (e) {
            console.warn('Falha ao verificar elegibilidade de avaliação (modal):', e);
            Toast.error('Não foi possível verificar sua elegibilidade para avaliar. Tente novamente.');
            return;
        }

        document.getElementById('aval-livro-id').value = idLivro;
        document.getElementById('aval-livro-titulo').textContent = tituloLivro;
        
        // Limpar seleção anterior
        document.querySelectorAll('#form-avaliar-livro input[name="nota"]').forEach(input => {
            input.checked = false;
        });
        
        Modal.open('modal-avaliar-livro');
    },

    /**
     * Salva novo livro
     */
    async salvarNovoLivro() {
        const form = document.getElementById('form-novo-livro');
        const submitBtn = form.querySelector('button[type="submit"]');
        
        try {
            UI.showLoading(submitBtn);
            
            const livro = {
                titulo: document.getElementById('livro-titulo').value,
                autor: document.getElementById('livro-autor').value,
                genero: document.getElementById('livro-genero').value,
                dtPublicacao: document.getElementById('livro-data-publicacao').value || null,
                vlCompra: parseFloat(document.getElementById('livro-preco-compra').value),
                vlAluguel: parseFloat(document.getElementById('livro-preco-aluguel').value),
                capaUrl: document.getElementById('livro-capa-url').value || null,
                resumoCurto: document.getElementById('livro-resumo-curto').value || null,
                sinopse: document.getElementById('livro-sinopse').value || null
            };
            // Validar data de publicação (se preenchida): incompleta/inválida
            if (livro.dtPublicacao) {
                const str = String(livro.dtPublicacao).trim();
                if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) {
                    UI.hideLoading(submitBtn);
                    throw new Error('Data de publicação incompleta');
                }
                const ano = parseInt(str.slice(0, 4), 10);
                const mes = parseInt(str.slice(5, 7), 10);
                const dia = parseInt(str.slice(8, 10), 10);
                const d = new Date(ano, mes - 1, dia);
                if (d.getFullYear() !== ano || d.getMonth() !== (mes - 1) || d.getDate() !== dia) {
                    UI.hideLoading(submitBtn);
                    throw new Error('Data de publicação inválida');
                }
                // Regra: data de publicação não pode ser futura
                const hoje = new Date();
                hoje.setHours(0, 0, 0, 0);
                const dataPub = new Date(ano, mes - 1, dia);
                if (dataPub.getTime() > hoje.getTime()) {
                    UI.hideLoading(submitBtn);
                    throw new Error('Data de publicação não pode ser futura');
                }
            }
            
            await LivroAPI.criar(livro);
            
            Modal.showSuccess(
                'modal-novo-livro',
                'Livro cadastrado com sucesso!',
                () => location.reload()
            );
        } catch (error) {
            console.error('Erro ao salvar livro:', error);
            UI.hideLoading(submitBtn);
            Toast.error(error.message || 'Erro ao cadastrar livro');
        }
    },

    /**
     * Salva edição de livro
     */
    async salvarEdicaoLivro() {
        const form = document.getElementById('form-editar-livro');
        const submitBtn = form.querySelector('button[type="submit"]');
        
        try {
            UI.showLoading(submitBtn);
            
            const idLivro = document.getElementById('edit-livro-id').value;
            const livro = {
                titulo: document.getElementById('edit-livro-titulo').value,
                autor: document.getElementById('edit-livro-autor').value,
                genero: document.getElementById('edit-livro-genero').value,
                dtPublicacao: document.getElementById('edit-livro-data-publicacao').value || null,
                vlCompra: parseFloat(document.getElementById('edit-livro-preco-compra').value),
                vlAluguel: parseFloat(document.getElementById('edit-livro-preco-aluguel').value),
                capaUrl: document.getElementById('edit-livro-capa-url').value || null,
                resumoCurto: document.getElementById('edit-livro-resumo-curto').value || null,
                sinopse: document.getElementById('edit-livro-sinopse').value || null
            };
            // Validar data de publicação (se preenchida): incompleta/inválida
            if (livro.dtPublicacao) {
                const str = String(livro.dtPublicacao).trim();
                if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) {
                    UI.hideLoading(submitBtn);
                    throw new Error('Data de publicação incompleta');
                }
                const ano = parseInt(str.slice(0, 4), 10);
                const mes = parseInt(str.slice(5, 7), 10);
                const dia = parseInt(str.slice(8, 10), 10);
                const d = new Date(ano, mes - 1, dia);
                if (d.getFullYear() !== ano || d.getMonth() !== (mes - 1) || d.getDate() !== dia) {
                    UI.hideLoading(submitBtn);
                    throw new Error('Data de publicação inválida');
                }
                // Regra: data de publicação não pode ser futura
                const hoje = new Date();
                hoje.setHours(0, 0, 0, 0);
                const dataPub = new Date(ano, mes - 1, dia);
                if (dataPub.getTime() > hoje.getTime()) {
                    UI.hideLoading(submitBtn);
                    throw new Error('Data de publicação não pode ser futura');
                }
            }
            
            const livroAtualizado = await LivroAPI.atualizar(idLivro, livro);
            
            Modal.showSuccess(
                'modal-editar-livro',
                'Livro atualizado com sucesso!',
                () => {
                    window.dispatchEvent(new CustomEvent('livro-atualizado', { detail: livroAtualizado }));
                    Modal.close('modal-editar-livro');
                }
            );
        } catch (error) {
            console.error('Erro ao atualizar livro:', error);
            UI.hideLoading(submitBtn);
            Toast.error(error.message || 'Erro ao atualizar livro');
        }
    },

    /**
     * Salva avaliação
     */
    async salvarAvaliacao() {
        const form = document.getElementById('form-avaliar-livro');
        const submitBtn = form.querySelector('button[type="submit"]');
        
        try {
            const notaSelecionada = form.querySelector('input[name="nota"]:checked');
            
            if (!notaSelecionada) {
                Toast.warning('Por favor, selecione uma nota');
                return;
            }
            
            if (!Auth.isLoggedIn()) {
                Toast.error('Você precisa estar logado para avaliar');
                return;
            }
            
            UI.showLoading(submitBtn);
            
            const avaliacao = {
                cliente: { idPessoa: parseInt(Auth.getUserId()) },
                livro: { idLivro: parseInt(document.getElementById('aval-livro-id').value) },
                nota: parseFloat(notaSelecionada.value)
            };
            
            await AvaliacaoAPI.criar(avaliacao);
            
            Modal.showSuccess(
                'modal-avaliar-livro',
                'Avaliação enviada com sucesso!',
                () => location.reload()
            );
        } catch (error) {
            console.error('Erro ao salvar avaliação:', error);
            UI.hideLoading(submitBtn);
            Toast.error(error.message || 'Erro ao enviar avaliação');
        }
    }
};

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    LivroModals.init();
});

// Exportar para uso global
window.LivroModals = LivroModals;
