package com.biblioteca.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.biblioteca.exception.BusinessException;
import com.biblioteca.exception.ResourceNotFoundException;
import com.biblioteca.model.Funcionario;
import com.biblioteca.repository.FuncionarioRepository;

@Service
@Transactional
public class FuncionarioService {
    
    @Autowired
    private FuncionarioRepository funcionarioRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    /**
     * Lista todos os funcionários.
     */
    public List<Funcionario> listarTodos() {
        return funcionarioRepository.findAll();
    }
    
    /**
     * Busca funcionário por ID.
     */
    public Optional<Funcionario> buscarPorId(Long id) {
        return funcionarioRepository.findById(id);
    }
    
    /**
     * Cria um funcionário com validação e sincroniza idFuncionario com idPessoa.
     */
    public Funcionario criar(Funcionario funcionario) {
        validarFuncionario(funcionario);
        // Criptografar senha se informada
        if (funcionario.getSenha() != null && !funcionario.getSenha().isBlank()) {
            String senha = funcionario.getSenha();
            if (!senha.startsWith("$2")) { // evita re-cripto em BCrypt
                funcionario.setSenha(passwordEncoder.encode(senha));
            }
        }
        // Auditoria padronizada
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null) {
            funcionario.setCreatedByEmail(auth.getName());
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
            funcionario.setCreatedByRole(role);
        }
        funcionario.setCreatedAt(java.time.LocalDateTime.now());
        Funcionario salvo = funcionarioRepository.save(funcionario);
        if (salvo.getIdFuncionario() == null) {
            salvo.setIdFuncionario(salvo.getIdPessoa());
            salvo = funcionarioRepository.save(salvo);
        }
        return salvo;
    }
    
    /**
     * Atualiza dados cadastrais do funcionário.
     */
    public Funcionario atualizar(Long id, Funcionario funcionario) {
        Funcionario funcionarioExistente = funcionarioRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Funcionário não encontrado com ID: " + id));
        
        funcionarioExistente.setNome(funcionario.getNome());
        funcionarioExistente.setCpf(funcionario.getCpf());
        funcionarioExistente.setEmail(funcionario.getEmail());
        funcionarioExistente.setEndereco(funcionario.getEndereco());
        funcionarioExistente.setTelefone(funcionario.getTelefone());
        funcionarioExistente.setDtNascimento(funcionario.getDtNascimento());
        // Atualizar senha se informada
        if (funcionario.getSenha() != null && !funcionario.getSenha().isBlank()) {
            String novaSenha = funcionario.getSenha();
            if (!novaSenha.startsWith("$2")) {
                novaSenha = passwordEncoder.encode(novaSenha);
            }
            funcionarioExistente.setSenha(novaSenha);
        }
        
        return funcionarioRepository.save(funcionarioExistente);
    }
    
    /**
     * Exclui funcionário por ID.
     */
    public void deletar(Long id) {
        if (!funcionarioRepository.existsById(id)) {
            throw new ResourceNotFoundException("Funcionário não encontrado com ID: " + id);
        }
        funcionarioRepository.deleteById(id);
    }
    
    /**
     * Valida campos obrigatórios do funcionário.
     */
    private void validarFuncionario(Funcionario funcionario) {
        if (funcionario.getNome() == null || funcionario.getNome().trim().isEmpty()) {
            throw new BusinessException("Nome é obrigatório");
        }
        if (funcionario.getEmail() == null || !funcionario.getEmail().contains("@")) {
            throw new BusinessException("Email inválido");
        }
    }
}
