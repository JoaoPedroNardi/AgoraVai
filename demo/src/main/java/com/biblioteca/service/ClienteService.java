package com.biblioteca.service;

import java.time.LocalDate;
import java.util.List;
import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.biblioteca.exception.BusinessException;
import com.biblioteca.exception.ResourceNotFoundException;
import com.biblioteca.model.Cliente;
import com.biblioteca.repository.ClienteRepository;

@Service
@Transactional
public class ClienteService {
    
    @Autowired
    private ClienteRepository clienteRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    public List<Cliente> listarTodos() {
        // Retornar todos os clientes, independentemente do campo 'ativo'
        return clienteRepository.findAll();
    }
    
    public Optional<Cliente> buscarPorId(Long id) {
        return clienteRepository.findById(id);
    }
    
    public Cliente criarCliente(Cliente cliente) {
        // Validações básicas
        if (cliente.getEmail() == null || cliente.getEmail().trim().isEmpty()) {
            throw new BusinessException("Email é obrigatório");
        }
        
        if (cliente.getSenha() == null || cliente.getSenha().trim().isEmpty()) {
            throw new BusinessException("Senha é obrigatória");
        }
        
        // Verificar se já existe cliente com este email
        Optional<Cliente> clienteExistente = clienteRepository.findByEmail(cliente.getEmail());
        if (clienteExistente.isPresent()) {
            throw new BusinessException("Email já cadastrado");
        }
        
        // Definir data e hora de cadastro
        if (cliente.getDtCadastro() == null) {
            cliente.setDtCadastro(LocalDateTime.now());
        }
        
        // Criptografar senha se necessário
        if (cliente.getSenha() != null && !cliente.getSenha().startsWith("$2")) {
            cliente.setSenha(passwordEncoder.encode(cliente.getSenha()));
        }
        // Salvar cliente e preencher id_cliente com id_pessoa
        Cliente salvo = clienteRepository.save(cliente);
        if (salvo.getIdCliente() == null) {
            salvo.setIdCliente(salvo.getIdPessoa());
            salvo = clienteRepository.save(salvo);
        }
        return salvo;
    }
    
    public Optional<Cliente> buscarPorCpf(String cpf) {
        return clienteRepository.findByCpf(cpf);
    }
    
    public Optional<Cliente> buscarPorEmail(String email) {
        return clienteRepository.findByEmail(email);
    }
    
    public Optional<Cliente> autenticar(String email, String senha) {
        Optional<Cliente> clienteOpt = clienteRepository.findByEmail(email);
        if (clienteOpt.isPresent()) {
            Cliente cliente = clienteOpt.get();
            if (cliente.getSenha() != null && passwordEncoder.matches(senha, cliente.getSenha())) {
                return Optional.of(cliente);
            }
        }
        return Optional.empty();
    }
    
    public Cliente criar(Cliente cliente) {
        // Define data e hora de cadastro automaticamente
        if (cliente.getDtCadastro() == null) {
            cliente.setDtCadastro(LocalDateTime.now());
        }
        
        validarCliente(cliente);
        verificarCpfDuplicado(cliente.getCpf(), null);
        verificarEmailDuplicado(cliente.getEmail(), null);
        
        Cliente salvo = clienteRepository.save(cliente);
        if (salvo.getIdCliente() == null) {
            salvo.setIdCliente(salvo.getIdPessoa());
            salvo = clienteRepository.save(salvo);
        }
        return salvo;
    }
    
    public Cliente atualizar(Long id, Cliente cliente) {
        Cliente clienteExistente = clienteRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Cliente não encontrado com ID: " + id));
        
        verificarCpfDuplicado(cliente.getCpf(), id);
        verificarEmailDuplicado(cliente.getEmail(), id);
        
        clienteExistente.setNome(cliente.getNome());
        clienteExistente.setCpf(cliente.getCpf());
        clienteExistente.setEmail(cliente.getEmail());
        clienteExistente.setEndereco(cliente.getEndereco());
        clienteExistente.setTelefone(cliente.getTelefone());
        clienteExistente.setDtNascimento(cliente.getDtNascimento());
        
        if (cliente.getSenha() != null && !cliente.getSenha().isEmpty() && !"******".equals(cliente.getSenha())) {
            String novaSenha = cliente.getSenha();
            if (!novaSenha.startsWith("$2")) {
                novaSenha = passwordEncoder.encode(novaSenha);
            }
            clienteExistente.setSenha(novaSenha);
        }
        
        return clienteRepository.save(clienteExistente);
    }
    
    public void deletar(Long id) {
        Cliente cliente = clienteRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Cliente não encontrado com ID: " + id));
        clienteRepository.deleteById(id);
    }
    
    // Método de ativação/desativação removido junto com empAtivo
    
    private void validarCliente(Cliente cliente) {
        if (cliente.getNome() == null || cliente.getNome().trim().isEmpty()) {
            throw new BusinessException("Nome é obrigatório");
        }
        if (cliente.getEmail() == null || !cliente.getEmail().contains("@")) {
            throw new BusinessException("Email inválido");
        }
        if (cliente.getSenha() == null || cliente.getSenha().length() < 6) {
            throw new BusinessException("Senha deve ter no mínimo 6 caracteres");
        }
    }
    
    private void verificarCpfDuplicado(String cpf, Long idExcluir) {
        if (cpf == null || cpf.trim().isEmpty()) return;
        Optional<Cliente> clienteExistente = clienteRepository.findByCpf(cpf);
        if (clienteExistente.isPresent()) {
            if (idExcluir == null || !clienteExistente.get().getIdPessoa().equals(idExcluir)) {
                throw new BusinessException("CPF já cadastrado");
            }
        }
    }
    
    private void verificarEmailDuplicado(String email, Long idExcluir) {
        Optional<Cliente> clienteExistente = clienteRepository.findByEmail(email);
        if (clienteExistente.isPresent()) {
            if (idExcluir == null || !clienteExistente.get().getIdPessoa().equals(idExcluir)) {
                throw new BusinessException("Email já cadastrado");
            }
        }
    }
}