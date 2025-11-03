package com.biblioteca.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.biblioteca.model.Cliente;
import com.biblioteca.model.Compra;
import com.biblioteca.model.Livro;

@Repository
public interface CompraRepository extends JpaRepository<Compra, Long> {
    List<Compra> findByCliente(Cliente cliente);
    List<Compra> findByStatus(String status);
    boolean existsByClienteAndLivroAndStatusNot(Cliente cliente, Livro livro, String status);
    long countByLivro(Livro livro);
}