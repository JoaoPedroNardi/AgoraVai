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
import org.springframework.web.bind.annotation.RestController;

import com.biblioteca.dto.AdminDTO;
import com.biblioteca.dto.FuncionarioDTO;
import com.biblioteca.mapper.DtoMapper;
import com.biblioteca.model.Admin;
import com.biblioteca.service.AdminService;
import com.biblioteca.service.FuncionarioService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/administradores")
public class AdminController {
    @Autowired
    private AdminService adminService;

    @Autowired
    private FuncionarioService funcionarioService;

    @GetMapping
    public ResponseEntity<List<AdminDTO>> listarTodos() {
        List<AdminDTO> dtos = adminService.listarTodos().stream()
            .map(DtoMapper::toAdminDTO)
            .toList();
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AdminDTO> buscarPorId(@PathVariable Long id) {
        return adminService.buscarPorId(id)
            .map(a -> ResponseEntity.ok(DtoMapper.toAdminDTO(a)))
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<AdminDTO> criar(@Valid @RequestBody Admin admin) {
        Admin adminSalvo = adminService.criar(admin);
        return ResponseEntity.status(HttpStatus.CREATED).body(DtoMapper.toAdminDTO(adminSalvo));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AdminDTO> atualizar(@PathVariable Long id, @Valid @RequestBody Admin admin) {
        Admin adminAtualizado = adminService.atualizar(id, admin);
        return ResponseEntity.ok(DtoMapper.toAdminDTO(adminAtualizado));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        adminService.deletar(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/funcionarios/{id}/detalhes")
    public ResponseEntity<FuncionarioDTO> detalhesFuncionario(@PathVariable Long id) {
        return funcionarioService.buscarPorId(id)
            .map(f -> ResponseEntity.ok(DtoMapper.toFuncionarioDTO(f)))
            .orElse(ResponseEntity.notFound().build());
    }
}