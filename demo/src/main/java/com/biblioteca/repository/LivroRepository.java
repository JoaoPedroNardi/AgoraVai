package com.biblioteca.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.biblioteca.model.Livro;

@Repository
public interface LivroRepository extends JpaRepository<Livro, Long> {
    /**
     * Busca por título contendo o termo (case-insensitive).
     */
    List<Livro> findByTituloContainingIgnoreCase(String titulo);

    /**
     * Busca por autor contendo o termo (case-insensitive).
     */
    List<Livro> findByAutorContainingIgnoreCase(String autor);

    /**
     * Busca por gênero exato.
     */
    List<Livro> findByGenero(String genero);
}