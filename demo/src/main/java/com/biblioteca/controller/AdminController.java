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

import com.biblioteca.model.Admin;
import com.biblioteca.service.AdminService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/administradores")
@CrossOrigin(origins = "*")
public class AdminController {
    
    @Autowired
    private AdminService adminService;
    
    /**
     * Lista todos os administradores.
     */
    @GetMapping
    public ResponseEntity<List<Admin>> listarTodos() {
        return ResponseEntity.ok(adminService.listarTodos());
    }
    
    /**
     * Busca administrador por ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Admin> buscarPorId(@PathVariable Long id) {
        return adminService.buscarPorId(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Cria um novo administrador.
     */
    @PostMapping
    public ResponseEntity<Admin> criar(@Valid @RequestBody Admin admin) {
        Admin adminSalvo = adminService.criar(admin);
        return ResponseEntity.status(HttpStatus.CREATED).body(adminSalvo);
    }
    
    /**
     * Atualiza dados do administrador.
     */
    @PutMapping("/{id}")
    public ResponseEntity<Admin> atualizar(@PathVariable Long id, @Valid @RequestBody Admin admin) {
        Admin adminAtualizado = adminService.atualizar(id, admin);
        return ResponseEntity.ok(adminAtualizado);
    }
    
    /**
     * Exclui um administrador.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        adminService.deletar(id);
        return ResponseEntity.noContent().build();
}
}