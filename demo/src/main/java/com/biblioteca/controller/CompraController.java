package com.biblioteca.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.biblioteca.model.Compra;
import com.biblioteca.dto.CompraDTO;
import com.biblioteca.mapper.DtoMapper;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import com.biblioteca.service.CompraService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/compras")
@CrossOrigin(origins = "*")
public class CompraController {
    
    @Autowired
    private CompraService compraService;
    
    @GetMapping
    public ResponseEntity<List<CompraDTO>> listarTodas() {
        List<CompraDTO> dtos = compraService.listarTodas().stream()
            .map(DtoMapper::toCompraDTO)
            .toList();
        return ResponseEntity.ok(dtos);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<CompraDTO> buscarPorId(@PathVariable Long id) {
        return compraService.buscarPorId(id)
            .map(c -> ResponseEntity.ok(DtoMapper.toCompraDTO(c)))
            .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/cliente/{clienteId}")
    public ResponseEntity<List<CompraDTO>> buscarPorCliente(@PathVariable Long clienteId) {
        List<CompraDTO> compras = compraService.buscarPorCliente(clienteId).stream()
            .map(DtoMapper::toCompraDTO)
            .toList();
        return ResponseEntity.ok(compras);
    }
    
    @GetMapping("/status/{status}")
    public ResponseEntity<List<CompraDTO>> buscarPorStatus(@PathVariable String status) {
        List<CompraDTO> compras = compraService.buscarPorStatus(status).stream()
            .map(DtoMapper::toCompraDTO)
            .toList();
        return ResponseEntity.ok(compras);
    }
    
    @PostMapping
    public ResponseEntity<CompraDTO> criar(@Valid @RequestBody Compra compra) {
        Compra compraSalva = compraService.criar(compra);
        return ResponseEntity.status(HttpStatus.CREATED).body(DtoMapper.toCompraDTO(compraSalva));
    }
    
    @PatchMapping("/{id}/status")
    public ResponseEntity<CompraDTO> atualizarStatus(@PathVariable Long id, @RequestParam String status) {
        Compra compraAtualizada = compraService.atualizarStatus(id, status);
        return ResponseEntity.ok(DtoMapper.toCompraDTO(compraAtualizada));
    }
    
    @PatchMapping("/{id}/finalizar")
    public ResponseEntity<CompraDTO> finalizarCompra(@PathVariable Long id) {
        Compra compraFinalizada = compraService.finalizarCompra(id);
        return ResponseEntity.ok(DtoMapper.toCompraDTO(compraFinalizada));
    }

    @PatchMapping("/{id}/renovar")
    public ResponseEntity<CompraDTO> renovarCompra(
            @PathVariable Long id,
            @RequestParam(name = "dias", defaultValue = "15") int dias
    ) {
        Compra renovada = compraService.renovarCompra(id, dias);
        return ResponseEntity.ok(DtoMapper.toCompraDTO(renovada));
    }

    /**
     * Lista compras do cliente autenticado usando dados do token
     */
    @GetMapping("/minhas")
    public ResponseEntity<List<CompraDTO>> listarMinhasCompras() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Object details = auth.getDetails();
        Long userId = null;
        if (details instanceof java.util.Map) {
            java.util.Map<?,?> map = (java.util.Map<?,?>) details;
            Object idObj = map.get("userId");
            if (idObj instanceof Long) userId = (Long) idObj;
            else if (idObj instanceof Integer) userId = ((Integer) idObj).longValue();
        }

        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        List<CompraDTO> compras = compraService.buscarPorCliente(userId).stream()
            .map(DtoMapper::toCompraDTO)
            .toList();
        return compras.isEmpty() ? ResponseEntity.noContent().build() : ResponseEntity.ok(compras);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        compraService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}