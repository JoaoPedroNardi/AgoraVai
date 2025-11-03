package com.biblioteca.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.biblioteca.exception.BusinessException;
import com.biblioteca.exception.ResourceNotFoundException;
import com.biblioteca.model.Livro;
import com.biblioteca.repository.LivroRepository;

@Service
@Transactional
public class LivroService {
    
    @Autowired
    private LivroRepository livroRepository;
    
    @Autowired
    private com.biblioteca.repository.CompraRepository compraRepository;
    
    @Autowired
    private com.biblioteca.repository.AvaliacaoRepository avaliacaoRepository;
    
    public List<Livro> listarTodos() {
        return livroRepository.findAll();
    }
    
    public Optional<Livro> buscarPorId(Long id) {
        return livroRepository.findById(id);
    }
    
    public List<Livro> buscarPorTitulo(String titulo) {
        return livroRepository.findByTituloContainingIgnoreCase(titulo);
    }
    
    public List<Livro> buscarPorAutor(String autor) {
        return livroRepository.findByAutorContainingIgnoreCase(autor);
    }
    
    public List<Livro> buscarPorGenero(String genero) {
        return livroRepository.findByGenero(genero);
    }
    
    
    public Livro criar(Livro livro) {
        validarLivro(livro);
        return livroRepository.save(livro);
    }
    
    public Livro atualizar(Long id, Livro livro) {
        Livro livroExistente = livroRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Livro não encontrado com ID: " + id));
        
        // Título e Autor: não sobrescrever com vazio
        if (livro.getTitulo() != null && !livro.getTitulo().trim().isEmpty()) {
            livroExistente.setTitulo(livro.getTitulo());
        }
        if (livro.getAutor() != null && !livro.getAutor().trim().isEmpty()) {
            livroExistente.setAutor(livro.getAutor());
        }
        // Data de publicação: atualizar apenas se enviada
        if (livro.getDtPublicacao() != null) {
            livroExistente.setDtPublicacao(livro.getDtPublicacao());
        }
        // Preservar gênero atual quando payload vier vazio/nulo
        if (livro.getGenero() != null && !livro.getGenero().trim().isEmpty()) {
            livroExistente.setGenero(livro.getGenero());
        }
        // Valores monetários: atualizar apenas se enviados
        if (livro.getVlCompra() != null) {
            livroExistente.setVlCompra(livro.getVlCompra());
        }
        if (livro.getVlAluguel() != null) {
            livroExistente.setVlAluguel(livro.getVlAluguel());
        }
        // Não sobrescrever avaliação manualmente; é derivada das avaliações dos clientes
        // Campos opcionais: atualizar apenas se não vazios
        if (livro.getCapaUrl() != null && !livro.getCapaUrl().trim().isEmpty()) {
            livroExistente.setCapaUrl(livro.getCapaUrl());
        }
        if (livro.getResumoCurto() != null && !livro.getResumoCurto().trim().isEmpty()) {
            livroExistente.setResumoCurto(livro.getResumoCurto());
        }
        if (livro.getSinopse() != null && !livro.getSinopse().trim().isEmpty()) {
            livroExistente.setSinopse(livro.getSinopse());
        }
        
        return livroRepository.save(livroExistente);
    }
    
    public void deletar(Long id) {
        Livro livro = livroRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Livro não encontrado com ID: " + id));

        // Verificar dependências antes de excluir
        long comprasCount = 0L;
        long avaliacoesCount = 0L;
        try {
            comprasCount = compraRepository.countByLivro(livro);
        } catch (Exception ignored) {}
        try {
            avaliacoesCount = avaliacaoRepository.countByLivro(livro);
        } catch (Exception ignored) {}

        if (comprasCount > 0 || avaliacoesCount > 0) {
            throw new BusinessException("Não é possível excluir: há compras ou avaliações associadas a este livro.");
        }

        // Sem dependências: excluir em segurança
        livroRepository.delete(livro);
    }
    
    private void validarLivro(Livro livro) {
        if (livro.getTitulo() == null || livro.getTitulo().trim().isEmpty()) {
            throw new BusinessException("Título é obrigatório");
        }
        if (livro.getAutor() == null || livro.getAutor().trim().isEmpty()) {
            throw new BusinessException("Autor é obrigatório");
        }
    }
}