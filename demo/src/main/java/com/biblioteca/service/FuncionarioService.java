package com.biblioteca.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
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
