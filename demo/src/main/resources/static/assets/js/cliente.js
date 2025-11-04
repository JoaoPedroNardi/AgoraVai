// ========================================
// CLIENTE.JS - PAINEL DO CLIENTE
// ========================================

document.addEventListener('DOMContentLoaded', async () => {
    // Verificar se está logado
    if (!Auth.isLoggedIn()) {
        window.location.href = '/pages/login.html';
        return;
    }
    // Restringir acesso ao painel do cliente para role CLIENTE
    const user = Auth.getUser();
    if (!user || user.role !== 'CLIENTE') {
        window.location.href = '/pages/login.html';
        return;
    }
    
    const userId = Auth.getUserId();
    
    // Carregar dados do cliente
    await carregarDadosCliente(userId);
    
    // Carregar empréstimos
    await carregarEmprestimos(userId);
    
    // Carregar multas
    await carregarMultas(userId);
    
    // Carregar livros do cliente
    await carregarLivrosCliente(userId);

    // Habilitar edição de Minhas Informações
    const btnEditar = document.getElementById('btn-editar-minhas-informacoes');
    if (btnEditar) {
        btnEditar.addEventListener('click', (e) => {
            e.preventDefault();
            if (typeof ClienteModals !== 'undefined') {
                ClienteModals.abrirEditarCliente(userId);
            } else {
                UI.showInfo('Módulo de clientes não carregado');
            }
        });
    }

    // Habilitar alteração de senha
    const btnAlterarSenha = document.getElementById('btn-alterar-senha');
    if (btnAlterarSenha) {
        btnAlterarSenha.addEventListener('click', (e) => {
            e.preventDefault();
            if (typeof ClienteModals !== 'undefined') {
                ClienteModals.abrirAlterarSenha(userId);
            } else {
                UI.showInfo('Módulo de clientes não carregado');
            }
        });
    }

    // Atualizar UI após salvar edição no modal
    window.addEventListener('cliente-atualizado', async (ev) => {
        try {
            await carregarDadosCliente(userId);
            Toast.success('Suas informações foram atualizadas!');
        } catch (err) {
            console.warn('Falha ao atualizar informações após edição', err);
        }
    });

    // Feedback após alteração de senha
    window.addEventListener('senha-alterada', (ev) => {
        Toast.success('Senha alterada com sucesso!');
    });
});

// Helpers para resolver URL da capa
function isValidHttpUrl(url) {
    if (!url || typeof url !== 'string') return false;
    try {
        const u = new URL(url);
        return u.protocol === 'http:' || u.protocol === 'https:';
    } catch (e) { return false; }
}
function resolveCoverUrl(url) {
    if (!url) return null;
    const raw = String(url).trim();
    if (isValidHttpUrl(raw)) return raw;
    try {
        if (raw.startsWith('/') || raw.startsWith('./') || /^[^:]+\//.test(raw)) {
            return new URL(raw, window.location.origin).href;
        }
    } catch(e) { return null; }
    return null;
}

async function carregarDadosCliente(userId) {
    try {
        const cliente = await ClienteAPI.buscarPorId(userId);
        
        if (cliente) {
            // Atualizar informações na aba de informações
            const infoGrid = document.querySelector('#tab-informacoes .info-grid');
            if (infoGrid) {
                infoGrid.innerHTML = `
                    <div class="info-item">
                        <label>Nome Completo</label>
                        <p>${cliente.nome}</p>
                    </div>
                    <div class="info-item">
                        <label>E-mail</label>
                        <p>${cliente.email}</p>
                    </div>
                    <div class="info-item">
                        <label>Telefone</label>
                        <p>${cliente.telefone ? Utils.formatarTelefone(cliente.telefone) : 'Não informado'}</p>
                    </div>
                    <div class="info-item">
                        <label>Data de Nascimento</label>
                        <p>${cliente.dtNascimento ? UI.formatDate(cliente.dtNascimento) : 'Não informado'}</p>
                    </div>
                    <div class="info-item">
                        <label>CPF</label>
                        <p>${cliente.cpf ? Utils.formatarCPF(cliente.cpf) : 'Não informado'}</p>
                    </div>
                    <div class="info-item">
                        <label>Data de Cadastro</label>
                        <p>${UI.formatDateTime(cliente.dtCadastro)}</p>
                    </div>
                    <div class="info-item" style="grid-column: 1 / -1;">
                        <label>Endereço</label>
                        <p>${cliente.endereco || 'Não informado'}</p>
                    </div>
                `;
            }
        }
    } catch (error) {
        console.error('Erro ao carregar dados do cliente:', error);
        UI.showError('Erro ao carregar suas informações');
    }
}

async function carregarEmprestimos(userId) {
    try {
        // Buscar compras do cliente autenticado (evita 403 e usa token)
        const compras = await CompraAPI.listarMinhas();
        const container = document.querySelector('#tab-emprestimos .card-content');
        
        if (!container) return;
        
        container.innerHTML = '<div style="display: grid; gap: 1rem; padding: 1.5rem;"></div>';
        const listContainer = container.querySelector('div');
        
        if (compras && compras.length > 0) {
            compras.forEach(compra => {
                const tipo = compra?.tipo ? String(compra.tipo).toUpperCase() : ((compra.livro?.vlAluguel != null) ? 'ALUGUEL' : 'COMPRA');
                const isAluguel = tipo === 'ALUGUEL';
                const st = String(compra.status || '').toUpperCase();
                let displayStatus = 'Finalizada';
                if (st === 'CANCELADA') displayStatus = 'Cancelada';
                else if (st === 'FINALIZADA') displayStatus = 'Finalizada';
                else if (st === 'PENDENTE') displayStatus = isAluguel ? 'Ativa' : 'Finalizada';
                const statusBadge = Utils.getStatusBadgeLabel(displayStatus);
                const livroInicial = compra.livro.titulo.substring(0, 2).toUpperCase();
                const dtFinalCalc = isAluguel
                    ? (compra.dtFim || Utils.calcularDataDevolucao(compra.dtInicio, 30))
                    : (compra.dtFim || null);
                // Dias restantes baseado na data final (dtFinalCalc) utilizando data local
                const diasRestantes = (isAluguel && dtFinalCalc)
                    ? (() => {
                        const fim = Utils.parseDateOnly(dtFinalCalc);
                        if (!fim || Number.isNaN(fim.getTime())) return 0;
                        const hoje = new Date();
                        const hojeLocal = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
                        const msDia = 1000 * 60 * 60 * 24;
                        return Math.max(0, Math.ceil((fim - hojeLocal) / msDia));
                    })()
                    : 0;
                const dataTexto = isAluguel
                    ? (`Finalizada em: ${UI.formatDate(compra.dtInicio)}` + (diasRestantes > 0 ? ` • ${diasRestantes} dias restantes` : ''))
                    : (compra.dtFim
                        ? 'Finalizada em: ' + UI.formatDate(compra.dtFim)
                        : ('Comprado em: ' + UI.formatDate(compra.dtInicio)));
                
                const item = document.createElement('div');
                item.className = 'loan-item';
                item.innerHTML = `
                    <div class="loan-details">
                        <div class="loan-cover">${(() => { const c = resolveCoverUrl(compra.livro.capaUrl); return c ? `<img src="${c}" alt="Capa de ${compra.livro.titulo}" style="width:100%;height:100%;object-fit:cover;border-radius:8px;"/>` : livroInicial; })()}</div>
                        <div>
                            <h3 class="loan-title"><a href="/pages/livro.html?id=${compra.livro.idLivro}" style="text-decoration:none;color:inherit;">${compra.livro.titulo}</a></h3>
                            <p class="subtext">${compra.livro.autor}</p>
                            <div class="loan-date">
                                <svg width="14" height="14" viewBox="0 0 24 24">
                                    <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
                                    <line x1="16" x2="16" y1="2" y2="6"/>
                                    <line x1="8" x2="8" y1="2" y2="6"/>
                                    <line x1="3" x2="21" y1="10" y2="10"/>
                                </svg>
                                <span>${dataTexto}</span>
                            </div>
                        </div>
                    </div>
                    <div class="loan-actions">
                        ${statusBadge}
                        ${st === 'PENDENTE' && isAluguel ? '<button class="btn btn-gold btn-sm" data-action="renovar" data-id="' + compra.idCompra + '">Renovar</button>' : ''}
                    </div>
                `;
                listContainer.appendChild(item);
                const btnRenovar = item.querySelector('button[data-action="renovar"]');
                if (btnRenovar) {
                    btnRenovar.addEventListener('click', () => renovarEmprestimo(compra.idCompra));
                }
            });
        } else {
            listContainer.innerHTML = '<p style="text-align: center; color: var(--muted-foreground); padding: 2rem;">Você não possui compras.</p>';
        }
    } catch (error) {
        console.error('Erro ao carregar empréstimos:', error);
        UI.showError('Erro ao carregar suas compras');
    }
}

async function carregarMultas(userId) {
    try {
        // Como não temos API específica para multas, vamos simular
        // Você pode criar uma entidade Multa no backend se necessário
        const container = document.querySelector('#tab-multas .card-content');
        
        if (!container) return;
        
        container.innerHTML = '<div style="display: grid; gap: 1rem; padding: 1.5rem;"><p style="text-align: center; color: var(--muted-foreground); padding: 2rem;">Você não possui multas pendentes.</p></div>';
    } catch (error) {
        console.error('Erro ao carregar multas:', error);
    }
}

async function carregarLivrosCliente(userId) {
    try {
        const livros = await LivroAPI.listarDisponiveis();
        const container = document.querySelector('#tab-livros .book-grid');
        
        if (!container) return;
        
        container.innerHTML = '';
        
        livros.slice(0, 6).forEach(livro => {
            const card = document.createElement('div');
            card.className = 'card book-card';
            card.innerHTML = `
                <div class="image-container">
                    <img src="${livro.imagemUrl ? livro.imagemUrl : `https://placehold.co/300x400/8c6d4e/ffffff?text=${encodeURIComponent(livro.titulo.substring(0, 15))}`}" alt="${livro.titulo}">
                </div>
                <div class="content">
                    <h3>${livro.titulo}</h3>
                    <p class="subtext">${livro.autor}</p>
                    <div style="margin: 0.5rem 0;">
                        <span class="price">${UI.formatCurrency(livro.vlCompra || livro.vlAluguel)}</span>
                    </div>
                    <button class="btn btn-gold" style="width: 100%;" data-action="alugar" data-id="${livro.idLivro}">
                        Alugar Livro
                    </button>
                </div>
            `;
            container.appendChild(card);
            const btnAlugar = card.querySelector('button[data-action="alugar"]');
            if (btnAlugar) {
                btnAlugar.addEventListener('click', () => alugarLivro(livro.idLivro));
            }
        });
    } catch (error) {
        console.error('Erro ao carregar livros:', error);
    }
}

async function renovarEmprestimo(idCompra) {
    const dias = 15;
    if (!UI.confirm(`Deseja renovar este empréstimo por mais ${dias} dias?`)) {
        return;
    }
    try {
        await CompraAPI.renovar(idCompra, dias);
        UI.showSuccess('Empréstimo renovado com sucesso!');
        location.reload();
    } catch (error) {
        console.error('Erro ao renovar empréstimo:', error);
        UI.showError(error?.message || 'Erro ao renovar empréstimo');
    }
}

async function alugarLivro(idLivro) {
    const userId = Auth.getUserId();
    
    if (!UI.confirm('Deseja alugar este livro?')) {
        return;
    }
    
    try {
        const compra = {
            cliente: { idPessoa: parseInt(userId) },
            livro: { idLivro: idLivro },
            status: 'PENDENTE'
        };
        
        await CompraAPI.criar(compra);
        UI.showSuccess('Livro alugado com sucesso!');
        
        // Recarregar empréstimos
        await carregarEmprestimos(userId);
        
        // Mudar para aba de empréstimos
        const emprestimosTab = document.querySelector('[data-tab="emprestimos"]');
        if (emprestimosTab) {
            emprestimosTab.click();
        }
    } catch (error) {
        console.error('Erro ao alugar livro:', error);
        UI.showError(error.message || 'Erro ao alugar livro');
    }
}

// Tornar funções globais
window.renovarEmprestimo = renovarEmprestimo;
window.alugarLivro = alugarLivro;
