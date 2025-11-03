// ========================================
// MODAL.JS - GERENCIAMENTO DE MODAIS (VERSÃO COMPLETA E CORRIGIDA)
// ========================================

const Modal = {
    _confirmCallbacks: {},
    _errorCallbacks: {},
    _alertCallbacks: {},

    /**
     * Abre um modal
     */
    open(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            // Se houver conteúdo anterior salvo (por sucesso), restaurar imediatamente
            const body = modal.querySelector('.modal-body');
            if (body && body.dataset && body.dataset.prevHtml) {
                body.innerHTML = body.dataset.prevHtml;
                delete body.dataset.prevHtml;
            }
        }
    },

    /**
     * Fecha um modal
     */
    close(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    },

    /**
     * Fecha todos os modais
     */
    closeAll() {
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.classList.remove('active');
        });
        document.body.style.overflow = '';
    },

    /**
     * Cria estrutura básica de modal
     */
    create(id, title, content, footer, size = '') {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.id = id;
        
        overlay.innerHTML = `
            <div class="modal ${size}">
                <div class="modal-header">
                    <h2>${title}</h2>
                    <button type="button" class="modal-close" data-action="close">×</button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
                ${footer ? `<div class="modal-footer">${footer}</div>` : ''}
            </div>
        `;
        
        // Fechar ao clicar fora
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.close(id);
            }
        });
        
        // Delegação de eventos para ações de botões dentro do modal
        overlay.addEventListener('click', (e) => {
            const btn = e.target.closest('button[data-action]');
            if (!btn) return;
            const action = btn.dataset.action;
            switch (action) {
                case 'close':
                    this.close(id);
                    break;
                case 'confirm-cancel':
                    this.handleConfirmCancel(id);
                    break;
                case 'confirm-ok':
                    this.handleConfirmOk(id);
                    break;
                case 'error-ok':
                    this.handleErrorOk(id);
                    break;
                case 'alert-ok':
                    this.handleAlertOk(id);
                    break;
                default:
                    break;
            }
        });
        
        document.body.appendChild(overlay);
        return overlay;
    },

    /**
     * NOVO: Modal de confirmação
     */
    confirm(title, message, onConfirm, onCancel) {
        const modalId = 'modal-confirm-' + Date.now();
        
        const content = `
            <p style="font-size: 1rem; color: #374151; line-height: 1.6; white-space: pre-line;">
                ${message}
            </p>
        `;
        
        const footer = `
            <button type="button" class="btn btn-outline" data-action="confirm-cancel">
                Cancelar
            </button>
            <button type="button" class="btn btn-gold" data-action="confirm-ok">
                Confirmar
            </button>
        `;
        
        this.create(modalId, title, content, footer);
        
        // Salvar callbacks
        this._confirmCallbacks[modalId] = { onConfirm, onCancel };
        
        this.open(modalId);
    },

    handleConfirmOk(modalId) {
        const callbacks = this._confirmCallbacks?.[modalId];
        if (callbacks?.onConfirm) callbacks.onConfirm();
        this.close(modalId);
        setTimeout(() => {
            document.getElementById(modalId)?.remove();
            delete this._confirmCallbacks[modalId];
        }, 300);
    },

    handleConfirmCancel(modalId) {
        const callbacks = this._confirmCallbacks?.[modalId];
        if (callbacks?.onCancel) callbacks.onCancel();
        this.close(modalId);
        setTimeout(() => {
            document.getElementById(modalId)?.remove();
            delete this._confirmCallbacks[modalId];
        }, 300);
    },

    /**
     * NOVO: Modal de loading
     */
    showLoading(message = 'Carregando...') {
        const modalId = 'modal-loading';
        
        // Remover loading anterior se existir
        const existingModal = document.getElementById(modalId);
        if (existingModal) existingModal.remove();
        
        const content = `
            <div style="text-align: center; padding: 2rem;">
                <div class="spinner" style="margin: 0 auto 1rem;"></div>
                <p style="color: #6b7280; font-size: 1rem;">${message}</p>
            </div>
        `;
        
        this.create(modalId, '', content, '', 'modal-loading');
        this.open(modalId);
    },

    hideLoading() {
        const modalId = 'modal-loading';
        this.close(modalId);
        setTimeout(() => {
            document.getElementById(modalId)?.remove();
        }, 300);
    },

    /**
     * NOVO: Modal de erro
     */
    showError(title, message, callback) {
        const modalId = 'modal-error-' + Date.now();
        
        const content = `
            <div style="text-align: center; padding: 1rem;">
                <div style="width: 60px; height: 60px; border-radius: 50%; background: #fee2e2; 
                            display: flex; align-items: center; justify-content: center; 
                            margin: 0 auto 1rem;">
                    <svg width="32" height="32" viewBox="0 0 24 24" style="color: #ef4444;">
                        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/>
                        <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
                        <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
                    </svg>
                </div>
                <p style="font-size: 1rem; color: #374151; line-height: 1.6; white-space: pre-line;">
                    ${message}
                </p>
            </div>
        `;
        
        const footer = `
            <button type="button" class="btn btn-gold" data-action="error-ok">
                OK
            </button>
        `;
        
        this.create(modalId, title, content, footer);
        
        this._errorCallbacks[modalId] = callback;
        
        this.open(modalId);
    },

    handleErrorOk(modalId) {
        const callback = this._errorCallbacks?.[modalId];
        if (callback) callback();
        this.close(modalId);
        setTimeout(() => {
            document.getElementById(modalId)?.remove();
            delete this._errorCallbacks[modalId];
        }, 300);
    },

    /**
     * NOVO: Modal de alerta/informação
     */
    alert(title, message, callback) {
        const modalId = 'modal-alert-' + Date.now();
        
        const content = `
            <div style="text-align: center; padding: 1rem;">
                <div style="width: 60px; height: 60px; border-radius: 50%; background: #dbeafe; 
                            display: flex; align-items: center; justify-content: center; 
                            margin: 0 auto 1rem;">
                    <svg width="32" height="32" viewBox="0 0 24 24" style="color: #3b82f6;">
                        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/>
                        <line x1="12" y1="16" x2="12" y2="12" stroke="currentColor" stroke-width="2"/>
                        <line x1="12" y1="8" x2="12.01" y2="8" stroke="currentColor" stroke-width="2"/>
                    </svg>
                </div>
                <p style="font-size: 1rem; color: #374151; line-height: 1.6; white-space: pre-line;">
                    ${message}
                </p>
            </div>
        `;
        
        const footer = `
            <button type="button" class="btn btn-gold" data-action="alert-ok">
                OK
            </button>
        `;
        
        this.create(modalId, title, content, footer);
        
        this._alertCallbacks[modalId] = callback;
        
        this.open(modalId);
    },

    handleAlertOk(modalId) {
        const callback = this._alertCallbacks?.[modalId];
        if (callback) callback();
        this.close(modalId);
        setTimeout(() => {
            document.getElementById(modalId)?.remove();
            delete this._alertCallbacks[modalId];
        }, 300);
    },

    /**
     * Mostra mensagem de sucesso no modal
     */
    showSuccess(modalId, message, callback) {
        // Não substituir o conteúdo do modal: exibir toast e fechar.
        if (window.Toast && typeof window.Toast.success === 'function') {
            try { Toast.success(message); } catch (e) { /* noop */ }
        }
        this.close(modalId);
        if (typeof callback === 'function') {
            try { callback(); } catch (e) { /* noop */ }
        }
    },

    /**
     * Limpa formulário dentro de modal
     */
    clearForm(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        
        const form = modal.querySelector('form');
        if (form) {
            form.reset();
        }
    }
};

// Fechar modal com ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        Modal.closeAll();
    }
});

// Exportar para uso global
window.Modal = Modal;


