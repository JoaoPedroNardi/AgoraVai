// ========================================
// CLIENTE-MODALS.JS - MODAIS PARA GESTÃO DE CLIENTES
// ========================================

const ClienteModals = {
    /**
     * Inicializa os modais de clientes
     */
    init() {
        this.criarModalNovoCliente();
        this.criarModalEditarCliente();
        this.criarModalDetalhesCliente();
        this.criarModalAlterarSenha();
        this.configurarDelegacaoAcoes();
    },

    /**
     * Modal para adicionar novo cliente
     */
    criarModalNovoCliente() {
        const formHTML = `
            <form id="form-novo-cliente">
                <div class="form-group required">
                    <label for="cliente-nome">Nome Completo</label>
                    <input type="text" id="cliente-nome" name="nome" required minlength="3">
                </div>

                <div class="form-group-inline">
                    <div class="form-group required">
                        <label for="cliente-email">E-mail</label>
                        <input type="email" id="cliente-email" name="email" required>
                    </div>

                    <div class="form-group">
                        <label for="cliente-cpf">CPF</label>
                        <input type="text" id="cliente-cpf" name="cpf" maxlength="14" placeholder="000.000.000-00">
                    </div>
                </div>

                <div class="form-group-inline">
                    <div class="form-group required">
                        <label for="cliente-senha">Senha</label>
                        <input type="password" id="cliente-senha" name="senha" required minlength="6">
                    </div>

                    <div class="form-group">
                        <label for="cliente-telefone">Telefone</label>
                        <input type="text" id="cliente-telefone" name="telefone" maxlength="15" placeholder="(00) 00000-0000">
                    </div>
                </div>

                <div class="form-group">
                    <label for="cliente-data-nascimento">Data de Nascimento</label>
                    <input type="date" id="cliente-data-nascimento" name="dtNascimento">
                </div>

                <div class="form-group">
                    <label for="cliente-endereco">Endereço</label>
                    <textarea id="cliente-endereco" name="endereco" rows="3" placeholder="Rua, número, bairro, cidade - UF"></textarea>
                </div>
            </form>
        `;

        const footerHTML = `
            <button type="button" class="btn btn-outline" data-action="close">
                Cancelar
            </button>
            <button type="button" form="form-novo-cliente" class="btn btn-gold" data-action="salvar-novo-cliente">
                <svg width="16" height="16" viewBox="0 0 24 24" style="margin-right: 0.5rem;">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" fill="none"/>
                    <circle cx="8.5" cy="7" r="4" stroke="currentColor" fill="none"/>
                    <line x1="20" y1="8" x2="20" y2="14" stroke="currentColor"/>
                    <line x1="23" y1="11" x2="17" y2="11" stroke="currentColor"/>
                </svg>
                Cadastrar Cliente
            </button>
        `;

        Modal.create(
            'modal-novo-cliente',
            '<svg width="24" height="24" viewBox="0 0 24 24" style="margin-right: 0.5rem;"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" fill="none"/><circle cx="8.5" cy="7" r="4" stroke="currentColor" fill="none"/></svg>Novo Cliente',
            formHTML,
            footerHTML
        );

        // Event listeners para máscaras
        this.aplicarMascaras('form-novo-cliente');

        // Event listener para o formulário
        document.getElementById('form-novo-cliente').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.salvarNovoCliente();
        });
    },

    /**
     * Modal para editar cliente existente
     */
    criarModalEditarCliente() {
        const formHTML = `
            <form id="form-editar-cliente">
                <input type="hidden" id="edit-cliente-id">
                
                <div class="form-group required">
                    <label for="edit-cliente-nome">Nome Completo</label>
                    <input type="text" id="edit-cliente-nome" name="nome" required minlength="3">
                </div>

                <div class="form-group-inline">
                    <div class="form-group required">
                        <label for="edit-cliente-email">E-mail</label>
                        <input type="email" id="edit-cliente-email" name="email" required>
                    </div>

                    <div class="form-group">
                        <label for="edit-cliente-cpf">CPF</label>
                        <input type="text" id="edit-cliente-cpf" name="cpf" maxlength="14" placeholder="000.000.000-00">
                    </div>
                </div>

                <div class="form-group">
                    <label for="edit-cliente-telefone">Telefone</label>
                    <input type="text" id="edit-cliente-telefone" name="telefone" maxlength="15" placeholder="(00) 00000-0000">
                </div>

                <div class="form-group">
                    <label for="edit-cliente-data-nascimento">Data de Nascimento</label>
                    <input type="date" id="edit-cliente-data-nascimento" name="dtNascimento">
                </div>

                <div class="form-group">
                    <label for="edit-cliente-endereco">Endereço</label>
                    <textarea id="edit-cliente-endereco" name="endereco" rows="3" placeholder="Rua, número, bairro, cidade - UF"></textarea>
                </div>
            </form>
        `;

        const footerHTML = `
            <button type="button" class="btn btn-outline" data-action="close">
                Cancelar
            </button>
            <button type="button" form="form-editar-cliente" class="btn btn-gold" data-action="salvar-edicao-cliente">
                <svg width="16" height="16" viewBox="0 0 24 24" style="margin-right: 0.5rem;">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" stroke="currentColor" fill="none"/>
                </svg>
                Salvar Alterações
            </button>
        `;

        Modal.create(
            'modal-editar-cliente',
            '<svg width="24" height="24" viewBox="0 0 24 24" style="margin-right: 0.5rem;"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" stroke="currentColor" fill="none"/></svg>Editar Cliente',
            formHTML,
            footerHTML
        );

        // Event listeners para máscaras
        this.aplicarMascaras('form-editar-cliente');

        // Event listener para o formulário
        document.getElementById('form-editar-cliente').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.salvarEdicaoCliente();
        });
    },

    /**
     * Modal de detalhes do cliente
     */
    criarModalDetalhesCliente() {
        const contentHTML = `
            <div id="cliente-detalhes-content">
                <!-- Conteúdo será preenchido dinamicamente -->
            </div>
        `;

        const footerHTML = `
            <button type="button" class="btn btn-outline" data-action="close">
                Fechar
            </button>
            <button type="button" class="btn btn-gold" id="btn-editar-cliente-detalhes" data-action="editar-cliente">
                <svg width="16" height="16" viewBox="0 0 24 24" style="margin-right: 0.5rem;">
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" stroke="currentColor" fill="none"/>
                </svg>
                Editar Cliente
            </button>
        `;

        Modal.create(
            'modal-detalhes-cliente',
            '<svg width="24" height="24" viewBox="0 0 24 24" style="margin-right: 0.5rem;"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" fill="none"/><circle cx="8.5" cy="7" r="4" stroke="currentColor" fill="none"/></svg>Detalhes do Cliente',
            contentHTML,
            footerHTML,
            'modal-wide'
        );
    },

    /**
     * Modal para alterar senha do cliente
     */
    criarModalAlterarSenha() {
        const formHTML = `
            <form id="form-alterar-senha">
                <input type="hidden" id="alterar-senha-cliente-id">
                <div class="form-group required">
                    <label for="nova-senha">Nova Senha</label>
                    <input type="password" id="nova-senha" name="novaSenha" required minlength="6" placeholder="Mínimo 6 caracteres">
                </div>
                <div class="form-group required">
                    <label for="confirmar-senha">Confirmar Nova Senha</label>
                    <input type="password" id="confirmar-senha" name="confirmarSenha" required minlength="6">
                </div>
                <p class="form-hint">A senha será atualizada imediatamente após confirmação.</p>
            </form>
        `;

        const footerHTML = `
            <button type="button" class="btn btn-outline" data-action="close">Cancelar</button>
            <button type="button" form="form-alterar-senha" class="btn btn-gold" data-action="salvar-alteracao-senha">
                <svg width="16" height="16" viewBox="0 0 24 24" style="margin-right: 0.5rem;">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" stroke="currentColor" fill="none"/>
                </svg>
                Alterar Senha
            </button>
        `;

        Modal.create(
            'modal-alterar-senha',
            '<svg width="24" height="24" viewBox="0 0 24 24" style="margin-right: 0.5rem;"><path d="M12 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm6-7V7a6 6 0 0 0-12 0v3H4v10h16V10h-2Zm-10 0V7a4 4 0 0 1 8 0v3H8Z"/></svg>Alterar Senha',
            formHTML,
            footerHTML
        );

        // Event listener para o formulário
        document.getElementById('form-alterar-senha').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.salvarAlteracaoSenha();
        });
    },

    /**
     * Delegação de ações nos modais via data-action
     */
    configurarDelegacaoAcoes() {
        const novoOverlay = document.getElementById('modal-novo-cliente');
        if (novoOverlay) {
            novoOverlay.addEventListener('click', (e) => {
                const btn = e.target.closest('button[data-action]');
                if (!btn) return;
                if (btn.getAttribute('data-action') === 'salvar-novo-cliente') {
                    document.getElementById('form-novo-cliente')?.requestSubmit();
                }
            });
        }

        const editarOverlay = document.getElementById('modal-editar-cliente');
        if (editarOverlay) {
            editarOverlay.addEventListener('click', (e) => {
                const btn = e.target.closest('button[data-action]');
                if (!btn) return;
                if (btn.getAttribute('data-action') === 'salvar-edicao-cliente') {
                    document.getElementById('form-editar-cliente')?.requestSubmit();
                }
            });
        }

        const alterarSenhaOverlay = document.getElementById('modal-alterar-senha');
        if (alterarSenhaOverlay) {
            alterarSenhaOverlay.addEventListener('click', (e) => {
                const btn = e.target.closest('button[data-action]');
                if (!btn) return;
                if (btn.getAttribute('data-action') === 'salvar-alteracao-senha') {
                    document.getElementById('form-alterar-senha')?.requestSubmit();
                }
            });
        }

        const detalhesOverlay = document.getElementById('modal-detalhes-cliente');
        if (detalhesOverlay) {
            detalhesOverlay.addEventListener('click', (e) => {
                const btn = e.target.closest('button[data-action]');
                if (!btn) return;
                if (btn.getAttribute('data-action') === 'editar-cliente') {
                    const idCliente = detalhesOverlay.dataset.idCliente;
                    if (idCliente) {
                        Modal.close('modal-detalhes-cliente');
                        this.abrirEditarCliente(idCliente);
                    }
                }
            });
        }
    },

    /**
     * Aplica máscaras de input
     */
    aplicarMascaras(formId) {
        const form = document.getElementById(formId);
        if (!form) return;

        // Máscara CPF
        const cpfInput = form.querySelector('input[name="cpf"]');
        if (cpfInput) {
            cpfInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length <= 11) {
                    value = value.replace(/(\d{3})(\d)/, '$1.$2');
                    value = value.replace(/(\d{3})(\d)/, '$1.$2');
                    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
                }
                e.target.value = value;
            });
        }

        // Máscara Telefone
        const telefoneInput = form.querySelector('input[name="telefone"]');
        if (telefoneInput) {
            telefoneInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length <= 11) {
                    value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
                    value = value.replace(/(\d)(\d{4})$/, '$1-$2');
                }
                e.target.value = value;
            });
        }
    },

    /**
     * Abre modal de novo cliente
     */
    abrirNovoCliente() {
        Modal.clearForm('modal-novo-cliente');
        Modal.open('modal-novo-cliente');
    },

    /**
     * Abre modal de edição com dados do cliente
     */
    async abrirEditarCliente(idCliente) {
        try {
            const cliente = await ClienteAPI.buscarPorId(idCliente);
            
            document.getElementById('edit-cliente-id').value = cliente.idPessoa;
            document.getElementById('edit-cliente-nome').value = cliente.nome;
            document.getElementById('edit-cliente-email').value = cliente.email;
            document.getElementById('edit-cliente-cpf').value = cliente.cpf || '';
            document.getElementById('edit-cliente-telefone').value = cliente.telefone || '';
            document.getElementById('edit-cliente-data-nascimento').value = cliente.dtNascimento || '';
            document.getElementById('edit-cliente-endereco').value = cliente.endereco || '';
            
            Modal.open('modal-editar-cliente');
        } catch (error) {
            UI.showError(error.message || 'Erro ao carregar dados do cliente');
        }
    },

    async abrirAlterarSenha(idCliente) {
        try {
            document.getElementById('alterar-senha-cliente-id').value = idCliente;
            document.getElementById('nova-senha').value = '';
            document.getElementById('confirmar-senha').value = '';
            Modal.open('modal-alterar-senha');
        } catch (error) {
            UI.showError(error.message || 'Falha ao abrir modal de alteração de senha');
        }
    },

    /**
     * Abre modal de detalhes
     */
    async abrirDetalhesCliente(idCliente) {
        try {
            const cliente = await ClienteAPI.buscarPorId(idCliente);
            const compras = await CompraAPI.buscarPorCliente(idCliente);
            const avaliacoes = await AvaliacaoAPI.buscarPorCliente(idCliente);
            
            const container = document.getElementById('cliente-detalhes-content');
            const iniciais = Utils.getIniciais(cliente.nome);
            // Contagens: Compras e Aluguéis (exclui CANCELADAS)
            const totalCompras = Array.isArray(compras)
                ? compras.filter(c => {
                    const tipo = String(c?.tipo ?? ((c?.livro?.vlAluguel != null) ? 'ALUGUEL' : 'COMPRA')).toUpperCase();
                    const status = String(c?.status || '').toUpperCase();
                    return tipo === 'COMPRA' && status !== 'CANCELADA';
                }).length
                : 0;
            const totalAlugueis = Array.isArray(compras)
                ? compras.filter(c => {
                    const tipo = String(c?.tipo ?? ((c?.livro?.vlAluguel != null) ? 'ALUGUEL' : 'COMPRA')).toUpperCase();
                    const status = String(c?.status || '').toUpperCase();
                    return tipo === 'ALUGUEL' && status !== 'CANCELADA';
                }).length
                : 0;
        
            let comprasHTML = '';
            if (compras && compras.length > 0) {
                comprasHTML = `
                    <div style="margin-top: 2rem; padding-top: 2rem; border-top: 1px solid #e5e7eb;">
                        <h3 style="margin-bottom: 1rem;">Histórico de Compras e Aluguéis</h3>
                        ${compras.slice(0, 5).map(compra => `
                            <div style="padding: 1rem; background: #f9fafb; border-radius: 8px; margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <strong>${compra.livro.titulo}</strong>
                                    <p style="color: #6b7280; font-size: 0.875rem;">${UI.formatDate(compra.dtInicio)}</p>
                                </div>
                                ${Utils.getStatusBadge(compra.status)}
                            </div>
                        `).join('')}
                        ${compras.length > 5 ? `<p style="text-align: center; color: #6b7280; margin-top: 1rem;">E mais ${compras.length - 5} empréstimo(s)...</p>` : ''}
                    </div>
                `;
            }
            
            let avaliacoesHTML = '';
            if (avaliacoes && avaliacoes.length > 0) {
                avaliacoesHTML = `
                    <div style="margin-top: 2rem; padding-top: 2rem; border-top: 1px solid #e5e7eb;">
                        <h3 style="margin-bottom: 1rem;">Avaliações Realizadas</h3>
                        ${avaliacoes.slice(0, 3).map(aval => `
                            <div style="padding: 1rem; background: #f9fafb; border-radius: 8px; margin-bottom: 0.5rem;">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <strong>${aval.livro.titulo}</strong>
                                    <div class="stars">${Utils.renderizarEstrelas(parseFloat(aval.nota))}</div>
                                </div>
                                <p style="color: #6b7280; font-size: 0.875rem; margin-top: 0.25rem;">${UI.formatDate(aval.dtAvaliacao)}</p>
                            </div>
                        `).join('')}
                    </div>
                `;
            }
            
            container.innerHTML = `
                <div style="display: grid; grid-template-columns: 150px 1fr; gap: 2rem;">
                    <div>
                        <div style="width: 150px; height: 150px; background: linear-gradient(135deg, #0a2342 0%, #365d7f 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 3rem; font-weight: 700;">
                            ${iniciais}
                        </div>
                    </div>
                    <div>
                        <h2 style="margin-bottom: 0.5rem; color: #0a2342;">${cliente.nome}</h2>
                        <p style="color: #6b7280; margin-bottom: 1.5rem;">Cliente desde ${UI.formatDateTime(cliente.dtCadastro)}</p>
                        
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 1.5rem;">
                            <div>
                                <span style="color: #6b7280; font-size: 0.875rem;">E-mail</span>
                                <p style="font-weight: 600;">${cliente.email}</p>
                            </div>
                            <div>
                                <span style="color: #6b7280; font-size: 0.875rem;">Telefone</span>
                                <p style="font-weight: 600;">${Utils.formatarTelefone(cliente.telefone) || 'Não informado'}</p>
                            </div>
                            <div>
                                <span style="color: #6b7280; font-size: 0.875rem;">CPF</span>
                                <p style="font-weight: 600;">${Utils.formatarCPF(cliente.cpf) || 'Não informado'}</p>
                            </div>
                            <div>
                                <span style="color: #6b7280; font-size: 0.875rem;">Data de Nascimento</span>
                                <p style="font-weight: 600;">${cliente.dtNascimento ? UI.formatDate(cliente.dtNascimento) : 'Não informado'}</p>
                            </div>
                        </div>
                        
                        ${cliente.endereco ? `
                            <div style="margin-bottom: 1.5rem;">
                                <span style="color: #6b7280; font-size: 0.875rem;">Endereço</span>
                                <p style="font-weight: 600;">${cliente.endereco}</p>
                            </div>
                        ` : ''}
                        
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-top: 1.5rem;">
                            <div style="text-align: center; padding: 1rem; background: #f9fafb; border-radius: 8px;">
                                <div style="font-size: 2rem; font-weight: 700; color: #d4af37;">${totalCompras}</div>
                                <div style="font-size: 0.875rem; color: #6b7280;">Compras</div>
                            </div>
                            <div style="text-align: center; padding: 1rem; background: #f9fafb; border-radius: 8px;">
                                <div style="font-size: 2rem; font-weight: 700; color: #d4af37;">${totalAlugueis}</div>
                                <div style="font-size: 0.875rem; color: #6b7280;">Aluguéis</div>
                            </div>
                            <div style="text-align: center; padding: 1rem; background: #f9fafb; border-radius: 8px;">
                                <div style="font-size: 2rem; font-weight: 700; color: #d4af37;">${avaliacoes.length}</div>
                                <div style="font-size: 0.875rem; color: #6b7280;">Avaliações</div>
                            </div>
                        </div>
                    </div>
                </div>
                ${comprasHTML}
                ${avaliacoesHTML}
            `;
            
            // Propagar id do cliente no overlay para ação de edição por data-action
            const overlay = document.getElementById('modal-detalhes-cliente');
            if (overlay) {
                overlay.dataset.idCliente = String(idCliente);
            }
            
            Modal.open('modal-detalhes-cliente');
        } catch (error) {
            console.error('Erro ao carregar detalhes:', error);
            Toast.error('Erro ao carregar detalhes do cliente');
        }
    },

    /**
     * Salva novo cliente
     */
    async salvarNovoCliente() {
        const form = document.getElementById('form-novo-cliente');
        const submitBtn = form.querySelector('button[type="submit"]');
    
    try {
        // VALIDAÇÕES
        const nome = document.getElementById('cliente-nome').value;
        const email = document.getElementById('cliente-email').value;
        const cpf = document.getElementById('cliente-cpf').value.replace(/\D/g, '');
        const senha = document.getElementById('cliente-senha').value;
        const telefone = document.getElementById('cliente-telefone').value.replace(/\D/g, '');
        const dtNascimento = document.getElementById('cliente-data-nascimento').value;
        
        // Validar nome
        if (nome.length < 3) {
            Toast.error('Nome deve ter no mínimo 3 caracteres');
            return;
        }
        
        // Validar email
        if (!Utils.validarEmail(email)) {
            Toast.error('Email inválido');
            return;
        }
        
        // Validar CPF (se preenchido)
        if (cpf && !Utils.validarCPF(cpf)) {
            Toast.error('CPF inválido');
            return;
        }
        
        // Validar senha
        if (senha.length < 6) {
            Toast.error('Senha deve ter no mínimo 6 caracteres');
            return;
        }
        
        // Validar data de nascimento (incompleta/inválida/futura)
        if (dtNascimento) {
            // Formato esperado ISO yyyy-MM-dd
            if (!/^\d{4}-\d{2}-\d{2}$/.test(dtNascimento)) {
                Toast.error('Data de nascimento incompleta');
                return;
            }
            const ano = parseInt(dtNascimento.slice(0, 4), 10);
            const mes = parseInt(dtNascimento.slice(5, 7), 10);
            const dia = parseInt(dtNascimento.slice(8, 10), 10);
            const dataNasc = new Date(ano, mes - 1, dia);
            if (dataNasc.getFullYear() !== ano || dataNasc.getMonth() !== (mes - 1) || dataNasc.getDate() !== dia) {
                Toast.error('Data de nascimento inválida');
                return;
            }
            const hoje = new Date();
            if (dataNasc >= hoje) {
                Toast.error('Data de nascimento inválida');
                return;
            }
            const idade = Math.floor((hoje - dataNasc) / (365.25 * 24 * 60 * 60 * 1000));
            if (idade < 13) {
                Toast.error('É necessário ter no mínimo 13 anos');
                return;
            }
        }
        
        // Validar telefone (se preenchido)
        if (telefone && telefone.length < 10) {
            Toast.error('Telefone inválido');
            return;
        }
        
        UI.showLoading(submitBtn);
        
            const cliente = {
                nome: Utils.capitalizarTodas(nome),
                email: email.toLowerCase(),
                cpf: cpf || null,
                senha: senha,
                telefone: telefone || null,
                dtNascimento: dtNascimento || null,
                endereco: document.getElementById('cliente-endereco').value || null
            };
        
        await ClienteAPI.criar(cliente);
        
        Modal.showSuccess(
            'modal-novo-cliente',
            'Cliente cadastrado com sucesso!',
            () => location.reload()
        );
    } catch (error) {
        console.error('Erro ao salvar cliente:', error);
        UI.hideLoading(submitBtn);
        Toast.error(error.message || 'Erro ao cadastrar cliente');
        }
    },

    async salvarAlteracaoSenha() {
        const form = document.getElementById('form-alterar-senha');
        const submitBtn = form.querySelector('button[type="submit"]');
        try {
            UI.showLoading(submitBtn);
            const idCliente = document.getElementById('alterar-senha-cliente-id').value;
            const novaSenha = document.getElementById('nova-senha').value;
            const confirmar = document.getElementById('confirmar-senha').value;

            if (!novaSenha || novaSenha.length < 6) {
                UI.hideLoading(submitBtn);
                Toast.error('A nova senha deve ter pelo menos 6 caracteres');
                return;
            }
            if (novaSenha !== confirmar) {
                UI.hideLoading(submitBtn);
                Toast.error('A confirmação de senha não confere');
                return;
            }

            // Alguns backends exigem payload completo no PUT.
            // Buscar dados atuais do cliente e enviar todos os campos com a nova senha.
            const atual = await ClienteAPI.buscarPorId(idCliente);
            const payloadCompleto = {
                nome: atual?.nome || '',
                email: atual?.email || '',
                cpf: (atual?.cpf || '').toString().replace(/\D/g, ''),
                telefone: (atual?.telefone || '').toString().replace(/\D/g, ''),
                dtNascimento: atual?.dtNascimento || null,
                endereco: atual?.endereco || '',
                senha: novaSenha
            };

            await ClienteAPI.atualizar(idCliente, payloadCompleto);

            Modal.showSuccess(
                'modal-alterar-senha',
                'Senha alterada com sucesso!',
                () => {
                    try {
                        window.dispatchEvent(new CustomEvent('senha-alterada', { detail: { idCliente } }));
                    } catch (err) {
                        console.warn('Falha ao emitir evento de senha alterada', err);
                    }
                }
            );
        } catch (error) {
            UI.hideLoading(submitBtn);
            Toast.error(error.message || 'Erro ao alterar senha');
        }
    },
    /**
     * Salva edição de cliente
     */
    async salvarEdicaoCliente() {
        const form = document.getElementById('form-editar-cliente');
        const submitBtn = form.querySelector('button[type="submit"]');
        
        try {
            UI.showLoading(submitBtn);
            
            const idCliente = document.getElementById('edit-cliente-id').value;
            
            const cliente = {
                nome: document.getElementById('edit-cliente-nome').value,
                email: document.getElementById('edit-cliente-email').value,
                cpf: document.getElementById('edit-cliente-cpf').value.replace(/\D/g, ''),
                telefone: document.getElementById('edit-cliente-telefone').value.replace(/\D/g, ''),
                dtNascimento: document.getElementById('edit-cliente-data-nascimento').value || null,
                endereco: document.getElementById('edit-cliente-endereco').value
            };

            // Validar data de nascimento (se preenchida): formato/validez/não futura e idade mínima >= 12
            if (cliente.dtNascimento) {
                if (!/^\d{4}-\d{2}-\d{2}$/.test(cliente.dtNascimento)) {
                    UI.hideLoading(submitBtn);
                    Toast.error('Data de nascimento incompleta');
                    return;
                }
                const ano = parseInt(cliente.dtNascimento.slice(0, 4), 10);
                const mes = parseInt(cliente.dtNascimento.slice(5, 7), 10);
                const dia = parseInt(cliente.dtNascimento.slice(8, 10), 10);
                const dataNasc = new Date(ano, mes - 1, dia);
                if (dataNasc.getFullYear() !== ano || dataNasc.getMonth() !== (mes - 1) || dataNasc.getDate() !== dia) {
                    UI.hideLoading(submitBtn);
                    Toast.error('Data de nascimento inválida');
                    return;
                }
                const hoje = new Date();
                if (dataNasc >= hoje) {
                    UI.hideLoading(submitBtn);
                    Toast.error('Data de nascimento inválida');
                    return;
                }
                const idade = Math.floor((hoje - dataNasc) / (365.25 * 24 * 60 * 60 * 1000));
                if (idade < 12) {
                    UI.hideLoading(submitBtn);
                    Toast.error('É necessário ter no mínimo 12 anos');
                    return;
                }
            }
            
            // Não enviar senha em atualização de dados pessoais.
            // Fluxo de troca de senha será realizado em modal/endpoint próprio.
            
            const clienteAtualizado = await ClienteAPI.atualizar(idCliente, cliente);
            
            Modal.showSuccess(
                'modal-editar-cliente',
                'Cliente atualizado com sucesso!',
                () => {
                    try {
                        window.dispatchEvent(new CustomEvent('cliente-atualizado', { detail: clienteAtualizado }));
                    } catch (e) {
                        console.warn('Falha ao despachar evento cliente-atualizado', e);
                    }
                }
            );
        } catch (error) {
            console.error('Erro ao atualizar cliente:', error);
            UI.hideLoading(submitBtn);
            Toast.error(error.message || 'Erro ao atualizar cliente');
        }
    }
};

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    ClienteModals.init();
});

// Exportar para uso global
window.ClienteModals = ClienteModals;
