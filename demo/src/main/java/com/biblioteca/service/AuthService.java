package com.biblioteca.service;

import com.biblioteca.dto.LoginRequest;
import com.biblioteca.dto.LoginResponse;
import com.biblioteca.exception.BusinessException;
import com.biblioteca.model.Admin;
import com.biblioteca.model.Cliente;
import com.biblioteca.model.Funcionario;
import com.biblioteca.repository.AdminRepository;
import com.biblioteca.repository.ClienteRepository;
import com.biblioteca.repository.FuncionarioRepository;
import com.biblioteca.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    
    @Autowired
    private ClienteRepository clienteRepository;
    
    @Autowired
    private FuncionarioRepository funcionarioRepository;
    
    @Autowired
    private AdminRepository adminRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    /**
     * Realiza login verificando em todas as tabelas (Cliente, Funcionario, Admin)
     */
    public LoginResponse login(LoginRequest request) {
        String email = request.getEmail();
        String senha = request.getSenha();
        
        // Tentar login como Cliente
        Cliente cliente = clienteRepository.findByEmail(email).orElse(null);
        if (cliente != null && passwordEncoder.matches(senha, cliente.getSenha())) {
            String token = jwtUtil.generateToken(email, "CLIENTE", cliente.getId());
            return new LoginResponse(token, cliente.getNome(), email, "CLIENTE", cliente.getId());
        }
        
        // Tentar login como Funcionário
        Funcionario funcionario = funcionarioRepository.findByEmail(email).orElse(null);
        if (funcionario != null && passwordEncoder.matches(senha, funcionario.getSenha())) {
            String token = jwtUtil.generateToken(email, "FUNCIONARIO", funcionario.getId());
            return new LoginResponse(token, funcionario.getNome(), email, "FUNCIONARIO", funcionario.getId());
        }
        
        // Tentar login como Admin
        Admin admin = adminRepository.findByEmail(email).orElse(null);
        if (admin != null && passwordEncoder.matches(senha, admin.getSenha())) {
            String token = jwtUtil.generateToken(email, "ADMIN", admin.getId());
            return new LoginResponse(token, admin.getNome(), email, "ADMIN", admin.getId());
        }
        
        throw new BusinessException("Email ou senha inválidos");
    }
    
    /**
     * Verifica se um email já está cadastrado
     */
    public boolean emailJaCadastrado(String email) {
        return clienteRepository.findByEmail(email).isPresent() ||
               funcionarioRepository.findByEmail(email).isPresent() ||
               adminRepository.findByEmail(email).isPresent();
    }
}