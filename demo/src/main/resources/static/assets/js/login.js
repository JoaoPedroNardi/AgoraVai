// login.js - Atualização para usar autenticação JWT
// Substitua o conteúdo do seu assets/js/login.js por este código

// Usa AuthAPI e UI centralizados em api.js

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    // Fallback: garantir toggle de senha nesta página mesmo se outro script falhar
    const senhaInput = document.getElementById('login-password');
    const toggleSenhaBtn = document.querySelector('.password-toggle[data-target="login-password"]');
    if (senhaInput && toggleSenhaBtn) {
        toggleSenhaBtn.addEventListener('click', () => {
            senhaInput.type = senhaInput.type === 'password' ? 'text' : 'password';
        });
    }
    
    // Se já estiver logado e abrir a página de login, vai para a home
    if (typeof Auth !== 'undefined' && Auth.isLoggedIn()) {
        window.location.href = '/index.html';
        return;
    }

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
});

async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email')?.value;
    const senha = document.getElementById('login-password')?.value;
    const errorMessage = document.getElementById('errorMessage');
    const submitButton = e.target.querySelector('button[type="submit"]');
    
    if (!email || !senha) {
        UI.showError('Por favor, preencha todos os campos');
        return;
    }
    
    // Desabilitar botão e mostrar loading
    if (submitButton) UI.showLoading(submitButton);
    
    try {
        const data = await AuthAPI.login(email, senha);
        
        // Salvar token e dados do usuário
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify({
            nome: data.nome,
            email: data.email,
            role: data.role,
            userId: data.userId
        }));
        // Complementar chaves usadas por Auth
        localStorage.setItem('userId', String(data.userId));
        localStorage.setItem('userName', data.nome);
        localStorage.setItem('userEmail', data.email);
        
        // Mostrar mensagem de sucesso
        UI.showSuccess('Login realizado com sucesso!');
        
        // Redirecionar para a home logada após 1 segundo
        setTimeout(() => {
            window.location.href = '/index.html';
        }, 1000);
        
    } catch (error) {
        UI.showError(error.message || 'Falha no login');
        if (submitButton) UI.hideLoading(submitButton, 'Entrar');
    }
}
// Mensagens usam UI.showError/UI.showSuccess acima