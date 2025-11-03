package com.biblioteca.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.biblioteca.exception.BusinessException;
import com.biblioteca.exception.ResourceNotFoundException;
import com.biblioteca.model.Avaliacao;
import com.biblioteca.model.Cliente;
import com.biblioteca.model.Livro;
import com.biblioteca.repository.AvaliacaoRepository;
import com.biblioteca.repository.ClienteRepository;
import com.biblioteca.repository.LivroRepository;
import com.biblioteca.repository.CompraRepository;

@Service
@Transactional
public class AvaliacaoService {
    
    @Autowired
    private AvaliacaoRepository avaliacaoRepository;
    
    @Autowired
    private ClienteRepository clienteRepository;
    
    @Autowired
    private LivroRepository livroRepository;

    @Autowired
    private CompraRepository compraRepository;
    
    public List<Avaliacao> listarTodas() {
        return avaliacaoRepository.findAll();
    }
    
    public Optional<Avaliacao> buscarPorId(Long id) {
        return avaliacaoRepository.findById(id);
    }
    
    public List<Avaliacao> buscarPorLivro(Long livroId) {
        Livro livro = livroRepository.findById(livroId)
            .orElseThrow(() -> new ResourceNotFoundException("Livro não encontrado"));
        return avaliacaoRepository.findByLivro(livro);
    }
    
    public List<Avaliacao> buscarPorCliente(Long clienteId) {
        Cliente cliente = clienteRepository.findById(clienteId)
            .orElseThrow(() -> new ResourceNotFoundException("Cliente não encontrado"));
        return avaliacaoRepository.findByCliente(cliente);
    }
    
    public Avaliacao criar(Avaliacao avaliacao) {
        validarAvaliacao(avaliacao);
        
        Cliente cliente = clienteRepository.findById(avaliacao.getCliente().getIdPessoa())
            .orElseThrow(() -> new ResourceNotFoundException("Cliente não encontrado"));
        
        Livro livro = livroRepository.findById(avaliacao.getLivro().getIdLivro())
            .orElseThrow(() -> new ResourceNotFoundException("Livro não encontrado"));

        // Verificar elegibilidade: só pode avaliar se houver compra/aluguel não cancelada para este livro
        boolean elegivel = compraRepository.existsByClienteAndLivroAndStatusNot(cliente, livro, "CANCELADA");
        if (!elegivel) {
            throw new BusinessException("Você só pode avaliar livros que comprou ou alugou.");
        }
        
        avaliacao.setCliente(cliente);
        avaliacao.setLivro(livro);
        
        Avaliacao avaliacaoSalva = avaliacaoRepository.save(avaliacao);
        atualizarMediaAvaliacoes(livro.getIdLivro());
        
        return avaliacaoSalva;
    }
    
    public Avaliacao atualizar(Long id, Avaliacao avaliacao) {
        Avaliacao avaliacaoExistente = avaliacaoRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Avaliação não encontrada"));
        
        if (avaliacao.getNota() != null) {
            if (avaliacao.getNota().compareTo(BigDecimal.ZERO) < 0 || 
                avaliacao.getNota().compareTo(new BigDecimal("5.0")) > 0) {
                throw new BusinessException("Nota deve estar entre 0.0 e 5.0");
            }
            avaliacaoExistente.setNota(avaliacao.getNota());
        }
        
        Avaliacao avaliacaoAtualizada = avaliacaoRepository.save(avaliacaoExistente);
        atualizarMediaAvaliacoes(avaliacaoExistente.getLivro().getIdLivro());
        
        return avaliacaoAtualizada;
    }
    
    public void deletar(Long id) {
        Avaliacao avaliacao = avaliacaoRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Avaliação não encontrada"));
        
        Long livroId = avaliacao.getLivro().getIdLivro();
        avaliacaoRepository.deleteById(id);
        atualizarMediaAvaliacoes(livroId);
    }
    
    private void validarAvaliacao(Avaliacao avaliacao) {
        if (avaliacao.getNota() == null || 
            avaliacao.getNota().compareTo(BigDecimal.ZERO) < 0 || 
            avaliacao.getNota().compareTo(new BigDecimal("5.0")) > 0) {
            throw new BusinessException("Nota deve estar entre 0.0 e 5.0");
        }
    }
    
    private void atualizarMediaAvaliacoes(Long livroId) {
        Livro livro = livroRepository.findById(livroId)
            .orElseThrow(() -> new ResourceNotFoundException("Livro não encontrado"));
        
        List<Avaliacao> avaliacoes = avaliacaoRepository.findByLivro(livro);
        
        if (avaliacoes.isEmpty()) {
            livro.setAvaliacao(null);
        } else {
            BigDecimal soma = avaliacoes.stream()
                .map(Avaliacao::getNota)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal media = soma.divide(new BigDecimal(avaliacoes.size()), 1, java.math.RoundingMode.HALF_UP);
            livro.setAvaliacao(media);
        }
        
        livroRepository.save(livro);
    }
}