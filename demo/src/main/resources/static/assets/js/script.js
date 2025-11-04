document.addEventListener('DOMContentLoaded', () => {
    // =============================
    // Header: estado logado e dropdown
    // =============================
    const token = localStorage.getItem('token');
    const user = (() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } })();
    const guestNav = document.getElementById('guest-nav');
    const userNav = document.getElementById('user-nav');
    const userMenuTrigger = document.getElementById('user-menu-trigger');
    const userMenu = document.getElementById('user-menu');

    if (token && user && userNav && guestNav) {
        guestNav.style.display = 'none';
        userNav.style.display = '';
        const nameEl = document.getElementById('user-name');
        const nameDdEl = document.getElementById('user-name-dd');
        const emailDdEl = document.getElementById('user-email-dd');
        if (nameEl) nameEl.textContent = user.nome || 'Minha Conta';
        if (nameDdEl) nameDdEl.textContent = user.nome || 'Usuário';
        if (emailDdEl) emailDdEl.textContent = user.email || '';

        // Controla visibilidade dos links por role
        const adminLink = document.getElementById('link-admin');
        const funcLink = document.getElementById('link-funcionario');
        const clienteLink = document.getElementById('link-cliente');
        if (adminLink) adminLink.style.display = user.role === 'ADMIN' ? '' : 'none';
        if (funcLink) funcLink.style.display = (user.role === 'FUNCIONARIO') ? '' : 'none';
        if (clienteLink) clienteLink.style.display = user.role === 'CLIENTE' ? '' : 'none';
    }

    /**
     * Funcionalidade do Carrossel (para index.html e home-logado.html)
     */
    const carousel = document.getElementById('hero-carousel');
    if (carousel) {
        const carouselContent = carousel.querySelector('.carousel-content');
        const slides = Array.from(carousel.querySelectorAll('.carousel-item'));
        const nextButton = document.getElementById('carousel-next');
        const prevButton = document.getElementById('carousel-prev');
        const dotsContainer = document.getElementById('carousel-dots');
        let currentSlide = 0;
        let slideInterval;

        function updateCarousel() {
            if (carouselContent && slides.length > 0) {
                carouselContent.style.transform = `translateX(-${currentSlide * 100}%)`;
            }
            if (dotsContainer) {
                const dots = dotsContainer.querySelectorAll('button');
                dots.forEach((dot, index) => {
                    dot.classList.toggle('active', index === currentSlide);
                });
            }
        }

        function showNextSlide() {
            currentSlide = (currentSlide + 1) % (slides.length || 1);
            updateCarousel();
        }

        if (dotsContainer) {
            slides.forEach((_, i) => {
                const button = document.createElement('button');
                button.addEventListener('click', () => {
                    currentSlide = i;
                    updateCarousel();
                    resetInterval();
                });
                dotsContainer.appendChild(button);
            });
        }
        
        function resetInterval() {
            clearInterval(slideInterval);
            slideInterval = setInterval(showNextSlide, 5000);
        }

        nextButton?.addEventListener('click', () => {
            showNextSlide();
            resetInterval();
        });
        prevButton?.addEventListener('click', () => {
            currentSlide = (currentSlide - 1 + slides.length) % slides.length;
            updateCarousel();
            resetInterval();
        });
        
        updateCarousel();
        resetInterval();
    }

    /**
     * Lista de Livros na Home via API (index.html)
     */
    const homeBookGrid = document.querySelector('.book-grid');
    if (homeBookGrid) {
        const homeSearchInput = document.getElementById('home-search-input');
        const homeSearchBtn = document.getElementById('home-search-btn');
        const homeCategorySelect = document.getElementById('home-category-select');

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

        async function loadHomeBooks(query = '') {
            try {
                const categoria = (homeCategorySelect && homeCategorySelect.value) ? homeCategorySelect.value : '';
                let livros;

                if (categoria) {
                    // Busca por gênero na API quando categoria selecionada
                    livros = await LivroAPI.buscarPorGenero(categoria);
                    // Se houver texto de busca, filtra client-side por título/autor
                    const q = (query || '').trim().toLowerCase();
                    if (q.length >= 2) {
                        livros = (livros || []).filter(l =>
                            String(l.titulo || '').toLowerCase().includes(q) ||
                            String(l.autor || '').toLowerCase().includes(q)
                        );
                    }
                } else {
                    // Sem categoria: usa título quando há query, senão lista todos
                    const q = (query || '').trim();
                    livros = q.length >= 2
                        ? await LivroAPI.buscarPorTitulo(q)
                        : await LivroAPI.listarTodos();
                }
                renderHomeBooks(livros);
            } catch (error) {
                console.error('Erro ao carregar livros da home:', error);
                homeBookGrid.innerHTML = '<div class="subtext" style="padding: 2rem; text-align:center; color: var(--muted-foreground);">Erro ao carregar livros. Tente novamente mais tarde.</div>';
            }
        }

        function renderHomeBooks(livros) {
            homeBookGrid.innerHTML = '';
            if (!livros || livros.length === 0) {
                homeBookGrid.innerHTML = '<div class="subtext" style="padding: 2rem; text-align:center; color: var(--muted-foreground);">Nenhum livro disponível</div>';
                return;
            }
            const max = Math.min(livros.length, 10);
            for (let i = 0; i < max; i++) {
                const livro = livros[i];
                const precoHtml = (livro.vlCompra != null) ? `<span class="price">${UI.formatCurrency(livro.vlCompra)}</span>` : '';
                const imgSrc = resolveCoverUrl(livro.capaUrl) || 'https://placehold.co/300x400/0a2342/ffffff?text=Livro';
                const cardHtml = `
                    <div class="card book-card">
                        <img src="${imgSrc}" alt="${livro.titulo || 'Livro'}">
                        <div class="content">
                            <h3>${livro.titulo || 'Livro'}</h3>
                            <p class="subtext">${livro.autor || ''}</p>
                            <div class="price-info">${precoHtml}</div>
                            <a href="/pages/livro.html?id=${livro.idLivro}" class="btn btn-gold" style="width: 100%">Ver Mais</a>
                        </div>
                    </div>`;
                homeBookGrid.insertAdjacentHTML('beforeend', cardHtml);
            }
        }

        // Eventos de busca na home
        if (homeSearchInput) {
            homeSearchInput.addEventListener('keyup', (e) => {
                const q = e.target.value;
                // Busca quando digitar 2+ caracteres, limpa quando vazio
                if (q.trim().length === 0 || q.trim().length >= 2) {
                    loadHomeBooks(q);
                }
            });
        }
        if (homeSearchBtn && homeSearchInput) {
            homeSearchBtn.addEventListener('click', () => {
                loadHomeBooks(homeSearchInput.value);
            });
        }

        if (homeCategorySelect) {
            homeCategorySelect.addEventListener('change', () => {
                const q = homeSearchInput ? homeSearchInput.value : '';
                loadHomeBooks(q);
            });
        }

        // Carrega inicialmente
        loadHomeBooks();
    }

    /**
     * Promoções e Aluguel: destacar mais vendidos (compras + alugueis)
     * Renderiza dinamicamente o destaque (1 livro) e os próximos 3
     */
    const promoGrid = document.querySelector('.promo-grid');
    if (promoGrid) {
        function isValidHttpUrlPromo(url) {
            if (!url || typeof url !== 'string') return false;
            try {
                const u = new URL(url);
                return u.protocol === 'http:' || u.protocol === 'https:';
            } catch (e) { return false; }
        }
        function resolveCoverUrlPromo(url) {
            if (!url) return null;
            const raw = String(url).trim();
            if (isValidHttpUrlPromo(raw)) return raw;
            try {
                if (raw.startsWith('/') || raw.startsWith('./') || /^[^:]+\//.test(raw)) {
                    return new URL(raw, window.location.origin).href;
                }
            } catch(e) { return null; }
            return null;
        }

        async function carregarMaisVendidos() {
            // Tenta obter dados globais de compras; se não houver permissão, faz fallback para lista de livros
            try {
                let compras = [];
                let podeListarCompras = false;
                try {
                    const user = (typeof Auth !== 'undefined' && Auth.getUser) ? Auth.getUser() : null;
                    const role = user?.role;
                    // Em ambientes com segurança, listar todas as compras geralmente exige ADMIN/FUNCIONARIO
                    podeListarCompras = !!(role === 'ADMIN' || role === 'FUNCIONARIO');
                } catch (_) { podeListarCompras = false; }

                if (podeListarCompras) {
                    compras = await CompraAPI.listarTodas();
                } else {
                    // Para CLIENTE/visitante, não chamar endpoints de compras para evitar 403 e redirecionamentos
                    compras = [];
                }

                // Monta ranking por livro considerando compras + alugueis (qualquer compra não cancelada)
                const ranking = new Map();
                if (Array.isArray(compras)) {
                    compras.forEach(c => {
                        const st = String(c?.status || '').toUpperCase();
                        if (st === 'CANCELADA') return;
                        const livro = c?.livro;
                        const id = livro?.idLivro;
                        if (!id) return;
                        const prev = ranking.get(id) || { count: 0, livro };
                        prev.count += 1;
                        prev.livro = livro || prev.livro;
                        ranking.set(id, prev);
                    });
                }

                let top = Array.from(ranking.values()).sort((a, b) => b.count - a.count).slice(0, 4);
                let origem = 'compras/alugueis';
                if (!top || top.length === 0) {
                    // Fallback: usa lista de livros para preencher visualmente
                    const livros = await LivroAPI.listarTodos().catch(() => []);
                    top = (Array.isArray(livros) ? livros.slice(0, 4).map(l => ({ count: 0, livro: l })) : []);
                    origem = 'catálogo';
                }

                if (!top || top.length === 0) return; // nada a renderizar

                // Destaque: primeiro
                const destaque = top[0]?.livro;
                const destaqueImg = resolveCoverUrlPromo(destaque?.capaUrl) || 'https://placehold.co/300x400/0a2342/ffffff?text=Livro';
                const precoHtml = (destaque?.vlCompra != null) ? `<span class="price">${UI.formatCurrency(destaque.vlCompra)}</span>` : '';
                const leftHtml = `
                    <div class="card book-card">
                        <img src="${destaqueImg}" alt="${destaque?.titulo || 'Livro'}">
                        <div class="content">
                            <h3>${destaque?.titulo || 'Livro'}</h3>
                            <p class="subtext">${destaque?.autor || ''}</p>
                            <div class="price-info">${precoHtml}</div>
                            <a href="/pages/livro.html?id=${destaque?.idLivro}" class="btn btn-gold" style="width: 100%">Ver Mais</a>
                        </div>
                    </div>`;

                // Próximos 3
                const proximos3 = top.slice(1).map(x => x.livro);
                let imagensHtml = '';
                proximos3.forEach(l => {
                    const img = resolveCoverUrlPromo(l?.capaUrl) || 'https://placehold.co/150x200/0a2342/ffffff?text=Livro';
                    const alt = l?.titulo || 'Bestseller';
                    imagensHtml += `<a href="/pages/livro.html?id=${l?.idLivro}" title="${alt}"><img src="${img}" alt="${alt}"></a>`;
                });

                const rightHtml = `
                    <div class="card bestsellers-card">
                        <h3 style="font-size: 1.5rem; font-weight: 600; margin-bottom: 1rem;">Os Livros Mais Vendidos</h3>
                        <p class="subtext" style="margin-bottom: 1.5rem;">Baseado em ${origem}. Atualizado automaticamente.</p>
                        <div class="bestsellers-images">
                            ${imagensHtml || '<div class="subtext">Sem dados suficientes</div>'}
                        </div>
                        <a href="/pages/catalogo.html" class="btn btn-gold" style="width: 100%;">Ver Todos os Bestsellers</a>
                    </div>`;
                // Removida a faixa de promoção: renderiza apenas destaque e mais vendidos
                promoGrid.innerHTML = leftHtml + rightHtml;
            } catch (error) {
                console.error('Erro ao carregar mais vendidos:', error);
            }
        }

        carregarMaisVendidos();
    }
    /**
     * Funcionalidade de Busca (para home-logado.html)
     */
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        const allBooksData = document.getElementById('all-books-data');
        if (allBooksData) {
            const allBooks = JSON.parse(allBooksData.textContent);
            const resultsGrid = document.getElementById('search-results-grid');
            const resultsCount = document.getElementById('search-results-count');
            const noResultsMessage = document.getElementById('no-results-message');

            function renderBooks(books) {
                resultsGrid.innerHTML = '';
                noResultsMessage.style.display = (books.length === 0 && searchInput.value) ? 'block' : 'none';
                books.forEach(book => {
                    const originalPriceHtml = book.originalPrice ? `<span style="text-decoration: line-through; color: var(--muted-foreground); font-size: 0.85rem;">${book.originalPrice}</span>` : '';
                    resultsGrid.insertAdjacentHTML('beforeend', `
                        <div class="card book-card">
                            <div class="image-container"><img src="${book.image}" alt="${book.title}"></div>
                            <div class="content">
                                <h3>${book.title}</h3>
                                <p class="subtext">${book.author}</p>
                                <div style="display: flex; align-items: baseline; gap: 0.5rem; margin: 0.5rem 0;">
                                    <span style="font-weight: 700; color: var(--gold); font-size: 1.1rem;">${book.price}</span>
                                    ${originalPriceHtml}
                                </div>
                                <button class="btn btn-gold" style="width: 100%;">Ver Mais</button>
                            </div>
                        </div>`);
                });
            }

            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                if (!searchTerm) {
                    renderBooks(allBooks);
                    resultsCount.textContent = `${allBooks.length} livros disponíveis`;
                    return;
                }
                const filteredBooks = allBooks.filter(book =>
                    book.title.toLowerCase().includes(searchTerm) || book.author.toLowerCase().includes(searchTerm)
                );
                renderBooks(filteredBooks);
                resultsCount.textContent = `${filteredBooks.length} livro(s) encontrado(s) para "${e.target.value}"`;
            });
            renderBooks(allBooks);
        }
    }

    /**
     * Funcionalidade das Abas (Tabs) para Painéis
     */
    const tabsContainer = document.querySelector('.tabs-container');
    if (tabsContainer) {
        const tabTriggers = tabsContainer.querySelectorAll('.tabs-trigger');
        const tabContents = tabsContainer.querySelectorAll('.tabs-content');
        
        tabTriggers.forEach(trigger => {
            trigger.addEventListener('click', () => {
                const targetTabId = 'tab-' + trigger.dataset.tab;
                tabTriggers.forEach(t => t.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));
                trigger.classList.add('active');
                document.getElementById(targetTabId)?.classList.add('active');
            });
        });
    }

    /**
     * Funcionalidade de Mostrar/Ocultar Senha
     */
    const passwordToggles = document.querySelectorAll('.password-toggle');
    if (passwordToggles.length > 0) {
        passwordToggles.forEach(button => {
            const targetInputId = button.dataset.target;
            const targetInput = document.getElementById(targetInputId);
            if(targetInput) {
                button.addEventListener('click', () => {
                    const isPassword = targetInput.type === 'password';
                    targetInput.type = isPassword ? 'text' : 'password';
                });
            }
        });
    }

    /**
     * Dropdown do Usuário (home/index.html)
     * Suporta os IDs atuais: #user-menu-trigger e #user-menu
     */
    if (userMenuTrigger && userMenu) {
        userMenuTrigger.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            userMenu.classList.toggle('active');
        });

        document.addEventListener('click', (event) => {
            const clickedOutsideMenu = !userMenu.contains(event.target);
            const clickedOutsideTrigger = !userMenuTrigger.contains(event.target);
            if (clickedOutsideMenu && clickedOutsideTrigger) {
                userMenu.classList.remove('active');
            }
        });
    }

    // Handler de logout para elementos com [data-logout]
    document.querySelectorAll('[data-logout]').forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            if (typeof Auth !== 'undefined' && Auth.logout) {
                Auth.logout();
            }
        });
    });

    // Fallback global: delegação para qualquer .password-toggle
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.password-toggle');
        if (!btn) return;
        const targetId = btn.getAttribute('data-target');
        if (!targetId) return;
        const input = document.getElementById(targetId);
        if (!input) return;
        input.type = input.type === 'password' ? 'text' : 'password';
    });

});