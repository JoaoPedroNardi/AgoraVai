// registro.js - Atualização para usar autenticação JWT
// Substitua o conteúdo do seu assets/js/registro.js por este código

// Usa AuthAPI e UI centralizados em api.js

document.addEventListener('DOMContentLoaded', () => {
    const registroForm = document.getElementById('register-form');
    
    if (registroForm) {
        registroForm.addEventListener('submit', handleRegistro);
        
        // Adicionar formatação automática para CPF
        const cpfInput = document.getElementById('cpf');
        if (cpfInput) {
            cpfInput.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length > 11) value = value.substring(0, 11);
                
                if (value.length > 9) {
                    value = value.replace(/^(\d{3})(\d{3})(\d{3})(\d{2}).*/, '$1.$2.$3-$4');
                } else if (value.length > 6) {
                    value = value.replace(/^(\d{3})(\d{3})(\d{3}).*/, '$1.$2.$3');
                } else if (value.length > 3) {
                    value = value.replace(/^(\d{3})(\d{3}).*/, '$1.$2');
                }
                
                e.target.value = value;
            });
        }
        
        // Adicionar formatação automática para telefone
        const telefoneInput = document.getElementById('telefone');
        if (telefoneInput) {
            telefoneInput.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length > 11) value = value.substring(0, 11);
                
                if (value.length > 10) {
                    value = value.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
                } else if (value.length > 6) {
                    value = value.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
                } else if (value.length > 2) {
                    value = value.replace(/^(\d{2})(\d{0,5}).*/, '($1) $2');
                }
                
                e.target.value = value;
            });
        }
    }

    // Garantir toggle de senha mesmo se houver conflitos com outros scripts
    const senhaInput = document.getElementById('register-password');
    const toggleSenhaBtn = document.querySelector('.password-toggle[data-target="register-password"]');
    if (senhaInput && toggleSenhaBtn) {
        toggleSenhaBtn.addEventListener('click', () => {
            senhaInput.type = senhaInput.type === 'password' ? 'text' : 'password';
        });
    }

    const confirmarInput = document.getElementById('confirm-password');
    const toggleConfirmarBtn = document.querySelector('.password-toggle[data-target="confirm-password"]');
    if (confirmarInput && toggleConfirmarBtn) {
        toggleConfirmarBtn.addEventListener('click', () => {
            confirmarInput.type = confirmarInput.type === 'password' ? 'text' : 'password';
        });
    }
});

async function handleRegistro(e) {
    e.preventDefault();
    
    const nome = document.getElementById('name')?.value;
    const email = document.getElementById('email')?.value;
    const cpf = document.getElementById('cpf')?.value;
    const telefone = document.getElementById('telefone')?.value;
    const dtNascimento = document.getElementById('dtNascimento')?.value; // yyyy-MM-dd
    const genero = document.getElementById('genero')?.value;
    const endereco = document.getElementById('endereco')?.value;
    const senha = document.getElementById('register-password')?.value;
    const confirmarSenha = document.getElementById('confirm-password')?.value;
    
    const errorMessage = document.getElementById('errorMessage');
    const submitButton = e.target.querySelector('button[type="submit"]');
    
    // Limpar mensagens de erro anteriores
    document.querySelectorAll('.error-message').forEach(el => {
        el.style.display = 'none';
        el.textContent = '';
    });
    
    // Validações básicas
    if (!nome || !email || !cpf || !telefone || !dtNascimento || !genero || !endereco || !senha || !confirmarSenha) {
        UI.showError('Por favor, preencha todos os campos obrigatórios');
        return;
    }
    
    // Validar CPF (apenas números) para compatibilidade com backend
    const cpfError = document.getElementById('cpf-error');
    const cpfLimpo = cpf.replace(/\D/g, '');
    if (cpfLimpo.length !== 11) {
        cpfError.textContent = 'CPF deve conter 11 números';
        cpfError.style.display = 'block';
        document.getElementById('cpf')?.classList.add('input-invalid');
        return;
    } else {
        document.getElementById('cpf')?.classList.remove('input-invalid');
    }
    
    // Validar telefone (apenas números) para compatibilidade com backend
    const telefoneError = document.getElementById('telefone-error');
    const telefoneLimpo = telefone.replace(/\D/g, '');
    if (telefoneLimpo.length < 10 || telefoneLimpo.length > 20) {
        telefoneError.textContent = 'Telefone deve conter apenas números (10-20 dígitos)';
        telefoneError.style.display = 'block';
        document.getElementById('telefone')?.classList.add('input-invalid');
        return;
    } else {
        document.getElementById('telefone')?.classList.remove('input-invalid');
    }
    
    // Validar data de nascimento (formato, validade e não futura)
    const dtNascimentoError = document.getElementById('dtNascimento-error');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dtNascimento)) {
        dtNascimentoError.textContent = 'Data de nascimento inválida';
        dtNascimentoError.style.display = 'block';
        return;
    }
    // Checar validade real do dia/mês/ano
    const ano = parseInt(dtNascimento.slice(0, 4), 10);
    const mes = parseInt(dtNascimento.slice(5, 7), 10);
    const dia = parseInt(dtNascimento.slice(8, 10), 10);
    const nascDate = new Date(ano, mes - 1, dia);
    if (nascDate.getFullYear() !== ano || nascDate.getMonth() !== (mes - 1) || nascDate.getDate() !== dia) {
        dtNascimentoError.textContent = 'Data de nascimento inválida';
        dtNascimentoError.style.display = 'block';
        return;
    }
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const nasc = new Date(ano, mes - 1, dia);
    if (nasc.getTime() > hoje.getTime()) {
        dtNascimentoError.textContent = 'Data de nascimento não pode ser futura';
        dtNascimentoError.style.display = 'block';
        return;
    }    // Idade mínima: acima de 11 anos (>= 12)
    const diffMs = hoje.getTime() - nasc.getTime();
    const idade = Math.floor(diffMs / (365.25 * 24 * 60 * 60 * 1000));
    if (idade < 12) {
        dtNascimentoError.textContent = 'É necessário ter no mínimo 12 anos';
        dtNascimentoError.style.display = 'block';
        return;
    }
    dtNascimentoError.style.display = 'none';
    dtNascimentoError.textContent = '';

    // Validar gênero
    const generoError = document.getElementById('genero-error');
    if (!genero) {
        generoError.textContent = 'Selecione um gênero';
        generoError.style.display = 'block';
        return;
    } else {
        generoError.style.display = 'none';
        generoError.textContent = '';
    }
    
    // Validar senhas
    const passwordError = document.getElementById('password-error');
    const confirmPasswordError = document.getElementById('confirm-password-error');
    
    if (senha.length < 6) {
        passwordError.textContent = 'A senha deve ter no mínimo 6 caracteres';
        passwordError.style.display = 'block';
        return;
    }
    
    if (senha !== confirmarSenha) {
        confirmPasswordError.textContent = 'As senhas não coincidem';
        confirmPasswordError.style.display = 'block';
        return;
    }
    
    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        UI.showError('Email inválido');
        return;
    }
    
    // Desabilitar botão e mostrar loading
    if (submitButton) UI.showLoading(submitButton);
    
    try {
        const clienteData = {
            nome: nome,
            email: email,
            senha: senha, // A senha será criptografada no backend
            cpf: cpfLimpo,
            telefone: telefoneLimpo,
            endereco: endereco,
            dtNascimento: dtNascimento,
            genero: genero
        };
        
        const data = await AuthAPI.register(clienteData);
        
        // Mostrar mensagem de sucesso
        UI.showSuccess('Cadastro realizado com sucesso! Redirecionando para login...');
        
        // Limpar formulário
        e.target.reset();
        
        // Redirecionar para login após 2 segundos
        setTimeout(() => {
            window.location.href = '/pages/login.html';
        }, 2000);
        
    } catch (error) {
        UI.showError(error.message || 'Erro ao cadastrar cliente');
        
        // Reabilitar botão
        if (submitButton) {
            UI.hideLoading(submitButton, 'Cadastrar');
        }
    }
}

// Mensagens usam UI.showError/UI.showSuccess acima

// Funções auxiliares para formatação
function formatCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');
    if (cpf.length <= 11) {
        cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
        cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
        cpf = cpf.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    return cpf;
}

function formatTelefone(telefone) {
    telefone = telefone.replace(/\D/g, '');
    if (telefone.length <= 11) {
        telefone = telefone.replace(/(\d{2})(\d)/, '($1) $2');
        telefone = telefone.replace(/(\d{5})(\d)/, '$1-$2');
    }
    return telefone;
}

// Adicionar formatação automática aos campos (opcional)
document.addEventListener('DOMContentLoaded', () => {
    const cpfInput = document.getElementById('cpf');
    if (cpfInput) {
        cpfInput.addEventListener('input', (e) => {
            e.target.value = formatCPF(e.target.value);
        });
    }
    
    const telefoneInput = document.getElementById('telefone');
    if (telefoneInput) {
        telefoneInput.addEventListener('input', (e) => {
            e.target.value = formatTelefone(e.target.value);
        });
    }
});
