// ========================================
// FUNCIONARIO.JS - PAINEL DO FUNCIONÁRIO
// ========================================

document.addEventListener('DOMContentLoaded', async () => {
    const user = Auth.getUser();
    const isAllowed = Auth.isLoggedIn() && user && (user.role === 'FUNCIONARIO');
    if (!isAllowed) {
        window.location.href = '/pages/login.html';
        return;
    }

    const userId = Auth.getUserId();
    await inicializarPainel(userId);
    // Configurar buscas nas abas
    configurarPesquisaComprasFuncionario();
    configurarPesquisaClientesFuncionario();
    configurarPesquisaAvaliacoesFuncionario();
    // Tornar botão "Novo Cliente" funcional (sem depender de data-action)
    const btnNovoCliente = document.querySelector('#tab-clientes .card-header .actions .btn.btn-gold');
    if (btnNovoCliente) {
        btnNovoCliente.addEventListener('click', (e) => {
            e.preventDefault();
            if (typeof ClienteModals !== 'undefined') {
                ClienteModals.abrirNovoCliente();
            } else {
                UI.showInfo('Módulo de clientes não carregado');
            }
        });
    }
    // Carregar script de modais de funcionário, se necessário, e habilitar botão Editar Informações
    const editarInfoBtn = document.querySelector('#tab-informacoes .card-actions .btn.btn-gold');
    if (editarInfoBtn) {
        editarInfoBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            // Garantir que FuncionarioModals esteja disponível
            if (typeof FuncionarioModals === 'undefined') {
                await carregarScriptFuncionarioModals();
            }
            if (typeof FuncionarioModals !== 'undefined') {
                try {
                    FuncionarioModals.abrirEditarFuncionario(userId);
                } catch (err) {
                    console.error('Falha ao abrir edição de funcionário:', err);
                    UI.showError('Erro ao abrir edição de informações');
                }
            } else {
                UI.showInfo('Módulo de funcionários não carregado');
            }
        });
    }
    configurarDelegacaoAcoesFuncionario();
});

function configurarDelegacaoAcoesFuncionario() {
    const map = [
        { selector: '#tab-compras', handler: handleComprasClick },
        { selector: '#tab-clientes', handler: handleClientesClick },
        { selector: '#tab-avaliacoes', handler: handleAvaliacoesClick }
    ];
    map.forEach(({ selector, handler }) => {
        const root = document.querySelector(selector);
        if (root) root.addEventListener('click', handler);
    });
}

function findActionButton(e) {
    return e.target.closest('button[data-action]');
}

function handleComprasClick(e) {
    const btn = findActionButton(e);
    if (!btn) return;
    const id = parseInt(btn.getAttribute('data-id-compra'), 10);
    if (btn.getAttribute('data-action') === 'ver-compra') {
        verDetalhesCompra(id);
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
                UI.showInfo('Módulo de clientes não carregado');
            }
            break;
        case 'editar-cliente':
            editarCliente(id);
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

async function inicializarPainel(userId) {
    const funcoes = [
        { nome: 'Dados Funcionário', fn: () => carregarDadosFuncionario(userId) },
        { nome: 'Compras', fn: carregarCompras },
        { nome: 'Clientes', fn: carregarClientes },
        { nome: 'Avaliações', fn: carregarAvaliacoes }
    ];
    
    for (const { nome, fn } of funcoes) {
        try {
            await fn();
        } catch (error) {
            console.error(`Erro ao carregar ${nome}:`, error);
        }
    }
}

// ========================================
// COMPRAS
// ========================================

async function carregarCompras() {
    const tbody = document.querySelector('#tab-compras tbody');
    if (!tbody) return;
    // Mostrar skeleton enquanto carrega
    mostrarSkeletonTabela(tbody, 8, 6);
    try {
        const compras = await CompraAPI.listarTodas();
        const filtradas = aplicarFiltrosComprasFunc(compras);
        renderizarCompras(tbody, filtradas);
    } catch (error) {
        console.error('Erro ao carregar compras:', error);
        mostrarErroTabela(tbody, 8, 'compras');
    }
}

function aplicarFiltrosComprasFunc(compras) {
    const selectStatus = document.getElementById('filtro-status-func');
    const selectTipo = document.getElementById('filtro-tipo-func');
    const statusSel = selectStatus ? String(selectStatus.value || '').toUpperCase() : '';
    const tipoSel = selectTipo ? String(selectTipo.value || '').toUpperCase() : '';

    return (compras || []).filter(c => {
        const tipo = c?.tipo ? String(c.tipo).toUpperCase() : ((c.livro?.vlAluguel != null) ? 'ALUGUEL' : 'COMPRA');
        const rawStatus = c?.status ? String(c.status).toUpperCase() : '';
        // Normalizar COMPRA com PENDENTE como FINALIZADA para fins de filtro
        const status = (rawStatus === 'PENDENTE' && tipo === 'COMPRA') ? 'FINALIZADA' : rawStatus;
        const okStatus = !statusSel || status === statusSel;
        const okTipo = !tipoSel || tipo === tipoSel;
        return okStatus && okTipo;
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const s1 = document.getElementById('filtro-status-func');
    const s2 = document.getElementById('filtro-tipo-func');
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
        else if (String(compra.status).toUpperCase() === 'PENDENTE') displayStatus = isAluguel ? 'Ativa' : 'Finalizada';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><div class="subtext">CMP${String(compra.idCompra).padStart(3, '0')}</div></td>
            <td>${compra.cliente?.nome || '-'}<div class="subtext">ID: ${compra.cliente?.idPessoa || '-'}</div></td>
            <td>
                <a href="/pages/livro.html?id=${compra.livro?.idLivro}" style="text-decoration:none; color:inherit;">
                    ${compra.livro?.titulo || '-'}
                    <div class="subtext">${compra.livro?.autor || '-'}</div>
                </a>
            </td>
            <td>${valor}</td>
            <td>${diasRestante}</td>
            <td>${Utils.getModoBadge(modo)}</td>
            <td>${Utils.getStatusBadgeLabel(displayStatus)}</td>
            <td>
                <div class="action-buttons" style="display: flex; gap: 0.5rem;">
                    <button class="btn btn-outline btn-sm" data-action="ver-compra" data-id-compra="${compra.idCompra}">Ver Detalhes</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function verDetalhesCompra(idCompra) {
    try {
        const compra = await CompraAPI.buscarPorId(idCompra);
        if (!compra) {
            UI.showError('Compra não encontrada');
            return;
        }

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
        const dtFimBase = isAluguel
            ? (compra.dtFim || (compra.dtInicio ? Utils.calcularDataDevolucao(compra.dtInicio, 30) : null))
            : (compra.dtFim || null);
        const dtFim = dtFimBase ? UI.formatDate(dtFimBase) : '-';

        const clienteInfo = compra.cliente ? `ID: ${compra.cliente.idPessoa}` : '-';
        const valorCompra = (isAluguel && compra.livro?.vlAluguel != null)
            ? UI.formatCurrency(compra.livro.vlAluguel)
            : (compra.livro?.vlCompra != null ? UI.formatCurrency(compra.livro.vlCompra) : UI.formatCurrency(0));

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

        const detalhesHTML = `
            <div class="details-grid" style="display:grid;gap:1rem;padding:1rem;grid-template-columns:1fr 1fr;">
                <div>
                    <h4 style="margin:0 0 .5rem 0;">Compra</h4>
                    <p class="subtext">ID: ${idFmt}</p>
                    <p>Status: ${Utils.getStatusBadgeLabel(displayStatus)}</p>
                    <p>Tipo: ${Utils.getModoBadge(modo)}</p>
                    <p>Início: ${dtInicio}</p>
                    <p>Fim: ${dtFim}</p>
                    <p>Dias restantes: ${isAluguel ? diasRestantes : '-'}</p>
                    <p>Valor: ${valorCompra}</p>
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
                    <p>Título: ${compra.livro?.titulo || '-'}</p>
                    <p>Autor: ${compra.livro?.autor || '-'}</p>
                    <p>Gênero: ${compra.livro?.genero || '-'}</p>
                    <p>Publicação: ${compra.livro?.dtPublicacao ? UI.formatDate(compra.livro.dtPublicacao) : '-'}</p>
                </div>
            </div>
        `;

        const footerHTML = `
            <button type="button" class="btn btn-outline" data-action="close">Fechar</button>
        `;

        if (typeof Modal !== 'undefined' && Modal.create) {
            const modalId = 'modal-compra-detalhes';
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

async function finalizarCompra(idCompra) {
    if (!UI.confirm('Confirmar finalização da compra?')) return;
    try {
        await CompraAPI.finalizar(idCompra);
        UI.showSuccess('Compra finalizada com sucesso!');
        await carregarCompras();
    } catch (error) {
        console.error('Erro ao finalizar compra:', error);
        UI.showError('Erro ao finalizar compra');
    }
}

function editarCompra(idCompra) {
    UI.showInfo('Funcionalidade de edição em desenvolvimento');
}

async function deletarCompra(idCompra) {
    if (!UI.confirm('Deseja realmente excluir esta compra?')) return;
    try {
        await CompraAPI.deletar(idCompra);
        UI.showSuccess('Compra excluída com sucesso!');
        await carregarCompras();
    } catch (error) {
        console.error('Erro ao deletar compra:', error);
        UI.showError('Erro ao excluir compra');
    }
}
// ========================================
// DADOS DO FUNCIONÁRIO
// ========================================

async function carregarDadosFuncionario(userId) {
    try {
        const funcionario = await FuncionarioAPI.buscarPorId(userId);
        atualizarInfoFuncionario(funcionario);
    } catch (error) {
        console.error('Erro ao carregar dados do funcionário:', error);
        const infoGrid = document.querySelector('#tab-informacoes .info-grid');
        if (infoGrid) {
            infoGrid.innerHTML = '<div class="subtext" style="padding:1rem; color: var(--muted-foreground);">Erro ao carregar dados do funcionário.</div>';
        }
    }
}

function atualizarInfoFuncionario(funcionario) {
    const infoGrid = document.querySelector('#tab-informacoes .info-grid');
    if (!infoGrid || !funcionario) return;
    
    infoGrid.innerHTML = `
        <div class="info-item">
            <label>Nome Completo</label>
            <p>${funcionario.nome}</p>
        </div>
        <div class="info-item">
            <label>E-mail</label>
            <p>${funcionario.email}</p>
        </div>
        <div class="info-item">
            <label>Telefone</label>
            <p>${Utils.formatarTelefone(funcionario.telefone) || 'Não informado'}</p>
        </div>
        <div class="info-item">
            <label>Matrícula</label>
            <p>FUNC${String(funcionario.idPessoa).padStart(3, '0')}</p>
        </div>
        <div class="info-item">
            <label>Cargo</label>
            <p>Bibliotecário</p>
        </div>
        <div class="info-item">
            <label>Departamento</label>
            <p>Gestão de Acervo</p>
        </div>
        <div class="info-item">
            <label>Data de Nascimento</label>
            <p>${funcionario.dtNascimento ? UI.formatDate(funcionario.dtNascimento) : 'Não informado'}</p>
        </div>
    `;
}

// Removido fallback de dados de teste

// ========================================
// CLIENTES
// ========================================

async function carregarClientes() {
    const tbody = document.querySelector('#tab-clientes tbody');
    if (!tbody) return;
    // Mostrar skeleton enquanto carrega
    mostrarSkeletonTabela(tbody, 7, 6);
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
                    <button class="btn btn-outline btn-sm" data-action="ver-cliente" data-id-cliente="${cliente.idPessoa}">
                        Ver Detalhes
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    }
}

function editarCliente(idCliente) {
    if (typeof ClienteModals !== 'undefined') {
        ClienteModals.abrirEditarCliente(idCliente);
    } else {
        UI.showInfo('Funcionalidade de edição em desenvolvimento');
    }
}

function verDetalhesCliente(idCliente) {
    if (typeof ClienteModals !== 'undefined') {
        ClienteModals.abrirDetalhesCliente(idCliente);
    } else {
        UI.showInfo(`Visualizando detalhes do cliente #${idCliente}`);
    }
}

// Atualiza a linha do cliente na tabela sem recarregar a página
function atualizarLinhaCliente(dto) {
    try {
        const btn = document.querySelector(`button[data-id-cliente='${dto.idPessoa}']`);
        const tr = btn ? btn.closest('tr') : null;
        if (!tr) return;
        const nomeCell = tr.children[1];
        const contatoCell = tr.children[2];
        if (nomeCell) nomeCell.textContent = dto?.nome || '-';
        if (contatoCell) {
            const telefoneFmt = dto?.telefone ? Utils.formatarTelefone(dto.telefone) : '-';
            const emailFmt = dto?.email || '-';
            contatoCell.innerHTML = `${emailFmt}<div class="subtext">${telefoneFmt}</div>`;
        }
    } catch (err) {
        console.warn('Falha ao atualizar linha do cliente:', err);
    }
}

// Escuta evento de cliente atualizado disparado pelo modal de edição
window.addEventListener('cliente-atualizado', (e) => {
    const dto = e?.detail;
    if (!dto) return;
    atualizarLinhaCliente(dto);
});

// ========================================
// BUSCAS (Compras, Clientes, Avaliações)
// ========================================

function configurarPesquisaComprasFuncionario() {
    const input = document.querySelector('#tab-compras .search-input');
    if (!input) return;
    input.addEventListener('input', () => filtrarComprasFuncionario(input.value));
}

function filtrarComprasFuncionario(query) {
    const q = (query || '').toLowerCase().trim();
    const rows = document.querySelectorAll('#tab-compras tbody tr');
    rows.forEach(row => {
        if (row.cells.length === 1) return; // linha de vazio/erro
        const idText = row.cells[0]?.textContent?.toLowerCase() || '';
        const clienteText = row.cells[1]?.textContent?.toLowerCase() || '';
        const livroText = row.cells[2]?.textContent?.toLowerCase() || '';
        const matches = !q || idText.includes(q) || clienteText.includes(q) || livroText.includes(q);
        row.style.display = matches ? '' : 'none';
    });
}

function configurarPesquisaClientesFuncionario() {
    const input = document.querySelector('#tab-clientes .search-input');
    if (!input) return;
    input.addEventListener('input', () => filtrarClientesFuncionario(input.value));
}

function filtrarClientesFuncionario(query) {
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

function configurarPesquisaAvaliacoesFuncionario() {
    const input = document.querySelector('#tab-avaliacoes .search-input');
    if (!input) return;
    input.addEventListener('input', () => filtrarAvaliacoesFuncionario(input.value));
}

function filtrarAvaliacoesFuncionario(query) {
    const q = (query || '').toLowerCase().trim();
    const rows = document.querySelectorAll('#tab-avaliacoes tbody tr');
    rows.forEach(row => {
        if (row.cells.length === 1) return; // linha de vazio/erro
        const livroText = row.cells[0]?.textContent?.toLowerCase() || '';
        const autorText = row.cells[0]?.querySelector('.subtext')?.textContent?.toLowerCase() || '';
        const clienteText = row.cells[1]?.textContent?.toLowerCase() || '';
        const comentarioText = row.cells[3]?.textContent?.toLowerCase() || '';
        const matches = !q || livroText.includes(q) || autorText.includes(q) || clienteText.includes(q) || comentarioText.includes(q);
        row.style.display = matches ? '' : 'none';
    });
}

async function carregarScriptFuncionarioModals() {
    return new Promise((resolve) => {
        if (typeof FuncionarioModals !== 'undefined') return resolve();
        const s = document.createElement('script');
        s.src = '/assets/js/funcionario-modals.js';
        s.onload = () => resolve();
        s.onerror = () => {
            console.warn('Falha ao carregar funcionario-modals.js');
            resolve();
        };
        document.body.appendChild(s);
    });
}

// ========================================
// AVALIAÇÕES
// ========================================

async function carregarAvaliacoes() {
    const tbody = document.querySelector('#tab-avaliacoes tbody');
    if (!tbody) return;
    // Mostrar skeleton enquanto carrega
    mostrarSkeletonTabela(tbody, 6, 6);
    try {
        const avaliacoes = await AvaliacaoAPI.listarTodas();
        renderizarAvaliacoes(tbody, avaliacoes);
    } catch (error) {
        console.error('Erro ao carregar avaliações:', error);
        mostrarErroTabela(tbody, 6, 'avaliações');
    }
}

function renderizarAvaliacoes(tbody, avaliacoes) {
    tbody.innerHTML = '';
    
    if (!avaliacoes || avaliacoes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem; color: var(--muted-foreground);">Nenhuma avaliação registrada</td></tr>';
        return;
    }
    
    avaliacoes.forEach(avaliacao => {
        const estrelas = Utils.renderizarEstrelas(parseFloat(avaliacao.nota));
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <a href="/pages/livro.html?id=${avaliacao.livro.idLivro}" style="text-decoration:none; color:inherit;">
                    ${avaliacao.livro.titulo}
                    <div class="subtext">${avaliacao.livro.autor}</div>
                </a>
            </td>
            <td>${avaliacao.cliente.nome}</td>
            <td><div class="stars">${estrelas}</div></td>
            <td class="comment" title="Avaliação do cliente">Muito bom!</td>
            <td><div class="subtext">${UI.formatDate(avaliacao.dtAvaliacao)}</div></td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-icon btn-danger" data-action="deletar-avaliacao" data-id-avaliacao="${avaliacao.idAvaliacao}" title="Excluir">
                        <svg width="16" height="16" viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function deletarAvaliacao(idAvaliacao) {
    if (!UI.confirm('Deseja realmente excluir esta avaliação?')) return;
    
    try {
        await AvaliacaoAPI.deletar(idAvaliacao);
        UI.showSuccess('Avaliação excluída com sucesso!');
        await carregarAvaliacoes();
    } catch (error) {
        console.error('Erro ao deletar avaliação:', error);
        UI.showError('Erro ao excluir avaliação');
    }
}

// ========================================
// UTILITÁRIOS
// ========================================

function mostrarErroTabela(tbody, colspan, tipo) {
    tbody.innerHTML = `<tr><td colspan="${colspan}" style="text-align: center; padding: 2rem; color: var(--muted-foreground);">Erro ao carregar ${tipo}. Verifique a conexão com o servidor.</td></tr>`;
}

// Exibe linhas de skeleton na tabela enquanto dados carregam
function mostrarSkeletonTabela(tbody, colspan, qtdLinhas) {
    try {
        const linhas = Math.max(3, Number(qtdLinhas) || 5);
        const cells = Number(colspan) || 5;
        const rows = [];
        for (let i = 0; i < linhas; i++) {
            const tds = [];
            for (let j = 0; j < cells; j++) {
                const w = 40 + Math.floor(Math.random() * 50);
                tds.push(`<td><div class=\"skeleton-cell\" style=\"width:${w}%; height:0.9rem;\"></div></td>`);
            }
            rows.push(`<tr>${tds.join('')}</tr>`);
        }
        tbody.innerHTML = rows.join('');
    } catch (e) {
        // Fallback simples
        tbody.innerHTML = `<tr><td colspan=\"${colspan}\"><div class=\"skeleton-cell\" style=\"width:100%; height:1rem;\"></div></td></tr>`;
    }
}

// Tornar funções globais
window.editarCliente = editarCliente;
window.verDetalhesCliente = verDetalhesCliente;
window.deletarAvaliacao = deletarAvaliacao;
window.finalizarCompra = finalizarCompra;
window.editarCompra = editarCompra;
window.deletarCompra = deletarCompra;
