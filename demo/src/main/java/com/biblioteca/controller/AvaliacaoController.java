package com.biblioteca.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.biblioteca.model.Avaliacao;
import com.biblioteca.dto.AvaliacaoDTO;
import com.biblioteca.mapper.DtoMapper;
import com.biblioteca.service.AvaliacaoService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/avaliacoes")
@CrossOrigin(origins = "*")
public class AvaliacaoController {
    
    @Autowired
    private AvaliacaoService avaliacaoService;
    
    @GetMapping
    public ResponseEntity<List<AvaliacaoDTO>> listarTodas() {
        List<AvaliacaoDTO> dtos = avaliacaoService.listarTodas().stream()
            .map(DtoMapper::toAvaliacaoDTO)
            .toList();
        return ResponseEntity.ok(dtos);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<AvaliacaoDTO> buscarPorId(@PathVariable Long id) {
        return avaliacaoService.buscarPorId(id)
            .map(a -> ResponseEntity.ok(DtoMapper.toAvaliacaoDTO(a)))
            .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/livro/{livroId}")
    public ResponseEntity<List<AvaliacaoDTO>> buscarPorLivro(@PathVariable Long livroId) {
        List<AvaliacaoDTO> avaliacoes = avaliacaoService.buscarPorLivro(livroId).stream()
            .map(DtoMapper::toAvaliacaoDTO)
            .toList();
        return ResponseEntity.ok(avaliacoes);
    }
    
    @GetMapping("/cliente/{clienteId}")
    public ResponseEntity<List<AvaliacaoDTO>> buscarPorCliente(@PathVariable Long clienteId) {
        List<AvaliacaoDTO> avaliacoes = avaliacaoService.buscarPorCliente(clienteId).stream()
            .map(DtoMapper::toAvaliacaoDTO)
            .toList();
        return ResponseEntity.ok(avaliacoes);
    }
    
    @PostMapping
    public ResponseEntity<AvaliacaoDTO> criar(@Valid @RequestBody Avaliacao avaliacao) {
        Avaliacao avaliacaoSalva = avaliacaoService.criar(avaliacao);
        return ResponseEntity.status(HttpStatus.CREATED).body(DtoMapper.toAvaliacaoDTO(avaliacaoSalva));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<AvaliacaoDTO> atualizar(@PathVariable Long id, @Valid @RequestBody Avaliacao avaliacao) {
        Avaliacao avaliacaoAtualizada = avaliacaoService.atualizar(id, avaliacao);
        return ResponseEntity.ok(DtoMapper.toAvaliacaoDTO(avaliacaoAtualizada));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        avaliacaoService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}