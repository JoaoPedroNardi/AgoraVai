// minhas-compras.js - Página de listagem das compras do cliente autenticado

document.addEventListener('DOMContentLoaded', () => {
    // Verifica autenticação
    if (typeof Auth === 'undefined' || !Auth.isLoggedIn()) {
        if (typeof UI !== 'undefined' && UI.showWarning) {
            UI.showWarning('Faça login para ver suas compras');
        }
        window.location.href = '/pages/login.html';
        return;
    }

    const container = document.getElementById('compras-container');
    const emptyState = document.getElementById('empty-state');
    const logoutBtn = document.getElementById('logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => Auth.logout());
    }

    // Mostrar skeleton e carregar compras
    showSkeletonCompras(container, 4);
    loadCompras(container, emptyState);
});

async function loadCompras(container, emptyState) {
    try {
        // Endpoint protegido: /api/compras/minhas
        const compras = await CompraAPI.listarMinhas();
        // 204 retorna null pelo fetchAPI
        if (!compras || !Array.isArray(compras) || compras.length === 0) {
            container.innerHTML = '';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }

        if (emptyState) emptyState.style.display = 'none';
        container.innerHTML = compras.map(renderCompraCard).join('');
    } catch (error) {
        console.error('Erro ao carregar compras:', error);
        if (typeof UI !== 'undefined' && UI.showError) {
            UI.showError(error.message || 'Erro ao carregar suas compras');
        } else {
            alert(error.message || 'Erro ao carregar suas compras');
        }
    }
}

function showSkeletonCompras(container, count = 4) {
    try {
        const qty = Math.max(3, Number(count) || 4);
        const cards = [];
        for (let i = 0; i < qty; i++) {
            const w1 = 50 + Math.floor(Math.random() * 30);
            const w2 = 30 + Math.floor(Math.random() * 40);
            const w3 = 20 + Math.floor(Math.random() * 50);
            cards.push(`
                <div class="card">
                    <div class="card-title"><div class="skeleton-cell" style="width:${w1}%; height:1rem;"></div></div>
                    <div class="muted"><div class="skeleton-cell" style="width:${w2}%; height:0.9rem;"></div></div>
                    <div class="muted"><div class="skeleton-cell" style="width:${w3}%; height:0.9rem;"></div></div>
                    <div style="margin-top:0.5rem;"><div class="skeleton-cell" style="width:30%; height:0.8rem;"></div></div>
                </div>
            `);
        }
        container.innerHTML = cards.join('');
    } catch {
        container.innerHTML = `<div class="card"><div class="skeleton-cell" style="width:100%; height:1rem;"></div></div>`;
    }
}

function renderCompraCard(compra) {
    const livro = compra.livro || {};
    const titulo = livro.titulo || 'Livro';
    const autor = livro.autor ? `• ${livro.autor}` : '';
    const status = compra.status || 'PENDENTE';
    const tipoRaw = compra?.tipo ? String(compra.tipo).trim().toUpperCase() : null;
    const tipo = (tipoRaw === 'COMPRA' || tipoRaw === 'ALUGUEL')
        ? tipoRaw
        : ((livro?.vlAluguel != null) ? 'ALUGUEL' : 'COMPRA');
    const isAluguel = tipo === 'ALUGUEL';
    const st = String(compra.status || '').toUpperCase();
    const dtInicio = compra.dtInicio ? UI.formatDateOnly(compra.dtInicio) : '-';
    const dtFinalCalcRaw = isAluguel
        ? (compra.dtFim || (compra.dtInicio ? Utils.calcularDataDevolucao(compra.dtInicio, 30) : null))
        : (compra.dtFim || null);
    const dtFim = dtFinalCalcRaw ? UI.formatDateOnly(dtFinalCalcRaw) : '-';
    // Dias restantes baseado na data final
    const diasRestantes = (isAluguel && dtFinalCalcRaw && st !== 'FINALIZADA' && st !== 'CANCELADA')
        ? (() => {
            const fim = Utils.parseDateOnly(dtFinalCalcRaw);
            if (!fim || Number.isNaN(fim.getTime())) return 0;
            const hoje = new Date();
            const hojeLocal = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
            const msDia = 1000 * 60 * 60 * 24;
            return Math.max(0, Math.ceil((fim - hojeLocal) / msDia));
        })()
        : 0;
    const preco = livro.vlCompra != null ? `R$ ${Number(livro.vlCompra).toFixed(2)}` : '';
    const aluguel = livro.vlAluguel != null ? `• Aluguel: R$ ${Number(livro.vlAluguel).toFixed(2)}` : '';

    return `
        <div class="card">
            <div class="card-title">${escapeHtml(titulo)} <span class="muted">${escapeHtml(autor)}</span></div>
            <div class="muted">${isAluguel ? `Finalizada em: ${dtInicio}${diasRestantes > 0 ? ` • ${diasRestantes} dias restantes` : ''}` : `Início: ${dtInicio} • Fim: ${dtFim}`}</div>
            <div class="muted">${preco} ${aluguel}</div>
            <div style="margin-top:0.5rem;">
                <span class="status ${escapeHtml(status)}">${escapeHtml(status)}</span>
            </div>
        </div>
    `;
}



function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}