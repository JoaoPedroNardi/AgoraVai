package com.biblioteca.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
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
    
    public List<Admin> listarTodos() {
        return adminRepository.findAll();
    }
    
    public Optional<Admin> buscarPorId(Long id) {
        return adminRepository.findById(id);
    }
    
    public Admin criar(Admin admin) {
        validarAdmin(admin);
        Admin salvo = adminRepository.save(admin);
        if (salvo.getIdAdmin() == null) {
            salvo.setIdAdmin(salvo.getIdPessoa());
            salvo = adminRepository.save(salvo);
        }
        return salvo;
    }
    
    public Admin atualizar(Long id, Admin admin) {
        Admin adminExistente = adminRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Admin não encontrado com ID: " + id));
        
        adminExistente.setNome(admin.getNome());
        adminExistente.setCpf(admin.getCpf());
        adminExistente.setEmail(admin.getEmail());
        adminExistente.setEndereco(admin.getEndereco());
        adminExistente.setTelefone(admin.getTelefone());
        adminExistente.setDtNascimento(admin.getDtNascimento());
        
        return adminRepository.save(adminExistente);
    }
    
    public void deletar(Long id) {
        if (!adminRepository.existsById(id)) {
            throw new ResourceNotFoundException("Admin não encontrado com ID: " + id);
        }
        adminRepository.deleteById(id);
    }
    
    private void validarAdmin(Admin admin) {
        if (admin.getNome() == null || admin.getNome().trim().isEmpty()) {
            throw new BusinessException("Nome é obrigatório");
        }
        if (admin.getEmail() == null || !admin.getEmail().contains("@")) {
            throw new BusinessException("Email inválido");
        }
    }
}
