// Página de Livro - lógica dinâmica extraída de livro.html
(function() {
  let livroAtual = null;

  function isValidHttpUrl(url) {
    if (!url || typeof url !== 'string') return false;
    try {
      const u = new URL(url);
      return u.protocol === 'http:' || u.protocol === 'https:';
    } catch (e) {
      return false;
    }
  }

  function resolveCoverUrl(url) {
    if (!url) return null;
    const raw = String(url).trim();
    if (isValidHttpUrl(raw)) return raw;
    // Tratar caminhos relativos (ex.: /uploads/capas/x.jpg ou uploads/x.jpg)
    try {
      if (raw.startsWith('/') || raw.startsWith('./') || /^[^:]+\//.test(raw)) {
        return new URL(raw, window.location.origin).href;
      }
    } catch (e) {
      return null;
    }
    return null;
  }

  function goBack() {
    if (window.history.length > 1) {
      window.history.back();
    } else {
 window.location.href = '/index.html';
    }
  }

  function renderRating(nota, totalAvaliacoes) {
    const starsContainer = document.getElementById('rating-stars');
    const textContainer = document.getElementById('rating-text');
    if (nota) {
      starsContainer.innerHTML = Utils.renderizarEstrelas(parseFloat(nota));
      textContainer.textContent = `${parseFloat(nota).toFixed(1)} (${totalAvaliacoes} avaliação${totalAvaliacoes === 1 ? '' : 's'})`;
    } else {
      starsContainer.innerHTML = Utils.renderizarEstrelas(0);
      textContainer.textContent = `${totalAvaliacoes} avaliação${totalAvaliacoes === 1 ? '' : 's'}`;
    }
  }

  async function carregarLivro() {
    try {
      const params = new URLSearchParams(window.location.search);
      const id = params.get('id');

      let livro = null;
      if (id) {
        livro = await LivroAPI.buscarPorId(parseInt(id));
      } else {
        const todos = await LivroAPI.listarTodos();
        livro = todos && todos.length > 0 ? todos[0] : null;
      }

      if (!livro) {
        UI.showWarning('Livro não encontrado');
        return;
      }

      livroAtual = livro;
      document.title = `${livro.titulo} - Bibliotech`;

      const bookTitleDiv = document.querySelector('.book-title');
      const coverBorder = document.querySelector('.cover-border');
      const coverUrl = resolveCoverUrl(livro.capaUrl);
      if (coverUrl && coverBorder) {
        // Remover o fundo de papel e inserir a imagem de capa
        coverBorder.style.background = 'none';
        const existingImg = coverBorder.querySelector('.cover-image');
        if (!existingImg) {
          const img = document.createElement('img');
          img.className = 'cover-image';
          img.src = coverUrl;
          img.alt = livro.titulo || 'Capa do Livro';
          // Fallback visual se a imagem falhar
          img.addEventListener('error', () => {
            coverBorder.style.background = '';
            img.remove();
            if (bookTitleDiv) bookTitleDiv.style.display = '';
          });
          coverBorder.appendChild(img);
        } else {
          existingImg.src = coverUrl;
          existingImg.alt = livro.titulo || 'Capa do Livro';
        }
        if (bookTitleDiv) bookTitleDiv.style.display = 'none';
      } else if (bookTitleDiv) {
        // Fallback com título estilizado na capa
        const palavras = (livro.titulo || '-').split(' ');
        const linha1 = palavras.slice(0, 1).join(' ');
        const linha2 = palavras.slice(1, 3).join(' ');
        bookTitleDiv.innerHTML = `
          <div class="title-main">${linha1 || '-'}</div>
          <div class="title-main">${linha2 || ''}</div>
        `;
        bookTitleDiv.style.display = '';
      }

      // Badge de URL inválida da capa (se houver valor informado, mas não resolvível)
      const details = document.querySelector('.book-details');
      const existingBadge = document.querySelector('.badge-warning.cover-url-badge');
      if (!coverUrl && livro.capaUrl && details && !existingBadge) {
        const badge = document.createElement('div');
        badge.className = 'badge badge-warning cover-url-badge';
        badge.textContent = 'URL da capa inválida';
        details.insertBefore(badge, details.firstChild);
      } else if (coverUrl && existingBadge) {
        existingBadge.remove();
      }

      document.getElementById('genre-tag').textContent = livro.genero || '-';
      document.getElementById('book-title').textContent = livro.titulo || '-';
      document.getElementById('book-author').textContent = livro.autor ? `por ${livro.autor}` : '-';

      document.getElementById('price-compra').textContent = livro.vlCompra ? UI.formatCurrency(livro.vlCompra) : '-';
      document.getElementById('price-aluguel').textContent = livro.vlAluguel ? UI.formatCurrency(livro.vlAluguel) : '-';

      document.getElementById('meta-genero').textContent = livro.genero || '-';
      document.getElementById('meta-publicacao').textContent = UI.formatDate(livro.dtPublicacao) || '-';
      // Disponibilidade removida do modelo e UI
      document.getElementById('meta-preco-compra').textContent = livro.vlCompra ? UI.formatCurrency(livro.vlCompra) : '-';
      document.getElementById('meta-preco-aluguel').textContent = livro.vlAluguel ? UI.formatCurrency(livro.vlAluguel) : '-';

      const avaliacoes = await AvaliacaoAPI.buscarPorLivro(livro.idLivro);
      renderRating(livro.avaliacao, (avaliacoes || []).length);

      const reviewsContainer = document.getElementById('reviews-container');
      if (avaliacoes && avaliacoes.length > 0) {
        reviewsContainer.innerHTML = avaliacoes.map(av => `
          <div class="review">
            <div class="reviewer">
              <span class="reviewer-name">${av.cliente?.nome || 'Cliente'}</span>
              <span class="review-date">${UI.formatDate(av.dtAvaliacao)}</span>
            </div>
            <div class="rating">
              <span class="stars">${Utils.renderizarEstrelas(parseFloat(av.nota))}</span>
            </div>
            <p class="review-text">${Utils.comentarioPorEstrelas(parseFloat(av.nota), av.comentario)}</p>
          </div>
        `).join('');
      } else {
        reviewsContainer.innerHTML = '<p class="subtext" style="color:#666;">Nenhuma avaliação encontrada.</p>';
      }

      // Descrição/Resumo curto em "Sobre o Livro"
      const desc = document.getElementById('book-description');
      if (desc) {
        const texto = (livro.resumoCurto && String(livro.resumoCurto).trim().length > 0)
          ? String(livro.resumoCurto).trim()
          : 'Descrição não disponível.';
        desc.textContent = texto;
      }

      // Controlar botão de avaliação e dica de elegibilidade
      const btnAvaliar = document.getElementById('btn-avaliar');
      const hintAvaliar = document.getElementById('avaliar-hint');
      if (btnAvaliar) {
        btnAvaliar.disabled = true;
        btnAvaliar.title = 'Disponível apenas para quem comprou ou alugou';

        if (!Auth.isLoggedIn()) {
          // Usuário não logado: ocultar botão e mostrar dica para login
          btnAvaliar.style.display = 'none';
          if (hintAvaliar) {
            hintAvaliar.style.display = 'block';
            hintAvaliar.textContent = 'Faça login e compre ou alugue para poder avaliar.';
          }
        } else {
          // Usuário logado: se não for CLIENTE, evitar chamada a endpoint protegido (previne 403 + redirect)
          const user = Auth.getUser();
          const role = user?.role;
          if (role !== 'CLIENTE') {
            btnAvaliar.style.display = 'none';
            if (hintAvaliar) {
              hintAvaliar.style.display = 'block';
              hintAvaliar.textContent = 'Somente clientes podem avaliar livros.';
            }
          } else {
            // Cliente logado: verificar elegibilidade por compra/aluguel
            try {
              const minhasCompras = await CompraAPI.listarMinhas();
              const elegivel = (minhasCompras || []).some(c => {
                const idLivroCompra = c?.livro?.idLivro;
                const status = String(c?.status || '').toUpperCase();
                return idLivroCompra === livro.idLivro && status !== 'CANCELADA';
              });
              btnAvaliar.style.display = 'inline-block';
              btnAvaliar.disabled = !elegivel;
              btnAvaliar.title = elegivel ? 'Avaliar este livro' : 'Disponível apenas para quem comprou ou alugou';
              if (hintAvaliar) {
                hintAvaliar.style.display = elegivel ? 'none' : 'block';
                hintAvaliar.textContent = 'Você só pode avaliar livros que comprou ou alugou.';
              }
            } catch (e) {
              console.warn('Falha ao verificar elegibilidade de avaliação:', e);
              btnAvaliar.style.display = 'inline-block';
              btnAvaliar.disabled = true;
              if (hintAvaliar) {
                hintAvaliar.style.display = 'block';
                hintAvaliar.textContent = 'Não foi possível verificar elegibilidade no momento.';
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Erro ao carregar livro:', error);
      UI.showError('Erro ao carregar dados do livro');
    }
  }

  function buyBook() {
    if (!livroAtual) return;
    // Disponibilidade removida: apenas exigir login
    if (!Auth.isLoggedIn()) {
      Modal.confirm(
        'Login Necessário',
        'Você precisa estar logado para comprar. Ir para o login?',
    () => window.location.href = '/pages/login.html'
      );
      return;
    }
    Carrinho.adicionar(livroAtual, 'compra');
  }

  function rentBook() {
    if (!livroAtual) return;
    // Disponibilidade removida: apenas exigir login
    if (!Auth.isLoggedIn()) {
      Modal.confirm(
        'Login Necessário',
        'Você precisa estar logado para alugar. Ir para o login?',
    () => window.location.href = '/pages/login.html'
      );
      return;
    }
    Carrinho.adicionar(livroAtual, 'aluguel');
  }

  function toggleFavorite(e) {
    const btn = e.target;
    const favoritado = btn.innerHTML === '♥';
    btn.innerHTML = favoritado ? '♡' : '♥';
    btn.style.color = favoritado ? '#666' : '#ff4757';
    Toast.info(favoritado ? 'Livro removido dos favoritos' : 'Livro adicionado aos favoritos');
  }

  function shareBook() {
    const titulo = livroAtual?.titulo || 'Livro';
    if (navigator.share) {
      navigator.share({
        title: `${titulo} - Bibliotech`,
        text: 'Confira este título na Bibliotech!',
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href).then(() => {
        Toast.info('Link copiado!');
      });
    }
  }

  function evaluateBook() {
    const btnAvaliar = document.getElementById('btn-avaliar');
    if (btnAvaliar && btnAvaliar.disabled) {
      Toast.info('Você só pode avaliar livros que comprou ou alugou.');
      return;
    }
    if (!Auth.isLoggedIn()) {
      Modal.confirm(
        'Login Necessário',
        'Você precisa estar logado para avaliar. Ir para o login?',
        () => window.location.href = '/pages/login.html'
      );
      return;
    }

    if (!livroAtual) {
      Toast.warning('Livro ainda está carregando. Tente novamente.');
      return;
    }

    if (window.LivroModals && typeof window.LivroModals.abrirAvaliarLivro === 'function') {
      window.LivroModals.abrirAvaliarLivro(livroAtual.idLivro, livroAtual.titulo);
    } else {
      Toast.info('Módulo de avaliação indisponível no momento.');
    }
  }

  document.addEventListener('DOMContentLoaded', function() {
    const cover = document.querySelector('.book-cover');
    if (cover) {
      cover.style.transform = 'scale(0.95)';
      setTimeout(() => {
        cover.style.transform = 'scale(1)';
        cover.style.transition = 'transform 0.5s ease';
      }, 100);
    }

    document.querySelectorAll('.option-card').forEach(card => {
      card.addEventListener('mouseenter', function() {
        this.style.borderColor = '#ffd700';
        this.style.boxShadow = '0 2px 8px rgba(255, 215, 0, 0.2)';
      });

      card.addEventListener('mouseleave', function() {
        this.style.borderColor = '#e0e0e0';
        this.style.boxShadow = 'none';
      });
    });

    // Registro de eventos
    const backArrow = document.querySelector('.back-arrow');
    backArrow && backArrow.addEventListener('click', goBack);

    const btnComprar = document.getElementById('btn-comprar');
    btnComprar && btnComprar.addEventListener('click', buyBook);

    const btnAlugar = document.getElementById('btn-alugar');
    btnAlugar && btnAlugar.addEventListener('click', rentBook);

    const btnFavoritar = document.getElementById('btn-favoritar');
    btnFavoritar && btnFavoritar.addEventListener('click', toggleFavorite);

    const btnCompartilhar = document.getElementById('btn-compartilhar');
    btnCompartilhar && btnCompartilhar.addEventListener('click', shareBook);

    const btnAvaliar = document.getElementById('btn-avaliar');
    if (btnAvaliar) {
      btnAvaliar.disabled = true;
      btnAvaliar.addEventListener('click', evaluateBook);
    }

    carregarLivro();
  });

  // Expor funções usadas nos atributos onclick do HTML
  window.goBack = goBack;
  window.buyBook = buyBook;
  window.rentBook = rentBook;
  window.toggleFavorite = toggleFavorite;
  window.shareBook = shareBook;
  window.evaluateBook = evaluateBook;
})();