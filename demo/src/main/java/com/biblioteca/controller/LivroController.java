package com.biblioteca.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.biblioteca.model.Livro;
import com.biblioteca.dto.LivroDTO;
import com.biblioteca.mapper.DtoMapper;
import com.biblioteca.service.LivroService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/livros")
public class LivroController {

    @Autowired
    private LivroService livroService;

    @GetMapping
    public ResponseEntity<List<LivroDTO>> listarTodos() {
        List<LivroDTO> dtos = livroService.listarTodos().stream()
                .map(DtoMapper::toLivroDTO)
                .toList();
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<LivroDTO> buscarPorId(@PathVariable Long id) {
        return livroService.buscarPorId(id)
                .map(l -> ResponseEntity.ok(DtoMapper.toLivroDTO(l)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/buscar/titulo")
    public ResponseEntity<List<LivroDTO>> buscarPorTitulo(@RequestParam String titulo) {
        List<LivroDTO> dtos = livroService.buscarPorTitulo(titulo).stream()
                .map(DtoMapper::toLivroDTO)
                .toList();
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/buscar/autor")
    public ResponseEntity<List<LivroDTO>> buscarPorAutor(@RequestParam String autor) {
        List<LivroDTO> dtos = livroService.buscarPorAutor(autor).stream()
                .map(DtoMapper::toLivroDTO)
                .toList();
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/buscar/genero")
    public ResponseEntity<List<LivroDTO>> buscarPorGenero(@RequestParam String genero) {
        List<LivroDTO> dtos = livroService.buscarPorGenero(genero).stream()
                .map(DtoMapper::toLivroDTO)
                .toList();
        return ResponseEntity.ok(dtos);
    }

    @PostMapping
    public ResponseEntity<LivroDTO> criar(@Valid @RequestBody Livro livro) {
        Livro livroSalvo = livroService.criar(livro);
        return ResponseEntity.status(HttpStatus.CREATED).body(DtoMapper.toLivroDTO(livroSalvo));
    }

    @PutMapping("/{id}")
    public ResponseEntity<LivroDTO> atualizar(@PathVariable Long id, @Valid @RequestBody Livro livro) {
        Livro livroAtualizado = livroService.atualizar(id, livro);
        return ResponseEntity.ok(DtoMapper.toLivroDTO(livroAtualizado));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        livroService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}