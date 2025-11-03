// ========================================
// ADMIN.JS - PAINEL DO ADMINISTRADOR
// ========================================

document.addEventListener('DOMContentLoaded', async () => {
    const user = Auth.getUser();
    if (!Auth.isLoggedIn() || !user || user.role !== 'ADMIN') {
        window.location.href = '/pages/login.html';
        return;
    }

    const userId = Auth.getUserId();
    await inicializarPainel(userId);
    configurarDelegacaoAcoesAdmin();
});

function configurarDelegacaoAcoesAdmin() {
    const map = [
        { selector: '#tab-compras', handler: handleComprasClick },
        { selector: '#tab-clientes', handler: handleClientesClick },
        { selector: '#tab-avaliacoes', handler: handleAvaliacoesClick },
        { selector: '#tab-livros', handler: handleLivrosClick },
        { selector: '#tab-funcionarios', handler: handleFuncionariosClick }
    ];
    map.forEach(({ selector, handler }) => {
        const root = document.querySelector(selector);
        if (root) {
            root.addEventListener('click', handler);
        }
    });
}

function findActionButton(e) {
    return e.target.closest('button[data-action]');
}

function handleComprasClick(e) {
    const btn = findActionButton(e);
    if (!btn) return;
    const id = parseInt(btn.getAttribute('data-id-compra'), 10);
    switch (btn.getAttribute('data-action')) {
        case 'ver-compra':
            verDetalhesCompra(id);
            break;
        case 'deletar-compra':
            deletarCompra(id);
            break;
    }
}

function handleClientesClick(e) {
    const btn = findActionButton(e);
    if (!btn) return;
    const id = parseInt(btn.getAttribute('data-id-cliente'), 10);
    switch (btn.getAttribute('data-action')) {
        case 'novo-cliente':
            if (typeof ClienteModals !== 'undefined') {
                ClienteModals.abrirNovoCliente();
            } else {
                UI.showInfo('MÃ³dulo de clientes nÃ£o carregado');
            }
            break;
        case 'editar-cliente':
            editarCliente(id);
            break;
        case 'deletar-cliente':
            deletarCliente(id);
            break;
        case 'ver-cliente':
            verDetalhesCliente(id);
            break;
    }
}

function handleAvaliacoesClick(e) {
    const btn = findActionButton(e);
    if (!btn) return;
    const id = parseInt(btn.getAttribute('data-id-avaliacao'), 10);
    if (btn.getAttribute('data-action') === 'deletar-avaliacao') {
        deletarAvaliacao(id);
    }
}

function handleLivrosClick(e) {
    // Verificar se Ã© o botÃ£o "Novo Livro"
    if (e.target.id === 'btn-novo-livro' || e.target.closest('#btn-novo-livro')) {
        LivroModals.abrirNovoLivro();
        return;
    }
    
    const btn = findActionButton(e);
    if (!btn) return;
    const id = parseInt(btn.getAttribute('data-id-livro'), 10);
    switch (btn.getAttribute('data-action')) {
        case 'editar-livro':
            editarLivro(id);
            break;
        case 'deletar-livro':
            deletarLivro(id);
            break;
    }
}

function handleFuncionariosClick(e) {
    const btn = findActionButton(e);
    if (!btn) return;
    const id = parseInt(btn.getAttribute('data-id-funcionario'), 10);
    switch (btn.getAttribute('data-action')) {
        case 'editar-funcionario':
            editarFuncionario(id);
            break;
        case 'deletar-funcionario':
            deletarFuncionario(id);
            break;
    }
}

async function inicializarPainel(userId) {
    const funcoes = [
        { nome: 'Dados Admin', fn: () => carregarDadosAdmin(userId) },
        { nome: 'Compras', fn: carregarCompras },
        { nome: 'Clientes', fn: carregarClientes },
        { nome: 'AvaliaÃ§Ãµes', fn: carregarAvaliacoes },
        { nome: 'Livros', fn: carregarLivros },
        { nome: 'FuncionÃ¡rios', fn: carregarFuncionarios }
    ];
    
    // Configurar pesquisa de livros
    configurarPesquisaLivros();
    configurarPesquisaClientes();
    configurarPesquisaFuncionarios();
    for (const { nome, fn } of funcoes) {
        try {
            await fn();
        } catch (error) {
            console.error(`Erro ao carregar ${nome}:`, error);
        }
    }
    
    // Inicializar modais de livros
    if (typeof LivroModals !== 'undefined') {
        LivroModals.init();
    }
}

function configurarPesquisaClientes() {
    const input = document.querySelector('#tab-clientes .search-input');
    if (!input) return;
    input.addEventListener('input', () => filtrarClientes(input.value));
}

function filtrarClientes(query) {
    const q = (query || '').toLowerCase().trim();
    const rows = document.querySelectorAll('#tab-clientes tbody tr');
    rows.forEach(row => {
        const idText = row.querySelector('td:nth-child(1) .subtext')?.textContent?.toLowerCase() || '';
        const nomeText = row.querySelector('td:nth-child(2)')?.textContent?.toLowerCase() || '';
        const contatoText = row.querySelector('td:nth-child(3)')?.textContent?.toLowerCase() || '';
        const matches = !q || idText.includes(q) || nomeText.includes(q) || contatoText.includes(q);
        row.style.display = matches ? '' : 'none';
    });
}

function configurarPesquisaLivros() {
    const searchInput = document.querySelector('#search-livros');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const termo = e.target.value.toLowerCase().trim();
            filtrarLivros(termo);
        });
    }
}

function filtrarLivros(termo) {
    const tbody = document.querySelector('#tab-livros tbody');
    if (!tbody) return;
    
    const rows = tbody.querySelectorAll('tr');
    
    rows.forEach(row => {
        if (row.cells.length === 1) return; // Linha de estado vazio
        
        const titulo = row.cells[1]?.textContent.toLowerCase() || '';
        const autor = row.cells[1]?.querySelector('.subtext')?.textContent.toLowerCase() || '';
        const genero = row.cells[2]?.textContent.toLowerCase() || '';
        
        const match = titulo.includes(termo) || autor.includes(termo) || genero.includes(termo);
        row.style.display = match ? '' : 'none';
    });
}

async function carregarDadosAdmin(userId) {
    try {
        const admin = await AdminAPI.buscarPorId(userId);
        atualizarInfoAdmin(admin);
    } catch (error) {
        console.error('Erro ao carregar dados do admin:', error);
        const infoCard = document.querySelector('#tab-informacoes .info-card .card-content');
        if (infoCard) {
            // Tentar fallback com dados bÃ¡sicos do usuÃ¡rio autenticado
            const user = (typeof Auth !== 'undefined') ? Auth.getUser() : null;
            if (user) {
                try {
                    atualizarInfoAdmin({
                        nome: user.nome,
                        email: user.email,
                        idPessoa: Number(user.userId || Auth.getUserId()),
                        telefone: null
                    });
                } catch (e) {
                    infoCard.innerHTML = '<div class="subtext" style="padding:1rem; color: var(--muted-foreground);">Erro ao carregar dados do administrador.</div>';
                }
            } else {
                infoCard.innerHTML = '<div class="subtext" style="padding:1rem; color: var(--muted-foreground);">Erro ao carregar dados do administrador.</div>';
            }
        }
    }
}

function atualizarInfoAdmin(admin) {
    const infoCard = document.querySelector('#tab-informacoes .info-card .card-content');
    if (!infoCard || !admin) return;
    
    const id = (admin.idPessoa ?? admin.userId ?? (typeof Auth !== 'undefined' ? Number(Auth.getUserId()) : 0)) || 0;
    const telefoneFmt = (admin.telefone && typeof admin.telefone === 'string') ? (Utils.formatarTelefone(admin.telefone) || 'NÃ£o informado') : 'NÃ£o informado';
    
    infoCard.innerHTML = `
        <div class="info-item"><label>Nome</label><p>${admin.nome || '-'}</p></div>
        <div class="info-item"><label>Email</label><p>${admin.email || '-'}</p></div>
        <div class="info-item"><label>Telefone</label><p>${telefoneFmt}</p></div>
        <div class="info-item"><label>Data de Nascimento</label><p>${admin.dtNascimento ? UI.formatDate(admin.dtNascimento) : 'NÃ£o informado'}</p></div>
        <div class="info-item"><label>MatrÃ­cula</label><p>ADM${String(id).padStart(3, '0')}</p></div>
        <div class="info-item"><label>Cargo</label><p>Administrador do Sistema</p></div>
        <div class="info-item"><label>NÃ­vel de Acesso</label><p><span class="badge badge-ativo">Total</span></p></div>
    `;
}

// Removido fallback de dados de teste

async function carregarCompras() {
    const tbody = document.querySelector('#tab-compras tbody');
    if (!tbody) return;
    // Mostrar skeleton enquanto carrega
    mostrarSkeletonTabela(tbody, 8, 5);
    
    try {
        const compras = await CompraAPI.listarTodas();
        const filtradas = aplicarFiltrosComprasAdmin(compras);
        renderizarCompras(tbody, filtradas);
    } catch (error) {
        console.error('Erro ao carregar compras:', error);
        mostrarErroTabela(tbody, 8, 'compras');
    }
}

function aplicarFiltrosComprasAdmin(compras) {
    const selectStatus = document.getElementById('filtro-status-admin');
    const selectTipo = document.getElementById('filtro-tipo-admin');
    const statusSel = selectStatus ? String(selectStatus.value || '').toUpperCase() : '';
    const tipoSel = selectTipo ? String(selectTipo.value || '').toUpperCase() : '';

    return (compras || []).filter(c => {
        const tipoRaw = c?.tipo ? String(c.tipo).toUpperCase() : null;
        const tipo = (tipoRaw === 'COMPRA' || tipoRaw === 'ALUGUEL')
            ? tipoRaw
            : ((c.livro?.vlAluguel != null) ? 'ALUGUEL' : 'COMPRA');
        const rawStatus = c?.status ? String(c.status).toUpperCase() : '';
        // Para filtro: tratar COMPRA com status PENDENTE como FINALIZADA (nÃ£o deve aparecer em "Pendente")
        const status = (rawStatus === 'PENDENTE' && tipo === 'COMPRA') ? 'FINALIZADA' : rawStatus;
        const okStatus = !statusSel || status === statusSel;
        const okTipo = !tipoSel || tipo === tipoSel;
        return okStatus && okTipo;
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const s1 = document.getElementById('filtro-status-admin');
    const s2 = document.getElementById('filtro-tipo-admin');
    [s1, s2].forEach(sel => sel && sel.addEventListener('change', carregarCompras));
});

function renderizarCompras(tbody, compras) {
    tbody.innerHTML = '';
    
    if (!compras || compras.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 2rem; color: var(--muted-foreground);">Nenhuma compra registrada</td></tr>';
        return;
    }
    
    compras.forEach(compra => {
        const tipoRaw = compra?.tipo ? String(compra.tipo).trim().toUpperCase() : null;
        const tipo = (tipoRaw === 'COMPRA' || tipoRaw === 'ALUGUEL')
            ? tipoRaw
            : ((compra.livro?.vlAluguel != null) ? 'ALUGUEL' : 'COMPRA');
        const modo = tipo === 'ALUGUEL' ? 'Aluguel' : 'Compra';
        const isAluguel = tipo === 'ALUGUEL';
        // Dias restantes: para ALUGUEL, considerar dtFim se existir (inclui renovaÃ§Ãµes);
        // se nÃ£o houver dtFim, calcular por dtInicio + 30. NÃ£o exibir para finalizada/cancelada.
        const stTable = String(compra.status || '').toUpperCase();
        const dtFinalCalc = isAluguel
            ? (compra.dtFim || (compra.dtInicio ? Utils.calcularDataDevolucao(compra.dtInicio, 30) : null))
            : (compra.dtFim || null);
        const diasRestante = (isAluguel && dtFinalCalc && stTable !== 'FINALIZADA' && stTable !== 'CANCELADA')
            ? (() => {
                const fim = Utils.parseDateOnly(dtFinalCalc);
                if (!fim || Number.isNaN(fim.getTime())) return 0;
                const hoje = new Date();
                const hojeLocal = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
                const msDia = 1000 * 60 * 60 * 24;
                return Math.max(0, Math.ceil((fim - hojeLocal) / msDia));
            })()
            : 0;
        const valor = (isAluguel && compra.livro?.vlAluguel != null)
            ? UI.formatCurrency(compra.livro.vlAluguel)
            : (compra.livro?.vlCompra != null ? UI.formatCurrency(compra.livro.vlCompra) : UI.formatCurrency(0));

        let displayStatus = 'Finalizada';
        if (String(compra.status).toUpperCase() === 'CANCELADA') displayStatus = 'Cancelada';
        else if (String(compra.status).toUpperCase() === 'FINALIZADA') displayStatus = 'Finalizada';
        else if (String(compra.status).toUpperCase() === 'PENDENTE') displayStatus = (isAluguel) ? 'Ativa' : 'Finalizada';
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><div class="subtext">CMP${String(compra.idCompra).padStart(3, '0')}</div></td>
            <td>${compra.cliente.nome}<div class="subtext">ID: ${compra.cliente.idPessoa}</div></td>
            <td>${compra.livro.titulo}<div class="subtext">${compra.livro.autor}</div></td>
            <td>${valor}</td>
            <td>${diasRestante}</td>
            <td>${Utils.getModoBadge(modo)}</td>
            <td>${Utils.getStatusBadgeLabel(displayStatus)}</td>
            <td>
                <div class="action-buttons" style="display: flex; gap: 0.5rem;">
                    <button class="btn btn-outline btn-sm" data-action="ver-compra" data-id-compra="${compra.idCompra}">
                        Ver Detalhes
                    </button>
                    <button class="btn btn-icon btn-danger" data-action="deletar-compra" data-id-compra="${compra.idCompra}">
                        <svg width="16" height="16" viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a 2 2 0 0 1 2 2v2"/></svg>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function finalizarCompra(idCompra) {
    if (!UI.confirm('Confirmar finalizaÃ§Ã£o da compra?')) return;
    
    try {
        await CompraAPI.finalizar(idCompra);
        UI.showSuccess('Compra finalizada com sucesso!');
        await carregarCompras();
    } catch (error) {
        console.error('Erro ao finalizar compra:', error);
        UI.showError('Erro ao finalizar compra');
    }
}

// Placeholder para ediÃ§Ã£o de compra no Admin (evita ReferenceError)
function editarCompra(idCompra) {
    UI.showInfo('Funcionalidade de ediÃ§Ã£o de compra (Admin) em desenvolvimento');
}

async function verDetalhesCompra(idCompra) {
    try {
        const compra = await CompraAPI.buscarPorId(idCompra);
        if (!compra) {
            UI.showError('Compra nÃ£o encontrada');
            return;
        }

        // Tipo: prioriza o valor retornado pela API; se ausente, faz fallback pelo livro
        const tipoRaw = compra?.tipo ? String(compra.tipo).trim().toUpperCase() : null;
        const tipo = (tipoRaw === 'COMPRA' || tipoRaw === 'ALUGUEL')
            ? tipoRaw
            : ((compra.livro?.vlAluguel != null) ? 'ALUGUEL' : 'COMPRA');
        const modo = tipo === 'ALUGUEL' ? 'Aluguel' : 'Compra';
        const isAluguel = tipo === 'ALUGUEL';
        const st = String(compra.status || '').toUpperCase();
        let displayStatus = 'Finalizada';
        if (st === 'CANCELADA') displayStatus = 'Cancelada';
        else if (st === 'FINALIZADA') displayStatus = 'Finalizada';
        else if (st === 'PENDENTE') displayStatus = (modo === 'Aluguel') ? 'Ativa' : 'Finalizada';

        const idFmt = `CMP${String(compra.idCompra).padStart(3, '0')}`;
        const dtInicio = compra.dtInicio ? UI.formatDate(compra.dtInicio) : '-';
        // Para ALUGUEL: se dtFim nÃ£o vier, calcular como dtInicio + 30 dias
        const dtFimBase = isAluguel
            ? (compra.dtFim || (compra.dtInicio ? Utils.calcularDataDevolucao(compra.dtInicio, 30) : null))
            : (compra.dtFim || null);
        const dtFim = dtFimBase ? UI.formatDate(dtFimBase) : '-';
        // Dias restantes: apenas para ALUGUEL e nÃ£o finalizada/cancelada.
        // Usar a data de fim efetiva (dtFim ou dtInicio + 30), incluindo renovaÃ§Ãµes.
        const diasRestantes = (isAluguel && st !== 'FINALIZADA' && st !== 'CANCELADA')
            ? (() => {
                const dtFinalCalc = isAluguel
                    ? (compra.dtFim || (compra.dtInicio ? Utils.calcularDataDevolucao(compra.dtInicio, 30) : null))
                    : (compra.dtFim || null);
                const fim = Utils.parseDateOnly(dtFinalCalc);
                if (!fim || Number.isNaN(fim.getTime())) return 0;
                const hoje = new Date();
                const hojeLocal = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
                const msDia = 1000 * 60 * 60 * 24;
                return Math.max(0, Math.ceil((fim - hojeLocal) / msDia));
            })()
            : 0;
        const valor = (modo === 'Aluguel' && compra.livro?.vlAluguel != null)
            ? UI.formatCurrency(compra.livro.vlAluguel)
            : (compra.livro?.vlCompra != null ? UI.formatCurrency(compra.livro.vlCompra) : UI.formatCurrency(0));

        const detalhesHTML = `
            <div class="details-grid" style="display:grid;gap:1rem;padding:1rem;grid-template-columns:1fr 1fr;">
                <div>
                    <h4 style="margin:0 0 .5rem 0;">Compra</h4>
                    <p class="subtext">ID: ${idFmt}</p>
                    <p>Status: ${Utils.getStatusBadgeLabel(displayStatus)}</p>
                    <p>Tipo: ${Utils.getModoBadge(modo)}</p>
                    <p>InÃ­cio: ${dtInicio}</p>
                    <p>Fim: ${dtFim}</p>
                    <p>Dias restantes: ${isAluguel ? diasRestantes : '-'}</p>
                    <p>Valor: ${valor}</p>
                </div>
                <div>
                    <h4 style="margin:0 0 .5rem 0;">Cliente</h4>
                    <p>Nome: ${compra.cliente?.nome || '-'}</p>
                    <p>Email: ${compra.cliente?.email || '-'}</p>
                    <p>Telefone: ${compra.cliente?.telefone ? Utils.formatarTelefone(compra.cliente.telefone) : '-'}</p>
                    <p>CPF: ${compra.cliente?.cpf || '-'}</p>
                    <p>ID: ${compra.cliente?.idPessoa || '-'}</p>
                </div>
                <div style="grid-column:1/-1;">
                    <h4 style="margin:0 0 .5rem 0;">Livro</h4>
                    <p>TÃ­tulo: ${compra.livro?.titulo || '-'}</p>
                    <p>Autor: ${compra.livro?.autor || '-'}</p>
                    <p>GÃªnero: ${compra.livro?.genero || '-'}</p>
                    <p>PublicaÃ§Ã£o: ${compra.livro?.dtPublicacao ? UI.formatDate(compra.livro.dtPublicacao) : '-'}</p>
                    
                </div>
            </div>
        `;

        const footerHTML = `
            <button type="button" class="btn btn-outline" data-action="close">Fechar</button>
        `;

        if (typeof Modal !== 'undefined' && Modal.create) {
            const modalId = 'modal-compra-detalhes';
            // Remover modal existente para evitar reutilizar conteÃºdo/tÃ­tulo antigos
            const existing = document.getElementById(modalId);
            if (existing) existing.remove();

            Modal.create(
                modalId,
                `<svg width="20" height="20" viewBox="0 0 24 24" style="margin-right:.5rem"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>Detalhes da Compra ${idFmt}`,
                detalhesHTML,
                footerHTML,
                'modal-wide'
            );
            Modal.open(modalId);
        } else {
            UI.showInfo('Detalhes da compra:\n' + detalhesHTML.replace(/<[^>]+>/g, ''));
        }
    } catch (error) {
        console.error('Erro ao carregar detalhes da compra:', error);
        UI.showError('Erro ao carregar detalhes da compra');
    }
}

async function deletarCompra(idCompra) {
    if (!UI.confirm('Deseja realmente excluir esta compra?')) return;
    
    try {
        await CompraAPI.deletar(idCompra);
        UI.showSuccess('Compra excluÃ­da com sucesso!');
        await carregarCompras();
    } catch (error) {
        console.error('Erro ao deletar compra:', error);
        UI.showError('Erro ao excluir compra');
    }
}

async function carregarClientes() {
    const tbody = document.querySelector('#tab-clientes tbody');
    if (!tbody) return;
    // Skeleton: 7 colunas
    mostrarSkeletonTabela(tbody, 7, 5);
    
    try {
        const clientes = await ClienteAPI.listarTodos();
        await renderizarClientes(tbody, clientes);
    } catch (error) {
        console.error('Erro ao carregar clientes:', error);
        mostrarErroTabela(tbody, 7, 'clientes');
    }
}

async function renderizarClientes(tbody, clientes) {
    tbody.innerHTML = '';
    
    if (!clientes || clientes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem; color: var(--muted-foreground);">Nenhum cliente cadastrado</td></tr>';
        return;
    }
    
    for (const cliente of clientes) {
        let compras = [];
        try {
            compras = await CompraAPI.buscarPorCliente(cliente.idPessoa);
        } catch (err) {
            console.warn(`Falha ao buscar compras do cliente ${cliente.idPessoa}. Prosseguindo sem contagem.`, err);
        }
        // Contagens por tipo conforme solicitado, excluindo CANCELADAS
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
        // Determina se hÃ¡ transaÃ§Ãµes ativas (nÃ£o CANCELADA e nÃ£o FINALIZADA)
        const possuiTransacoesAtivas = Array.isArray(compras)
            ? compras.some(c => {
                const status = String(c?.status || '').toUpperCase();
                return status !== 'CANCELADA' && status !== 'FINALIZADA';
            })
            : false;
        const totalGeral = totalCompras + totalAlugueis;
        const telefoneFmt = cliente?.telefone ? Utils.formatarTelefone(cliente.telefone) : '-';
        const emailFmt = cliente?.email || '-';
        const nomeFmt = cliente?.nome || '-';
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><div class="subtext">${cliente.idPessoa}</div></td>
            <td>${nomeFmt}</td>
            <td>${emailFmt}<div class="subtext">${telefoneFmt}</div></td>
            <td><span class="badge badge-outline">${totalCompras}</span></td>
            <td><span class="badge badge-outline">${totalAlugueis}</span></td>
            <td><span class="badge badge-outline">${totalGeral}</span></td>
            <td>
                <div class="action-buttons" style="display: flex; gap: 0.5rem;">
                    <button class="btn btn-icon" data-action="editar-cliente" data-id-cliente="${cliente.idPessoa}" title="Editar">
                        <svg width="16" height="16" viewBox="0 0 24 24"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                    </button>
                    <button class="btn btn-icon btn-danger" data-action="deletar-cliente" data-id-cliente="${cliente.idPessoa}" title="Excluir" ${possuiTransacoesAtivas ? 'disabled' : ''}>
                        <svg width="16" height="16" viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                    <button class="btn btn-outline btn-sm" data-action="ver-cliente" data-id-cliente="${cliente.idPessoa}">
                        Ver Detalhes
                    </button>
                </div>
            </td>
        `;
        // Tooltip indicando motivo de desabilitaÃ§Ã£o
        if (possuiTransacoesAtivas) {
            const btnDel = tr.querySelector('button[data-action="deletar-cliente"]');
            if (btnDel) btnDel.setAttribute('title', 'NÃ£o Ã© possÃ­vel excluir: hÃ¡ transaÃ§Ãµes ativas');
        }
        tbody.appendChild(tr);
    }
}

function editarCliente(idCliente) {
    if (typeof ClienteModals !== 'undefined') {
        ClienteModals.abrirEditarCliente(idCliente);
    } else {
        UI.showInfo('MÃ³dulo de clientes nÃ£o carregado');
    }
}

// Atualiza a linha da tabela do cliente editado sem recarregar
function atualizarLinhaCliente(cliente) {
    try {
        const tbody = document.querySelector('#tab-clientes tbody');
        if (!tbody) return;
        const rows = Array.from(tbody.querySelectorAll('tr'));
        const target = rows.find(row => {
            const idText = row.querySelector('td:nth-child(1) .subtext')?.textContent?.trim();
            return idText === String(cliente.idPessoa);
        });
        if (!target) return;
        const telefoneFmt = cliente?.telefone ? Utils.formatarTelefone(cliente.telefone) : '-';
        const emailFmt = cliente?.email || '-';
        const nomeFmt = cliente?.nome || '-';
        const nomeTd = target.querySelector('td:nth-child(2)');
        const contatoTd = target.querySelector('td:nth-child(3)');
        if (nomeTd) nomeTd.textContent = nomeFmt;
        if (contatoTd) contatoTd.innerHTML = `${emailFmt}<div class="subtext">${telefoneFmt}</div>`;
    } catch (err) {
        console.warn('Falha ao atualizar linha do cliente:', err);
    }
}

// Ouve o evento disparado pelo modal de ediÃ§Ã£o
window.addEventListener('cliente-atualizado', (e) => {
    atualizarLinhaCliente(e.detail);
});

async function deletarCliente(idCliente) {
    if (!UI.confirm('Deseja realmente excluir este cliente?')) return;
    try {
        await ClienteAPI.deletar(idCliente);
        UI.showSuccess('Cliente excluído com sucesso!');
        await carregarClientes();
    } catch (error) {
        console.error('Erro ao deletar cliente:', error);
        UI.showError('Erro ao excluir cliente');
    }
}

function verDetalhesCliente(idCliente) {
    if (typeof ClienteModals !== 'undefined') {
        ClienteModals.abrirDetalhesCliente(idCliente);
    } else {
        UI.showInfo(`Visualizando detalhes do cliente #${idCliente}`);
    }
}

async function carregarAvaliacoes() {
    const tbody = document.querySelector('#tab-avaliacoes tbody');
    if (!tbody) return;
    // Skeleton: 6 colunas
    mostrarSkeletonTabela(tbody, 6, 5);
    
    try {
        const avaliacoes = await AvaliacaoAPI.listarTodas();
        renderizarAvaliacoes(tbody, avaliacoes);
    } catch (error) {
        console.error('Erro ao carregar avaliaÃ§Ãµes:', error);
        mostrarErroTabela(tbody, 6, 'avaliaÃ§Ãµes');
    }
}

function renderizarAvaliacoes(tbody, avaliacoes) {
    tbody.innerHTML = '';
    
    if (!avaliacoes || avaliacoes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem; color: var(--muted-foreground);">Nenhuma avaliaÃ§Ã£o registrada</td></tr>';
        return;
    }
    
    avaliacoes.forEach(avaliacao => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${avaliacao.livro.titulo}<div class="subtext">${avaliacao.livro.autor}</div></td>
            <td>${avaliacao.cliente.nome}</td>
            <td><div class="stars">${Utils.renderizarEstrelas(parseFloat(avaliacao.nota))}</div></td>
            <td class="comment">Muito bom!</td>
            <td><div class="subtext">${UI.formatDate(avaliacao.dtAvaliacao)}</div></td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-icon btn-danger" data-action="deletar-avaliacao" data-id-avaliacao="${avaliacao.idAvaliacao}">
                        <svg width="16" height="16" viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function deletarAvaliacao(idAvaliacao) {
    if (!UI.confirm('Deseja realmente excluir esta avaliaÃ§Ã£o?')) return;
    
    try {
        await AvaliacaoAPI.deletar(idAvaliacao);
        UI.showSuccess('AvaliaÃ§Ã£o excluÃ­da com sucesso!');
        await carregarAvaliacoes();
    } catch (error) {
        console.error('Erro ao deletar avaliaÃ§Ã£o:', error);
        UI.showError('Erro ao excluir avaliaÃ§Ã£o');
    }
}

async function carregarLivros() {
    const tbody = document.querySelector('#tab-livros tbody');
    if (!tbody) return;
    // Skeleton: 7 colunas (ID, Livro, Categoria, PreÃ§o Compra, PreÃ§o Aluguel, AvaliaÃ§Ã£o, AÃ§Ãµes)
    mostrarSkeletonTabela(tbody, 7, 5);
    
    try {
        const livros = await LivroAPI.listarTodos();
        // Estado de paginaÃ§Ã£o
        window.LivrosState = window.LivrosState || { all: [], page: 1, pageSize: 10 };
        LivrosState.all = Array.isArray(livros) ? livros : [];
        LivrosState.page = 1;
        renderizarLivrosPagina(tbody);
        renderizarPaginacaoLivros();
    } catch (error) {
        console.error('Erro ao carregar livros:', error);
        mostrarErroTabela(tbody, 7, 'livros');
}
}

function renderizarLivros(tbody, livros) {
    tbody.innerHTML = '';
    
    if (!livros || livros.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem; color: var(--muted-foreground);">Nenhum livro cadastrado</td></tr>';
        return;
    }
    
    // Helpers: valida e resolve URL de capa
    function isValidHttpUrl(url) {
        if (!url || typeof url !== 'string') return false;
        try {
            const u = new URL(url);
            return u.protocol === 'http:' || u.protocol === 'https:';
        } catch (_) {
            return false;
        }
    }
    function resolveCoverUrl(url) {
        const placeholder = `https://placehold.co/64x96/8c6d4e/ffffff?text=${encodeURIComponent('Capa')}`;
        if (!url || typeof url !== 'string' || url.trim() === '') return placeholder;
        const trimmed = url.trim();
        if (/^https?:\/\//i.test(trimmed)) return trimmed;
        const base = `${location.origin}/assets/img/capas/`;
        return base + trimmed.replace(/^\//, '');
    }

    livros.forEach(livro => {
        const tr = document.createElement('tr');
        const capa = resolveCoverUrl(livro.capaUrl);
        const invalidUrl = livro.capaUrl && !/^https?:\/\//i.test(livro.capaUrl) && !isValidHttpUrl(capa);
        tr.innerHTML = `
            <td><div class="subtext">LIV${String(livro.idLivro).padStart(3, '0')}</div></td>
            <td>
                <a href="/pages/livro.html?id=${livro.idLivro}" style="display:flex; align-items:center; gap:.75rem; text-decoration:none; color:inherit;">
                    <img src="${capa}" alt="Capa" style="width:40px;height:60px;object-fit:cover;border-radius:.25rem;box-shadow:var(--shadow-sm);" onerror="this.src='https://placehold.co/40x60/8c6d4e/ffffff?text=Capa';" />
                    <div>
                        <div>${livro.titulo}</div>
                        <div class="subtext">${livro.autor}</div>
                        ${invalidUrl ? '<span class="badge badge-warning" title="URL de capa invÃ¡lida">URL invÃ¡lida</span>' : ''}
                    </div>
                </a>
            </td>
            <td>${livro.genero || '-'}</td>
            <td>${UI.formatCurrency(livro.vlCompra || 0)}</td>
            <td>${UI.formatCurrency(livro.vlAluguel || 0)}</td>
            <td>
                <div class="stars">${Utils.renderizarEstrelas(parseFloat(livro.avaliacao || 0))}</div>
                <div class="subtext">${(livro.avaliacao != null) ? Number(livro.avaliacao).toFixed(1) : '-'}</div>
            </td>
            <td>
                <div class="action-buttons" style="display: flex; gap: 0.5rem;">
                    <button class="btn btn-icon" data-action="editar-livro" data-id-livro="${livro.idLivro}">
                        <svg width="16" height="16" viewBox="0 0 24 24"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                    </button>
                    <button class="btn btn-icon btn-danger" data-action="deletar-livro" data-id-livro="${livro.idLivro}">
                        <svg width="16" height="16" viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Renderiza a pÃ¡gina atual de livros baseada no estado
function renderizarLivrosPagina(tbody) {
    const st = window.LivrosState || { all: [], page: 1, pageSize: 10 };
    const total = st.all.length;
    const start = (st.page - 1) * st.pageSize;
    const end = Math.min(start + st.pageSize, total);
    const pageItems = st.all.slice(start, end);
    renderizarLivros(tbody, pageItems);
}

// Cria os controles de paginaÃ§Ã£o (Prev, nÃºmeros, Next)
function renderizarPaginacaoLivros() {
    const container = document.getElementById('livros-pagination');
    if (!container) return;
    const st = window.LivrosState || { all: [], page: 1, pageSize: 10 };
    const totalPages = Math.max(1, Math.ceil(st.all.length / st.pageSize));
    const current = Math.min(st.page, totalPages);
    st.page = current;

    const makeBtn = (label, page, disabled = false, active = false) => {
        const cls = active ? 'btn active' : 'btn btn-outline';
        const dis = disabled ? 'disabled' : '';
        return `<button class="${cls}" data-page="${page}" ${dis}>${label}</button>`;
    };

    // ConstruÃ§Ã£o da janela de pÃ¡ginas sem duplicaÃ§Ãµes
    let pages = [];
    if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
        // janela central de 5 nÃºmeros
        let start = Math.max(1, current - 2);
        let end = Math.min(totalPages, current + 2);
        // expandir para sempre ter 5 se possÃ­vel
        while ((end - start + 1) < 5) {
            if (start > 1) start--;
            else if (end < totalPages) end++;
            else break;
        }

        // mostrar '1' a partir da pÃ¡gina 4 (regra baseada na pÃ¡gina atual)
        if (current >= 4) {
            pages.push(1);
            if (start > 2) pages.push('â€¦');
        }

        for (let i = start; i <= end; i++) pages.push(i);

        // ocultar 'Ãºltima' a partir da pÃ¡gina 54 (current >= totalPages - 2)
        if (current < totalPages - 2) {
            if (end < totalPages - 1) pages.push('â€¦');
            pages.push(totalPages);
        }
    }

    const prevDisabled = current === 1;
    const nextDisabled = current === totalPages;
    const html = [
        makeBtn('Anterior', current - 1, prevDisabled),
        ...pages.map(p => typeof p === 'number' ? makeBtn(p, p, false, p === current) : `<span class="subtext">${p}</span>`),
        makeBtn('PrÃ³ximo', current + 1, nextDisabled)
    ].join('');
    container.innerHTML = html;

    // DelegaÃ§Ã£o de eventos
    container.onclick = (e) => {
        const target = e.target;
        if (!(target instanceof HTMLElement)) return;
        const pageAttr = target.getAttribute('data-page');
        if (!pageAttr) return;
        const requested = parseInt(pageAttr, 10);
        if (Number.isNaN(requested)) return;
        const st2 = window.LivrosState;
        const totalPages2 = Math.max(1, Math.ceil(st2.all.length / st2.pageSize));
        const nextPage = Math.min(Math.max(1, requested), totalPages2);
        if (nextPage === st2.page) return;
        st2.page = nextPage;
        const tbody = document.querySelector('#tab-livros tbody');
        if (tbody) renderizarLivrosPagina(tbody);
        renderizarPaginacaoLivros();
    };
}

function editarLivro(idLivro) {
    if (typeof LivroModals !== 'undefined') {
        LivroModals.abrirEditarLivro(idLivro);
    } else {
        UI.showInfo('Funcionalidade de ediÃ§Ã£o em desenvolvimento');
    }
}

async function deletarLivro(idLivro) {
    if (!UI.confirm('Deseja realmente excluir este livro?')) return;
    
    try {
        await LivroAPI.deletar(idLivro);
        UI.showSuccess('Livro excluÃ­do com sucesso!');
        await carregarLivros();
    } catch (error) {
        console.error('Erro ao deletar livro:', error);
        UI.showError(error?.message || 'Erro ao excluir livro');
    }
}

// Atualiza a linha do livro na tabela sem recarregar a pÃ¡gina
function atualizarLinhaLivro(dto) {
    try {
        const btn = document.querySelector(`button[data-id-livro='${dto.idLivro}']`);
        const tr = btn ? btn.closest('tr') : null;
        if (!tr || tr.children.length < 7) return;
        // [0] ID, [1] TÃ­tulo/Autor, [2] GÃªnero, [3] PreÃ§o Compra, [4] PreÃ§o Aluguel, [5] AvaliaÃ§Ã£o, [6] AÃ§Ãµes
        tr.children[1].innerHTML = `${dto.titulo}<div class="subtext">${dto.autor}</div>`;
        tr.children[2].textContent = dto.genero || '-';
        tr.children[3].textContent = UI.formatCurrency(dto.vlCompra || 0);
        tr.children[4].textContent = UI.formatCurrency(dto.vlAluguel || 0);
        tr.children[5].innerHTML = `
            <div class="stars">${Utils.renderizarEstrelas(parseFloat(dto.avaliacao || 0))}</div>
            <div class="subtext">${(dto.avaliacao != null) ? Number(dto.avaliacao).toFixed(1) : '-'}</div>
        `;
    } catch (err) {
        console.warn('Falha ao atualizar linha do livro:', err);
    }
}

// Escuta evento de livro atualizado disparado pelo modal de ediÃ§Ã£o
window.addEventListener('livro-atualizado', (e) => {
    const dto = e?.detail;
    if (!dto) return;
    // Atualiza item no estado e re-renderiza pÃ¡gina atual
    const st = window.LivrosState;
    if (st && Array.isArray(st.all)) {
        const idx = st.all.findIndex(l => String(l.idLivro) === String(dto.idLivro));
        if (idx >= 0) st.all[idx] = { ...st.all[idx], ...dto };
        const tbody = document.querySelector('#tab-livros tbody');
        if (tbody) renderizarLivrosPagina(tbody);
        renderizarPaginacaoLivros();
    } else {
        atualizarLinhaLivro(dto);
    }
});

async function carregarFuncionarios() {
    const tbody = document.querySelector('#tab-funcionarios tbody');
    if (!tbody) return;
    // Skeleton: 5 colunas (removido Status)
    mostrarSkeletonTabela(tbody, 5, 5);
    
    try {
        const funcionarios = await FuncionarioAPI.listarTodos();
        window.FuncionariosState = { all: Array.isArray(funcionarios) ? funcionarios : [] };
        renderizarFuncionarios(tbody, window.FuncionariosState.all);
    } catch (error) {
        console.error('Erro ao carregar funcionários:', error);
        mostrarErroTabela(tbody, 5, 'funcionários');
    }
}

function renderizarFuncionarios(tbody, funcionarios) {
    tbody.innerHTML = '';
    
    if (!funcionarios || funcionarios.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem; color: var(--muted-foreground);">Nenhum funcionário cadastrado</td></tr>';
        return;
    }
    
    funcionarios.forEach(funcionario => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><div class="subtext">FUNC${String(funcionario.idPessoa).padStart(3, '0')}</div></td>
            <td>${funcionario.nome}</td>
            <td>Bibliotecário<div class="subtext">Gestão de Acervo</div></td>
            <td><span class="badge badge-outline">0</span></td>
            <td>
                <div class="action-buttons" style="display: flex; gap: 0.5rem;">
                    <button class="btn btn-icon" data-action="editar-funcionario" data-id-funcionario="${funcionario.idPessoa}">
                        <svg width="16" height="16" viewBox="0 0 24 24"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                    </button>
                    <button class="btn btn-icon btn-danger" data-action="deletar-funcionario" data-id-funcionario="${funcionario.idPessoa}">
                        <svg width="16" height="16" viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function editarFuncionario(idFuncionario) {
    if (typeof FuncionarioModals !== 'undefined') {
        FuncionarioModals.abrirEditarFuncionario(idFuncionario);
    } else {
        UI.showInfo('Módulo de funcionários não carregado');
    }
}

async function deletarFuncionario(idFuncionario) {
    if (!UI.confirm('Deseja realmente excluir este funcionário?')) return;
    
    try {
        await FuncionarioAPI.deletar(idFuncionario);
        UI.showSuccess('Funcionário excluído com sucesso!');
        await carregarFuncionarios();
    } catch (error) {
        console.error('Erro ao deletar funcionário:', error);
        UI.showError('Erro ao excluir funcionário');
    }
}

function mostrarErroTabela(tbody, colspan, tipo) {
    tbody.innerHTML = `<tr><td colspan="${colspan}" style="text-align: center; padding: 2rem; color: var(--muted-foreground);">Erro ao carregar ${tipo}. Verifique a conexão com o servidor.</td></tr>`;
}

// Skeleton para tabelas do Admin enquanto os dados carregam
function mostrarSkeletonTabela(tbody, cols, rows) {
    tbody.innerHTML = '';
    const clamp = (min, max, v) => Math.max(min, Math.min(max, v));
    for (let r = 0; r < rows; r++) {
        const tr = document.createElement('tr');
        let html = '';
        for (let c = 0; c < cols; c++) {
            const w = clamp(30, 85, Math.round(50 + Math.random() * 40));
            html += `<td><div class="skeleton-cell" style="width:${w}%;"></div></td>`;
        }
        tr.innerHTML = html;
        tbody.appendChild(tr);
    }
}

// Tornar funÃ§Ãµes globais
window.finalizarCompra = finalizarCompra;
window.editarCompra = editarCompra;
window.deletarCompra = deletarCompra;
window.editarCliente = editarCliente;
window.deletarCliente = deletarCliente;
window.verDetalhesCliente = verDetalhesCliente;
window.deletarAvaliacao = deletarAvaliacao;
window.editarLivro = editarLivro;
window.deletarLivro = deletarLivro;
window.editarFuncionario = editarFuncionario;
window.deletarFuncionario = deletarFuncionario;
// Atualiza linha pontual quando funcionÃ¡rio Ã© atualizado via modal
window.addEventListener('funcionario-atualizado', (e) => {
    const dto = e?.detail;
    if (!dto) return;
    const st = window.FuncionariosState;
    const tbody = document.querySelector('#tab-funcionarios tbody');
    if (st && Array.isArray(st.all)) {
        const idx = st.all.findIndex(f => String(f.idPessoa) === String(dto.idPessoa));
        if (idx >= 0) st.all[idx] = { ...st.all[idx], ...dto };
        if (tbody) renderizarFuncionarios(tbody, st.all);
    } else if (tbody) {
        // Fallback: re-carregar do servidor
        carregarFuncionarios();
    }
});

// Pesquisa de funcionÃ¡rios por nome ou ID
function configurarPesquisaFuncionarios() {
    const input = document.querySelector('#tab-funcionarios .actions .search-input, #search-funcionarios');
    if (!input) return;
    input.addEventListener('input', () => filtrarFuncionarios(input.value));
}

function filtrarFuncionarios(query) {
    const tbody = document.querySelector('#tab-funcionarios tbody');
    const st = window.FuncionariosState;
    if (!tbody || !st || !Array.isArray(st.all)) return;
    const termo = (query || '').toLowerCase().trim();
    if (!termo) {
        renderizarFuncionarios(tbody, st.all);
        return;
    }
    const filtrados = st.all.filter(f => {
        const idStr = `FUNC${String(f.idPessoa).padStart(3, '0')}`.toLowerCase();
        return (f.nome || '').toLowerCase().includes(termo) || idStr.includes(termo) || String(f.idPessoa).includes(termo);
    });
    renderizarFuncionarios(tbody, filtrados);
}
