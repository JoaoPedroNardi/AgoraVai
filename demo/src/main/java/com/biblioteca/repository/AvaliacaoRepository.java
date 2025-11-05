package com.biblioteca.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.biblioteca.model.Avaliacao;
import com.biblioteca.model.Cliente;
import com.biblioteca.model.Livro;

@Repository
public interface AvaliacaoRepository extends JpaRepository<Avaliacao, Long> {
    /**
     * Lista avaliações de um livro.
     */
    List<Avaliacao> findByLivro(Livro livro);

    /**
     * Lista avaliações feitas por um cliente.
     */
    List<Avaliacao> findByCliente(Cliente cliente);

    /**
     * Conta avaliações associadas a um livro.
     */
    long countByLivro(Livro livro);
}



