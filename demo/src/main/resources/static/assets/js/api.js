// ========================================
// API.JS - INTEGRAÇÃO COM BACKEND
// ========================================

// Configuração da API
// Evita hardcode de localhost:8080 usando caminho relativo à origem.
// Permite override via window.__API_BASE_URL__ ou localStorage('apiBaseUrl') para cenários específicos.
const API_BASE_URL = (typeof window !== 'undefined' && window.__API_BASE_URL__)
    || (typeof localStorage !== 'undefined' && localStorage.getItem('apiBaseUrl'))
    || '/api';

// ========================================
// UTILITÁRIOS
// ========================================

// Gerenciamento de autenticação
const Auth = {
    setUser(user) {
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('userId', user.idPessoa);
        localStorage.setItem('userName', user.nome);
        localStorage.setItem('userEmail', user.email);
    },
    
    getUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },
    
    getUserId() {
        return localStorage.getItem('userId');
    },
    
    getToken() {
        return localStorage.getItem('token');
    },
    
    isLoggedIn() {
        return !!localStorage.getItem('token');
    },
    
    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        window.location.href = '/index.html';
    },

    redirectByRole(role) {
        const r = role || (this.getUser()?.role);
        switch (r) {
            case 'ADMIN':
                window.location.href = '/pages/admin.html';
                break;
            case 'FUNCIONARIO':
                window.location.href = '/pages/funcionario.html';
                break;
            case 'CLIENTE':
                window.location.href = '/pages/cliente.html';
                break;
            default:
                window.location.href = '/index.html';
        }
    }
};

// Função auxiliar para fazer requisições
async function fetchAPI(endpoint, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {})
    };
    const token = localStorage.getItem('token');
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    const config = { ...options, headers };
    
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        
        if (response.status === 401) {
            if (typeof UI !== 'undefined' && UI.showWarning) {
                UI.showWarning('Sessão expirada. Faça login novamente.');
            } else {
                alert('Sessão expirada. Faça login novamente.');
            }
            Auth.logout();
            throw new Error('Não autorizado');
        }
        
        if (response.status === 403) {
            // Evitar spam de mensagens: mostra apenas uma vez por página
            const showWarn = !window.__permissionWarned;
            if (showWarn) {
                window.__permissionWarned = true;
                if (typeof UI !== 'undefined' && UI.showWarning) {
                    UI.showWarning('Você não tem permissão para esta ação');
                } else {
                    alert('Você não tem permissão para esta ação');
                }
            }
            // Redirecionar automaticamente para o painel correto conforme role do usuário
            try {
                const user = (typeof Auth !== 'undefined' && Auth.getUser) ? Auth.getUser() : null;
                const role = user?.role;
                if (role) {
                    // Se estiver na página do Admin sem ser ADMIN, envia para o painel adequado
                    if (typeof Auth !== 'undefined' && Auth.redirectByRole) {
                        Auth.redirectByRole(role);
                    } else {
                        window.location.href = '/index.html';
                    }
                } else {
                    // Sem usuário válido, exigir login
                    window.location.href = '/pages/login.html';
                }
            } catch (_) {}
            throw new Error('Sem permissão');
        }
        
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || 'Erro na requisição');
        }
        
        // Retorna vazio para DELETE
        if (response.status === 204) {
            return null;
        }
        
        return await response.json();
    } catch (error) {
        console.error('Erro na API:', error);
        throw error;
    }
}

// ========================================
// API DE AUTENTICAÇÃO
// ========================================

const AuthAPI = {
    async login(email, senha) {
        return fetchAPI('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, senha })
        });
    },

    async register(cliente) {
        return fetchAPI('/auth/registro', {
            method: 'POST',
            body: JSON.stringify(cliente)
        });
    }
};

// ========================================
// API DE CLIENTES
// ========================================

const ClienteAPI = {
    async cadastrar(cliente) {
        return fetchAPI('/clientes', {
            method: 'POST',
            body: JSON.stringify(cliente)
        });
    },

    // Alias para manter consistência com outros módulos (LivroAPI.criar, etc.)
    async criar(cliente) {
        return fetchAPI('/clientes', {
            method: 'POST',
            body: JSON.stringify(cliente)
        });
    },
    
    async listarTodos() {
        return fetchAPI('/clientes');
    },
    
    async buscarPorId(id) {
        return fetchAPI(`/clientes/${id}`);
    },
    
    async atualizar(id, cliente) {
        return fetchAPI(`/clientes/${id}`, {
            method: 'PUT',
            body: JSON.stringify(cliente)
        });
    },
    
    async deletar(id) {
        return fetchAPI(`/clientes/${id}`, {
            method: 'DELETE'
        });
    }
};

// ========================================
// API DE LIVROS
// ========================================

const LivroAPI = {
    async listarTodos() {
        return fetchAPI('/livros');
    },
    
    async buscarPorId(id) {
        return fetchAPI(`/livros/${id}`);
    },
    
    async buscarPorTitulo(titulo) {
        return fetchAPI(`/livros/buscar/titulo?titulo=${encodeURIComponent(titulo)}`);
    },
    
    async buscarPorAutor(autor) {
        return fetchAPI(`/livros/buscar/autor?autor=${encodeURIComponent(autor)}`);
    },
    
    async buscarPorGenero(genero) {
        return fetchAPI(`/livros/buscar/genero?genero=${encodeURIComponent(genero)}`);
    },
    
    async listarDisponiveis() {
        // Disponibilidade removida: retorna todos como fallback
        return this.listarTodos();
    },
    
    async criar(livro) {
        return fetchAPI('/livros', {
            method: 'POST',
            body: JSON.stringify(livro)
        });
    },
    
    async atualizar(id, livro) {
        return fetchAPI(`/livros/${id}`, {
            method: 'PUT',
            body: JSON.stringify(livro)
        });
    },
    
    async deletar(id) {
        return fetchAPI(`/livros/${id}`, {
            method: 'DELETE'
        });
    }
};

// ========================================
// API DE COMPRAS
// ========================================

const CompraAPI = {
    async listarTodas() {
        return fetchAPI('/compras');
    },
    
    // Lista compras do cliente autenticado
    async listarMinhas() {
        return fetchAPI('/compras/minhas');
    },
    
    async buscarPorId(id) {
        return fetchAPI(`/compras/${id}`);
    },
    
    async buscarPorCliente(clienteId) {
        return fetchAPI(`/compras/cliente/${clienteId}`);
    },
    
    async buscarPorStatus(status) {
        return fetchAPI(`/compras/status/${status}`);
    },
    
    async criar(compra) {
        return fetchAPI('/compras', {
            method: 'POST',
            body: JSON.stringify(compra)
        });
    },
    
    async atualizarStatus(id, status) {
        return fetchAPI(`/compras/${id}/status?status=${status}`, {
            method: 'PATCH'
        });
    },
    
    async finalizar(id) {
        return fetchAPI(`/compras/${id}/finalizar`, {
            method: 'PATCH'
        });
    },

    async renovar(id, dias = 15) {
        return fetchAPI(`/compras/${id}/renovar?dias=${dias}`, {
            method: 'PATCH'
        });
    },
    
    async deletar(id) {
        return fetchAPI(`/compras/${id}`, {
            method: 'DELETE'
        });
    }
};

// ========================================
// API DE AVALIAÇÕES
// ========================================

const AvaliacaoAPI = {
    async listarTodas() {
        return fetchAPI('/avaliacoes');
    },
    
    async buscarPorId(id) {
        return fetchAPI(`/avaliacoes/${id}`);
    },
    
    async buscarPorLivro(livroId) {
        return fetchAPI(`/avaliacoes/livro/${livroId}`);
    },
    
    async buscarPorCliente(clienteId) {
        return fetchAPI(`/avaliacoes/cliente/${clienteId}`);
    },
    
    async criar(avaliacao) {
        return fetchAPI('/avaliacoes', {
            method: 'POST',
            body: JSON.stringify(avaliacao)
        });
    },
    
    async atualizar(id, avaliacao) {
        return fetchAPI(`/avaliacoes/${id}`, {
            method: 'PUT',
            body: JSON.stringify(avaliacao)
        });
    },
    
    async deletar(id) {
        return fetchAPI(`/avaliacoes/${id}`, {
            method: 'DELETE'
        });
    }
};

// ========================================
// API DE FUNCIONÁRIOS
// ========================================

const FuncionarioAPI = {
    async listarTodos() {
        return fetchAPI('/funcionarios');
    },
    
    async buscarPorId(id) {
        return fetchAPI(`/funcionarios/${id}`);
    },
    
    async criar(funcionario) {
        return fetchAPI('/funcionarios', {
            method: 'POST',
            body: JSON.stringify(funcionario)
        });
    },
    
    async atualizar(id, funcionario) {
        return fetchAPI(`/funcionarios/${id}`, {
            method: 'PUT',
            body: JSON.stringify(funcionario)
        });
    },
    
    async deletar(id) {
        return fetchAPI(`/funcionarios/${id}`, {
            method: 'DELETE'
        });
    }
};

// ========================================
// API DE ADMINISTRADORES
// ========================================

const AdminAPI = {
    async listarTodos() {
        return fetchAPI('/administradores');
    },
    
    async buscarPorId(id) {
        return fetchAPI(`/administradores/${id}`);
    },
    
    async criar(admin) {
        return fetchAPI('/administradores', {
            method: 'POST',
            body: JSON.stringify(admin)
        });
    },
    
    async atualizar(id, admin) {
        return fetchAPI(`/administradores/${id}`, {
            method: 'PUT',
            body: JSON.stringify(admin)
        });
    },
    
    async deletar(id) {
        return fetchAPI(`/administradores/${id}`, {
            method: 'DELETE'
        });
    }
};

// ========================================
// UTILITÁRIOS DE UI
// ========================================

const UI = {
    showLoading(element) {
        if (element) {
            element.disabled = true;
            const originalText = element.innerHTML;
            element.setAttribute('data-original-text', originalText);
            element.innerHTML = '<span>Carregando...</span>';
        }
    },
    
    hideLoading(element, originalText) {
        if (element) {
            element.disabled = false;
            const text = originalText || element.getAttribute('data-original-text') || 'Enviar';
            element.innerHTML = text;
        }
    },
    
    showError(message) {
        if (window.Toast) {
            Toast.error(message);
        } else {
            alert('Erro: ' + message);
        }
    },
    
    showSuccess(message) {
        if (window.Toast) {
            Toast.success(message);
        } else {
            alert('Sucesso: ' + message);
        }
    },
    
    showWarning(message) {
        if (window.Toast) {
            Toast.warning(message);
        } else {
            alert('Aviso: ' + message);
        }
    },
    
    showInfo(message) {
        if (window.Toast) {
            Toast.info(message);
        } else {
            alert('Info: ' + message);
        }
    },
    
    formatDate(dateString) {
        if (!dateString) return '-';
        try {
            const str = String(dateString).trim();
            // Tratar datas no formato YYYY-MM-DD como data local (sem UTC)
            if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
                const [y, m, d] = str.split('-').map(Number);
                const date = new Date(y, m - 1, d);
                return date.toLocaleDateString('pt-BR');
            }
            const date = new Date(str);
            return date.toLocaleDateString('pt-BR');
        } catch {
            return String(dateString);
        }
    },
    
    // Alias para formatDate - função específica para datas YYYY-MM-DD
    formatDateOnly(dateString) {
        return this.formatDate(dateString);
    },
    
    // Formata data e hora para campos como dtCadastro
    formatDateTime(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        try {
            return date.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
        } catch (e) {
            // Fallback para navegadores antigos
            const d = date.toLocaleDateString('pt-BR');
            const t = date.toLocaleTimeString('pt-BR');
            return `${d} ${t}`;
        }
    },
    
    formatCurrency(value) {
        if (!value) return 'R$ 0,00';
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    },
    
    confirm(message) {
        return window.confirm(message);
    }
};

// Exportar para uso global
window.Auth = Auth;
window.ClienteAPI = ClienteAPI;
window.LivroAPI = LivroAPI;
window.CompraAPI = CompraAPI;
window.AvaliacaoAPI = AvaliacaoAPI;
window.FuncionarioAPI = FuncionarioAPI;
window.AdminAPI = AdminAPI;
window.AuthAPI = AuthAPI;
window.UI = UI;

// ======================================================
// Fallback leve para Preview Estático (ex.: porta 8085)
// Objetivo: evitar erros ao carregar livros quando o backend não está ativo
// Não afeta produção; só ativa no ambiente estático/preview.
// ======================================================
try {
    const isStaticPreview = (typeof window !== 'undefined') && (
        !!window.__STATIC_PREVIEW__ || /:8085$/.test(window.location.host)
    );
    if (isStaticPreview && typeof window !== 'undefined' && window.LivroAPI) {
        const SAMPLE_BOOKS = [
            { idLivro: 1, titulo: 'O Senhor dos Anéis', autor: 'J.R.R. Tolkien', genero: 'Fantasia', capaUrl: '/assets/images/capas/senhor-dos-aneis.jpg', vlCompra: 89.9, vlAluguel: 19.9 },
            { idLivro: 2, titulo: 'Harry Potter e a Pedra Filosofal', autor: 'J.K. Rowling', genero: 'Fantasia', capaUrl: '/assets/images/capas/harry-potter-1.jpg', vlCompra: 59.9, vlAluguel: 14.9 },
            { idLivro: 3, titulo: 'Diário de um Banana', autor: 'Jeff Kinney', genero: 'Infantojuvenil', capaUrl: '/assets/images/capas/diario-de-um-banana.jpg', vlCompra: 39.9, vlAluguel: 9.9 },
            { idLivro: 4, titulo: 'Trono de Vidro', autor: 'Sarah J. Maas', genero: 'Fantasia', capaUrl: '/assets/images/capas/trono-de-vidro.jpg', vlCompra: 69.9, vlAluguel: 16.9 },
            { idLivro: 5, titulo: 'Duna', autor: 'Frank Herbert', genero: 'Ficção Científica', capaUrl: '/assets/images/capas/duna.jpg', vlCompra: 79.9, vlAluguel: 18.9 }
        ];

        const normalize = (s) => String(s || '').toLowerCase();
        window.LivroAPI.listarTodos = async () => SAMPLE_BOOKS;
        window.LivroAPI.buscarPorTitulo = async (titulo) => {
            const q = normalize(titulo);
            return SAMPLE_BOOKS.filter(b => normalize(b.titulo).includes(q));
        };
        window.LivroAPI.buscarPorGenero = async (genero) => {
            const q = normalize(genero);
            return SAMPLE_BOOKS.filter(b => normalize(b.genero).includes(q));
        };
        // Opcional: listarDisponiveis igual ao listarTodos
        if (window.LivroAPI.listarDisponiveis) {
            window.LivroAPI.listarDisponiveis = async () => SAMPLE_BOOKS;
        }
        console.info('Preview estático ativo: usando dados de exemplo para livros.');
    }
} catch (_) { /* ignora erros de ambiente */ }
