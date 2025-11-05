package com.biblioteca.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.biblioteca.model.Cliente;
import com.biblioteca.model.Compra;
import com.biblioteca.model.Livro;

@Repository
public interface CompraRepository extends JpaRepository<Compra, Long> {
    /**
     * Lista compras/aluguéis de um cliente.
     */
    List<Compra> findByCliente(Cliente cliente);

    /**
     * Lista compras/aluguéis por status.
     */
    List<Compra> findByStatus(String status);

    /**
     * Verifica se existe compra/aluguel para cliente e livro com status diferente.
     * Útil para evitar duplicidades enquanto há compra/aluguel ativo.
     */
    boolean existsByClienteAndLivroAndStatusNot(Cliente cliente, Livro livro, String status);

    /**
     * Conta compras/aluguéis associados a um livro.
     */
    long countByLivro(Livro livro);
}