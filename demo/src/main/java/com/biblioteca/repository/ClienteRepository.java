package com.biblioteca.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.biblioteca.model.Cliente;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Long> {
    /**
     * Busca cliente por CPF (único).
     */
    Optional<Cliente> findByCpf(String cpf);

    /**
     * Busca cliente por email (único).
     */
    Optional<Cliente> findByEmail(String email);
}