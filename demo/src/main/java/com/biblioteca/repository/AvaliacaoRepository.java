package com.biblioteca.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.biblioteca.model.Avaliacao;
import com.biblioteca.model.Cliente;
import com.biblioteca.model.Livro;

@Repository
public interface AvaliacaoRepository extends JpaRepository<Avaliacao, Long> {
    List<Avaliacao> findByLivro(Livro livro);
    List<Avaliacao> findByCliente(Cliente cliente);
    long countByLivro(Livro livro);
}



