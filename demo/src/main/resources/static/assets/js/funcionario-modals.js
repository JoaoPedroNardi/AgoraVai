// ========================================
// FUNCIONARIO-MODALS.JS - MODAIS PARA GESTÃO DE FUNCIONÁRIOS
// ========================================

const FuncionarioModals = {
    init() {
        this.criarModalNovoFuncionario();
        this.criarModalEditarFuncionario();
        const btnNovo = document.getElementById('btn-novo-funcionario');
        if (btnNovo) {
            btnNovo.addEventListener('click', (e) => {
                e.preventDefault();
                this.abrirNovoFuncionario();
            });
        }
    },

    criarModalNovoFuncionario() {
        const formHTML = `
            <form id="form-novo-funcionario">
                <div class="form-group required">
                    <label for="func-nome">Nome Completo</label>
                    <input type="text" id="func-nome" name="nome" required minlength="3">
                </div>

                <div class="form-group-inline">
                    <div class="form-group required">
                        <label for="func-email">E-mail</label>
                        <input type="email" id="func-email" name="email" required>
                    </div>

                    <div class="form-group">
                        <label for="func-cpf">CPF</label>
                        <input type="text" id="func-cpf" name="cpf" maxlength="14" placeholder="000.000.000-00">
                    </div>
                </div>

                <div class="form-group-inline">
                    <div class="form-group required">
                        <label for="func-senha">Senha</label>
                        <input type="password" id="func-senha" name="senha" required minlength="6">
                    </div>

                    <div class="form-group">
                        <label for="func-telefone">Telefone</label>
                        <input type="text" id="func-telefone" name="telefone" maxlength="15" placeholder="(00) 00000-0000">
                    </div>
                </div>

                <div class="form-group">
                    <label for="func-dtNascimento">Data de Nascimento</label>
                    <input type="text" id="func-dtNascimento" name="dtNascimento" maxlength="10" placeholder="dd/mm/aaaa">
                </div>

                <div class="form-group">
                    <label for="func-endereco">Endereço</label>
                    <textarea id="func-endereco" name="endereco" rows="3" placeholder="Rua, número, bairro, cidade - UF"></textarea>
                </div>
            </form>
        `;

        const footerHTML = `
            <button type="button" class="btn btn-outline" data-action="close">Cancelar</button>
            <button type="submit" form="form-novo-funcionario" class="btn btn-gold" data-action="salvar-novo-funcionario">
                <svg width="16" height="16" viewBox="0 0 24 24" style="margin-right: 0.5rem;">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" fill="none"/>
                    <circle cx="8.5" cy="7" r="4" stroke="currentColor" fill="none"/>
                    <line x1="20" y1="8" x2="20" y2="14" stroke="currentColor"/>
                    <line x1="23" y1="11" x2="17" y2="11" stroke="currentColor"/>
                </svg>
                Cadastrar Funcionário
            </button>
        `;

        Modal.create(
            'modal-novo-funcionario',
            '<svg width="24" height="24" viewBox="0 0 24 24" style="margin-right: 0.5rem;"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="currentColor" fill="none"/><circle cx="9" cy="7" r="4" stroke="currentColor" fill="none"/></svg>Novo Funcionário',
            formHTML,
            footerHTML
        );

        const form = document.getElementById('form-novo-funcionario');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.salvarNovoFuncionario();
        });

        // Máscaras de entrada
        const cpfInput = document.getElementById('func-cpf');
        const telInput = document.getElementById('func-telefone');
        if (cpfInput) cpfInput.addEventListener('input', () => { cpfInput.value = FuncionarioModals.formatCpf(cpfInput.value); });
        if (telInput) telInput.addEventListener('input', () => { telInput.value = FuncionarioModals.formatPhone(telInput.value); });

        const overlay = document.getElementById('modal-novo-funcionario');
        overlay.addEventListener('click', (ev) => {
            const btn = ev.target.closest('[data-action]');
            if (!btn) return;
            const action = btn.dataset.action;
            if (action === 'salvar-novo-funcionario') {
                form && form.requestSubmit();
            }
        });
    },

    abrirNovoFuncionario() {
        Modal.open('modal-novo-funcionario');
    },

    async salvarNovoFuncionario() {
        const submitBtn = document.querySelector('#modal-novo-funcionario .modal-footer .btn.btn-gold');
        UI.showLoading(submitBtn);

        try {
            const nome = document.getElementById('func-nome').value.trim();
            const email = document.getElementById('func-email').value.trim();
            const senha = document.getElementById('func-senha').value;
            const cpf = (document.getElementById('func-cpf').value || '').replace(/\D/g, '');
            const telefone = (document.getElementById('func-telefone').value || '').replace(/\D/g, '');
            const dtMask = (document.getElementById('func-dtNascimento').value || '').trim();
            let dtNascimento = null;
            if (dtMask) {
                // Validação de formato completo dd/mm/aaaa
                if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dtMask)) {
                    UI.hideLoading(submitBtn);
                    throw new Error('Data de nascimento incompleta');
                }
                const dia = parseInt(dtMask.slice(0, 2), 10);
                const mes = parseInt(dtMask.slice(3, 5), 10);
                const ano = parseInt(dtMask.slice(6, 10), 10);
                const d = new Date(ano, mes - 1, dia);
                if (d.getFullYear() !== ano || d.getMonth() !== (mes - 1) || d.getDate() !== dia) {
                    UI.hideLoading(submitBtn);
                    throw new Error('Data de nascimento inválida');
                }
                dtNascimento = `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
            }
            const endereco = document.getElementById('func-endereco').value || null;

            // Validações básicas
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!nome || nome.length < 3) { throw new Error('Informe um nome válido (3+ caracteres)'); }
            if (!emailRegex.test(email)) { throw new Error('Email inválido'); }
            if (!senha || senha.length < 6) { throw new Error('A senha deve ter no mínimo 6 caracteres'); }
            if (dtNascimento && new Date(dtNascimento) > new Date()) { throw new Error('Data de nascimento não pode ser futura'); }

            const funcionario = { nome, email, senha };
            if (cpf) funcionario.cpf = cpf;
            if (telefone) funcionario.telefone = telefone;
            if (endereco) funcionario.endereco = endereco;
            if (dtNascimento) funcionario.dtNascimento = dtNascimento; // YYYY-MM-DD

            await FuncionarioAPI.criar(funcionario);

            Modal.close('modal-novo-funcionario');
            UI.hideLoading(submitBtn);
            UI.showSuccess('Funcionário cadastrado com sucesso!');
            try { await carregarFuncionarios(); } catch (e) {}
        } catch (error) {
            console.error('Erro ao cadastrar funcionário:', error);
            UI.hideLoading(submitBtn);
            UI.showError(error.message || 'Erro ao cadastrar funcionário');
        }
    }
    ,
    criarModalEditarFuncionario() {
        const formHTML = `
            <form id="form-editar-funcionario">
                <div class="form-group required">
                    <label for="edit-nome">Nome Completo</label>
                    <input type="text" id="edit-nome" name="nome" required minlength="3">
                </div>

                <div class="form-group-inline">
                    <div class="form-group required">
                        <label for="edit-email">E-mail</label>
                        <input type="email" id="edit-email" name="email" required>
                    </div>

                    <div class="form-group">
                        <label for="edit-cpf">CPF</label>
                        <input type="text" id="edit-cpf" name="cpf" maxlength="14" placeholder="000.000.000-00">
                    </div>
                </div>

                <div class="form-group-inline">
                    <div class="form-group">
                        <label for="edit-telefone">Telefone</label>
                        <input type="text" id="edit-telefone" name="telefone" maxlength="15" placeholder="(00) 00000-0000">
                    </div>

                    <div class="form-group">
                        <label for="edit-dtNascimento">Data de Nascimento</label>
                        <input type="text" id="edit-dtNascimento" name="dtNascimento" maxlength="10" placeholder="dd/mm/aaaa">
                    </div>
                </div>

                <div class="form-group">
                    <label for="edit-endereco">Endereço</label>
                    <textarea id="edit-endereco" name="endereco" rows="3" placeholder="Rua, número, bairro, cidade - UF"></textarea>
                </div>
            </form>
        `;

        const footerHTML = `
            <button type="button" class="btn btn-outline" data-action="close">Cancelar</button>
            <button type="submit" form="form-editar-funcionario" class="btn btn-gold" data-action="salvar-edicao-funcionario">
                <svg width="16" height="16" viewBox="0 0 24 24" style="margin-right: 0.5rem;">
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" fill="currentColor"/>
                </svg>
                Salvar Alterações
            </button>
        `;

        Modal.create(
            'modal-editar-funcionario',
            '<svg width="24" height="24" viewBox="0 0 24 24" style="margin-right: 0.5rem;"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>Editar Funcionário',
            formHTML,
            footerHTML
        );

        const form = document.getElementById('form-editar-funcionario');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = form.dataset.idFuncionario ? Number(form.dataset.idFuncionario) : null;
            if (!id) return UI.showWarning('ID do funcionário não encontrado');
            await this.salvarEdicaoFuncionario(id);
        });

        // Máscaras de entrada
        const cpfEdit = document.getElementById('edit-cpf');
        const telEdit = document.getElementById('edit-telefone');
        if (cpfEdit) cpfEdit.addEventListener('input', () => { cpfEdit.value = FuncionarioModals.formatCpf(cpfEdit.value); });
        if (telEdit) telEdit.addEventListener('input', () => { telEdit.value = FuncionarioModals.formatPhone(telEdit.value); });

        const overlay = document.getElementById('modal-editar-funcionario');
        overlay.addEventListener('click', (ev) => {
            const btn = ev.target.closest('[data-action]');
            if (!btn) return;
            const action = btn.dataset.action;
            if (action === 'salvar-edicao-funcionario') {
                form && form.requestSubmit();
            }
        });
    },

    async abrirEditarFuncionario(idFuncionario) {
        try {
            const funcionario = await FuncionarioAPI.buscarPorId(idFuncionario);
            const form = document.getElementById('form-editar-funcionario');
            if (!form) return;
            form.dataset.idFuncionario = String(idFuncionario);
            document.getElementById('edit-nome').value = funcionario?.nome || '';
            document.getElementById('edit-email').value = funcionario?.email || '';
            document.getElementById('edit-cpf').value = funcionario?.cpf || '';
            document.getElementById('edit-telefone').value = funcionario?.telefone || '';
            document.getElementById('edit-endereco').value = funcionario?.endereco || '';
            const dt = funcionario?.dtNascimento ? funcionario.dtNascimento.substring(0,10) : '';
            document.getElementById('edit-dtNascimento').value = dt ? `${dt.slice(8,10)}/${dt.slice(5,7)}/${dt.slice(0,4)}` : '';
            Modal.open('modal-editar-funcionario');
        } catch (error) {
            console.error('Erro ao abrir edição de funcionário:', error);
            UI.showError('Erro ao carregar dados do funcionário');
        }
    },

    async salvarEdicaoFuncionario(idFuncionario) {
        const submitBtn = document.querySelector('#modal-editar-funcionario .modal-footer .btn.btn-gold');
        UI.showLoading(submitBtn);
        try {
            const nome = document.getElementById('edit-nome').value.trim();
            const email = document.getElementById('edit-email').value.trim();
            const cpf = (document.getElementById('edit-cpf').value || '').replace(/\D/g, '');
            const telefone = (document.getElementById('edit-telefone').value || '').replace(/\D/g, '');
            const dtMask = (document.getElementById('edit-dtNascimento').value || '').trim();
            let dtNascimento = null;
            if (dtMask) {
                // Validação de formato completo dd/mm/aaaa
                if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dtMask)) {
                    UI.hideLoading(submitBtn);
                    throw new Error('Data de nascimento incompleta');
                }
                const dia = parseInt(dtMask.slice(0, 2), 10);
                const mes = parseInt(dtMask.slice(3, 5), 10);
                const ano = parseInt(dtMask.slice(6, 10), 10);
                const d = new Date(ano, mes - 1, dia);
                if (d.getFullYear() !== ano || d.getMonth() !== (mes - 1) || d.getDate() !== dia) {
                    UI.hideLoading(submitBtn);
                    throw new Error('Data de nascimento inválida');
                }
                dtNascimento = `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
            }
            const endereco = document.getElementById('edit-endereco').value || null;

            // Validações básicas
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!nome || nome.length < 3) { throw new Error('Informe um nome válido (3+ caracteres)'); }
            if (!emailRegex.test(email)) { throw new Error('Email inválido'); }
            if (dtNascimento && new Date(dtNascimento) > new Date()) { throw new Error('Data de nascimento não pode ser futura'); }

            const dto = { nome, email };
            if (cpf) dto.cpf = cpf;
            if (telefone) dto.telefone = telefone;
            if (endereco) dto.endereco = endereco;
            if (dtNascimento) dto.dtNascimento = dtNascimento; // YYYY-MM-DD

            const atualizado = await FuncionarioAPI.atualizar(idFuncionario, dto);

            Modal.close('modal-editar-funcionario');
            UI.hideLoading(submitBtn);
            UI.showSuccess('Funcionário atualizado com sucesso!');
            try { await carregarFuncionarios(); } catch (e) {}
            // Dispara evento para quem quiser atualizar linha pontual
            window.dispatchEvent(new CustomEvent('funcionario-atualizado', { detail: atualizado }));
        } catch (error) {
            console.error('Erro ao atualizar funcionário:', error);
            UI.hideLoading(submitBtn);
            UI.showError(error.message || 'Erro ao atualizar funcionário');
        }
    }
    ,
    // Utilidades de máscara
    formatCpf(v) {
        const digits = (v || '').replace(/\D/g, '').slice(0, 11);
        let r = '';
        for (let i = 0; i < digits.length; i++) {
            r += digits[i];
            if (i === 2 || i === 5) r += '.';
            if (i === 8) r += '-';
        }
        return r;
    },
    formatPhone(v) {
        const d = (v || '').replace(/\D/g, '').slice(0, 11);
        if (d.length <= 10) {
            return d.replace(/(\d{0,2})(\d{0,4})(\d{0,4})/, (m, a, b, c) => {
                let s = '';
                if (a) s += `(${a}` + (a.length === 2 ? ')' : '');
                if (b) s += (s ? ' ' : '') + b + (b.length === 4 ? '-' : '');
                if (c) s += c;
                return s;
            });
        }
        return d.replace(/(\d{0,2})(\d{0,5})(\d{0,4})/, (m, a, b, c) => {
            let s = '';
            if (a) s += `(${a}` + (a.length === 2 ? ')' : '');
            if (b) s += (s ? ' ' : '') + b + (b.length === 5 ? '-' : '');
            if (c) s += c;
            return s;
        });
    }
};

// Inicializar ao carregar DOM
document.addEventListener('DOMContentLoaded', () => {
    FuncionarioModals.init();
    // Máscara para data nos inputs, caso estejam presentes
    const dtNovo = document.getElementById('func-dtNascimento');
    const dtEdit = document.getElementById('edit-dtNascimento');
    if (dtNovo) dtNovo.addEventListener('input', () => { dtNovo.value = (dtNovo.value || '').replace(/\D/g, '').replace(/(\d{0,2})(\d{0,2})(\d{0,4})/, (m, a, b, c) => { let s=''; if (a) s+= a + (a.length===2?'/':''); if (b) s+= b + (b.length===2?'/':''); if (c) s+= c; return s; }); });
    if (dtEdit) dtEdit.addEventListener('input', () => { dtEdit.value = (dtEdit.value || '').replace(/\D/g, '').replace(/(\d{0,2})(\d{0,2})(\d{0,4})/, (m, a, b, c) => { let s=''; if (a) s+= a + (a.length===2?'/':''); if (b) s+= b + (b.length===2?'/':''); if (c) s+= c; return s; }); });
});

// Exportar global
window.FuncionarioModals = FuncionarioModals;