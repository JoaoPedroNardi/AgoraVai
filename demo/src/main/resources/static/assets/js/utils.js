// ========================================
// UTILS.JS - FUNÇÕES COMPARTILHADAS
// Versão: 1.0
// Data: 29/10/2025
// ========================================

/**
 * Objeto com funções utilitárias compartilhadas
 */
const Utils = {
    /**
     * Converte string de data (YYYY-MM-DD) em Date local (sem UTC)
     * Caso não esteja no formato esperado, faz fallback para new Date()
     * @param {string} dateString
     * @returns {Date|null}
     */
    parseDateOnly(dateString) {
        if (!dateString) return null;
        const str = String(dateString).trim();
        if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
            const [y, m, d] = str.split('-').map(Number);
            return new Date(y, m - 1, d);
        }
        return new Date(str);
    },
    /**
     * Retorna badge HTML baseado no status
     * @param {string} status - Status da compra/empréstimo
     * @returns {string} HTML do badge
     */
    getStatusBadge(status) {
        const badges = {
            'PENDENTE': '<span class="badge badge-ativo">Ativa</span>',
            'FINALIZADA': '<span class="badge badge-devolvido">Finalizada</span>',
            'CANCELADA': '<span class="badge badge-atrasado">Cancelada</span>',
            'ATRASADO': '<span class="badge badge-atrasado">Atrasado</span>'
        };
        return badges[status] || '<span class="badge badge-outline">-</span>'; 
    },

    /**
     * Retorna badge HTML para o modo de compra
     * @param {string} modo - "Compra" ou "Aluguel"
     * @returns {string} HTML do badge estilizado
     */
    getModoBadge(modo) {
        const normalized = (modo || '').toLowerCase();
        if (normalized === 'compra') {
            return '<span class="badge badge-gold" title="Compra">Compra</span>';
        }
        if (normalized === 'aluguel') {
            return '<span class="badge badge-ativo" title="Aluguel">Aluguel</span>';
        }
        return '<span class="badge badge-outline" title="Tipo desconhecido">N/A</span>';
    },

    /**
     * Retorna badge HTML baseado no rótulo amigável
     * @param {string} label - "Ativa", "Finalizada" ou "Cancelada"
     * @returns {string} HTML do badge
     */
    getStatusBadgeLabel(label) {
        const normalized = String(label || '').toLowerCase();
        if (normalized === 'ativa') return '<span class="badge badge-ativo">Ativa</span>';
        if (normalized === 'finalizada') return '<span class="badge badge-devolvido">Finalizada</span>';
        if (normalized === 'cancelada') return '<span class="badge badge-atrasado">Cancelada</span>';
        return '<span class="badge badge-outline">-</span>';
    },
    
    /**
     * Calcula data de devolução baseada na data de início
     * @param {string} dataInicio - Data de início do empréstimo
     * @param {number} diasEmprestimo - Quantidade de dias (padrão: 14)
     * @returns {string} Data formatada
     */
    calcularDataDevolucao(dataInicio, diasEmprestimo = 14) {
        const data = Utils.parseDateOnly(dataInicio);
        if (!data || Number.isNaN(data.getTime())) return dataInicio;
        data.setDate(data.getDate() + diasEmprestimo);
        const y = data.getFullYear();
        const m = String(data.getMonth() + 1).padStart(2, '0');
        const d = String(data.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    },
    
    /**
     * Calcula dias de atraso
     * @param {string} dataInicio - Data de início do empréstimo
     * @param {number} diasEmprestimo - Quantidade de dias do empréstimo
     * @returns {number} Dias de atraso
     */
    calcularDiasAtraso(dataInicio, diasEmprestimo = 14) {
        const inicio = new Date(dataInicio);
        const dataLimite = new Date(inicio);
        dataLimite.setDate(dataLimite.getDate() + diasEmprestimo);
        
        const hoje = new Date();
        const diffTime = hoje - dataLimite;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return Math.max(0, diffDays);
    },

    /**
     * Calcula dias restantes até o fim do período
     * @param {string} dataInicio - Data de início (YYYY-MM-DD)
     * @param {number} diasPeriodo - Total de dias do período (padrão: 30)
     * @returns {number} Dias restantes, mínimo 0
     */
    calcularDiasRestantes(dataInicio, diasPeriodo = 30) {
        if (!dataInicio) return 0;
        const inicio = Utils.parseDateOnly(dataInicio);
        if (!inicio || Number.isNaN(inicio.getTime())) return 0;
        const fim = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate());
        fim.setDate(fim.getDate() + diasPeriodo);
        const hoje = new Date();
        const hojeLocal = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
        const msPorDia = 1000 * 60 * 60 * 24;
        const diff = fim - hojeLocal;
        return Math.max(0, Math.ceil(diff / msPorDia));
    },
    
    /**
     * Renderiza estrelas de avaliação
     * @param {number} nota - Nota de 1 a 5
     * @returns {string} HTML das estrelas
     */
    renderizarEstrelas(nota) {
        const n = Math.max(0, Math.min(5, Number(nota) || 0));
        const full = Math.floor(n);
        const hasHalf = (n - full) >= 0.5 && full < 5;
        let html = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= full) {
                html += '<span class="star-filled">★</span>';
            } else if (hasHalf && i === full + 1) {
                html += '<span class="star-half">★</span>';
            } else {
                html += '<span>★</span>';
            }
        }
        return html;
    },
    
    /**
     * Formata iniciais do nome
     * @param {string} nome - Nome completo
     * @returns {string} Iniciais (até 2 letras)
     */
    getIniciais(nome) {
        if (!nome) return '??';
        return nome
            .split(' ')
            .map(n => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
    },
    
    /**
     * Trunca texto com reticências
     * @param {string} texto - Texto para truncar
     * @param {number} maxLength - Tamanho máximo
     * @returns {string} Texto truncado
     */
    truncarTexto(texto, maxLength = 50) {
        if (!texto || texto.length <= maxLength) return texto;
        return texto.substring(0, maxLength) + '...';
    },
    
    /**
     * Valida email
     * @param {string} email - Email para validar
     * @returns {boolean} True se válido
     */
    validarEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },
    
    /**
     * Valida CPF
     * @param {string} cpf - CPF para validar
     * @returns {boolean} True se válido
     */
    validarCPF(cpf) {
        cpf = cpf.replace(/[^\d]/g, '');
        
        if (cpf.length !== 11) return false;
        if (/^(\d)\1+$/.test(cpf)) return false;
        
        let soma = 0;
        let resto;
        
        for (let i = 1; i <= 9; i++) {
            soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
        }
        
        resto = (soma * 10) % 11;
        if (resto === 10 || resto === 11) resto = 0;
        if (resto !== parseInt(cpf.substring(9, 10))) return false;
        
        soma = 0;
        for (let i = 1; i <= 10; i++) {
            soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
        }
        
        resto = (soma * 10) % 11;
        if (resto === 10 || resto === 11) resto = 0;
        if (resto !== parseInt(cpf.substring(10, 11))) return false;
        
        return true;
    },
    
    /**
     * Formata CPF
     * @param {string} cpf - CPF para formatar
     * @returns {string} CPF formatado
     */
    formatarCPF(cpf) {
        cpf = cpf.replace(/[^\d]/g, '');
        return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    },
    
    /**
     * Formata telefone
     * @param {string} telefone - Telefone para formatar
     * @returns {string} Telefone formatado
     */
    formatarTelefone(telefone) {
        telefone = telefone.replace(/[^\d]/g, '');
        
        if (telefone.length === 11) {
            return telefone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        } else if (telefone.length === 10) {
            return telefone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        }
        
        return telefone;
    },
    
    /**
     * Debounce para funções
     * @param {Function} func - Função para executar
     * @param {number} wait - Tempo de espera em ms
     * @returns {Function} Função com debounce
     */
    debounce(func, wait = 300) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    /**
     * Copia texto para clipboard
     * @param {string} text - Texto para copiar
     * @returns {Promise<boolean>} Promise indicando sucesso
     */
    async copiarParaClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            // Fallback para navegadores antigos
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                document.body.removeChild(textArea);
                return true;
            } catch (err) {
                document.body.removeChild(textArea);
                return false;
            }
        }
    },
    
    /**
     * Gera cor baseada em string
     * @param {string} str - String para gerar cor
     * @returns {string} Cor em hexadecimal
     */
    stringParaCor(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        
        const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
        return '#' + '00000'.substring(0, 6 - c.length) + c;
    },
    
    /**
     * Scroll suave para elemento
     * @param {string} elementId - ID do elemento
     */
    scrollParaElemento(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }
    },
    
    /**
     * Verifica se está em dispositivo móvel
     * @returns {boolean} True se mobile
     */
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },
    
    /**
     * Formata número com separador de milhares
     * @param {number} num - Número para formatar
     * @returns {string} Número formatado
     */
    formatarNumero(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    },
    
    /**
     * Gera ID único
     * @returns {string} ID único
     */
    gerarId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },
    
    /**
     * Aguarda tempo especificado
     * @param {number} ms - Milissegundos para aguardar
     * @returns {Promise} Promise que resolve após o tempo
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    /**
     * Testa o parsing de datas para detectar problemas de timezone
     * @returns {Object} Resultado dos testes
     */
    testDateParsing() {
        const tests = [
            { input: '2012-12-12', expected: '12/12/2012' },
            { input: '2023-01-01', expected: '01/01/2023' },
            { input: '2024-02-29', expected: '29/02/2024' }, // ano bissexto
        ];

        const results = {
            passed: 0,
            failed: 0,
            details: []
        };

        tests.forEach(test => {
            try {
                const formatted = UI.formatDateOnly(test.input);
                const passed = formatted === test.expected;
                
                results.details.push({
                    input: test.input,
                    expected: test.expected,
                    actual: formatted,
                    passed
                });

                if (passed) {
                    results.passed++;
                } else {
                    results.failed++;
                }
            } catch (error) {
                results.failed++;
                results.details.push({
                    input: test.input,
                    expected: test.expected,
                    actual: `ERROR: ${error.message}`,
                    passed: false
                });
            }
        });

        return results;
    },
    
    /**
     * Remove acentos de string
     * @param {string} str - String com acentos
     * @returns {string} String sem acentos
     */
    removerAcentos(str) {
        return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    },
    
    /**
     * Capitaliza primeira letra
     * @param {string} str - String para capitalizar
     * @returns {string} String capitalizada
     */
    capitalizar(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    },
    
    /**
     * Capitaliza todas as palavras
     * @param {string} str - String para capitalizar
     * @returns {string} String com todas palavras capitalizadas
     */
    capitalizarTodas(str) {
        if (!str) return '';
        return str
            .split(' ')
            .map(word => this.capitalizar(word))
            .join(' ');
    },
    
    /**
     * Agrupa array por propriedade
     * @param {Array} array - Array para agrupar
     * @param {string} key - Chave para agrupar
     * @returns {Object} Objeto agrupado
     */
    agruparPor(array, key) {
        return array.reduce((result, item) => {
            (result[item[key]] = result[item[key]] || []).push(item);
            return result;
        }, {});
    },
    
    /**
     * Remove duplicatas de array
     * @param {Array} array - Array com duplicatas
     * @param {string} key - Chave para comparar (opcional)
     * @returns {Array} Array sem duplicatas
     */
    removerDuplicatas(array, key = null) {
        if (!key) {
            return [...new Set(array)];
        }
        
        const seen = new Set();
        return array.filter(item => {
            const value = item[key];
            if (seen.has(value)) {
                return false;
            }
            seen.add(value);
            return true;
        });
    },
    
    /**
     * Ordena array por propriedade
     * @param {Array} array - Array para ordenar
     * @param {string} key - Chave para ordenar
     * @param {boolean} ascending - Ascendente (true) ou descendente (false)
     * @returns {Array} Array ordenado
     */
    ordenarPor(array, key, ascending = true) {
        return array.sort((a, b) => {
            const aVal = a[key];
            const bVal = b[key];
            
            if (aVal < bVal) return ascending ? -1 : 1;
            if (aVal > bVal) return ascending ? 1 : -1;
            return 0;
        });
    },
    
    /**
     * Calcula porcentagem
     * @param {number} parte - Parte do total
     * @param {number} total - Total
     * @param {number} decimais - Casas decimais
     * @returns {number} Porcentagem
     */
    calcularPorcentagem(parte, total, decimais = 2) {
        if (total === 0) return 0;
        return parseFloat(((parte / total) * 100).toFixed(decimais));
    },
    
    /**
     * Valida se objeto está vazio
     * @param {Object} obj - Objeto para validar
     * @returns {boolean} True se vazio
     */
    objetoVazio(obj) {
        return Object.keys(obj).length === 0;
    }
};

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.Utils = Utils;
}

// Exportar para uso com módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}