package com.biblioteca.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.biblioteca.exception.BusinessException;
import com.biblioteca.exception.ResourceNotFoundException;
import com.biblioteca.model.Admin;
import com.biblioteca.repository.AdminRepository;

@Service
@Transactional
public class AdminService {
    
    @Autowired
    private AdminRepository adminRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    /**
     * Lista todos os administradores.
     */
    public List<Admin> listarTodos() {
        return adminRepository.findAll();
    }
    
    /**
     * Busca administrador por ID.
     */
    public Optional<Admin> buscarPorId(Long id) {
        return adminRepository.findById(id);
    }
    
    /**
     * Cria administrador com validação e sincroniza idAdmin com idPessoa.
     */
    public Admin criar(Admin admin) {
        validarAdmin(admin);
        // Criptografar senha se informada
        if (admin.getSenha() != null && !admin.getSenha().isBlank()) {
            String senha = admin.getSenha();
            if (!senha.startsWith("$2")) {
                admin.setSenha(passwordEncoder.encode(senha));
            }
        }
        // Auditoria padronizada
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null) {
            admin.setCreatedByEmail(auth.getName());
            String role = null;
            try {
                Object details = auth.getDetails();
                if (details instanceof java.util.Map<?,?> map && map.get("role") != null) {
                    role = String.valueOf(map.get("role"));
                } else if (auth.getAuthorities() != null && !auth.getAuthorities().isEmpty()) {
                    String authRole = auth.getAuthorities().iterator().next().getAuthority();
                    role = authRole != null && authRole.startsWith("ROLE_") ? authRole.substring(5) : authRole;
                }
            } catch (Exception ignored) {}
            admin.setCreatedByRole(role);
        }
        admin.setCreatedAt(java.time.LocalDateTime.now());
        Admin salvo = adminRepository.save(admin);
        if (salvo.getIdAdmin() == null) {
            salvo.setIdAdmin(salvo.getIdPessoa());
            salvo = adminRepository.save(salvo);
        }
        return salvo;
    }
    
    /**
     * Atualiza dados cadastrais do administrador.
     */
    public Admin atualizar(Long id, Admin admin) {
        Admin adminExistente = adminRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Admin não encontrado com ID: " + id));
        
        adminExistente.setNome(admin.getNome());
        adminExistente.setCpf(admin.getCpf());
        adminExistente.setEmail(admin.getEmail());
        adminExistente.setEndereco(admin.getEndereco());
        adminExistente.setTelefone(admin.getTelefone());
        adminExistente.setDtNascimento(admin.getDtNascimento());
        // Atualizar senha se informada
        if (admin.getSenha() != null && !admin.getSenha().isBlank()) {
            String novaSenha = admin.getSenha();
            if (!novaSenha.startsWith("$2")) {
                novaSenha = passwordEncoder.encode(novaSenha);
            }
            adminExistente.setSenha(novaSenha);
        }
        
        return adminRepository.save(adminExistente);
    }
    
    /**
     * Exclui administrador por ID.
     */
    public void deletar(Long id) {
        if (!adminRepository.existsById(id)) {
            throw new ResourceNotFoundException("Admin não encontrado com ID: " + id);
        }
        adminRepository.deleteById(id);
    }
    
    /**
     * Valida campos obrigatórios do administrador.
     */
    private void validarAdmin(Admin admin) {
        if (admin.getNome() == null || admin.getNome().trim().isEmpty()) {
            throw new BusinessException("Nome é obrigatório");
        }
        if (admin.getEmail() == null || !admin.getEmail().contains("@")) {
            throw new BusinessException("Email inválido");
        }
    }
}
