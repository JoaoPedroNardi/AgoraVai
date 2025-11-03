package com.biblioteca.controller;

import com.biblioteca.dto.LoginRequest;
import com.biblioteca.dto.LoginResponse;
import com.biblioteca.exception.BusinessException;
import com.biblioteca.model.Cliente;
import com.biblioteca.repository.ClienteRepository;
import com.biblioteca.service.AuthService;
import com.biblioteca.service.ClienteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    
    @Autowired
    private AuthService authService;
    
    @Autowired
    private ClienteService clienteService;
    
    @Autowired
    private ClienteRepository clienteRepository;
    
    // Removidos serviços e repositórios temporários de admin/funcionário
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    /**
     * Endpoint de login
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Endpoint de registro (apenas clientes podem se auto-registrar)
     */
    @PostMapping("/registro")
    public ResponseEntity<?> registro(@RequestBody Cliente cliente) {
        try {
            // Verificar se email já existe
            if (authService.emailJaCadastrado(cliente.getEmail())) {
                throw new BusinessException("Email já cadastrado");
            }
            
            // Criptografar senha
            cliente.setSenha(passwordEncoder.encode(cliente.getSenha()));
            
            // Criar cliente
            Cliente novoCliente = clienteService.criarCliente(cliente);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Cliente registrado com sucesso");
            response.put("clienteId", novoCliente.getId());
            
            return ResponseEntity.ok(response);
        } catch (BusinessException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Endpoint para verificar se usuário está autenticado
     */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        // Este endpoint só será acessível se o usuário estiver autenticado
        // O Spring Security já valida o token
        Map<String, String> response = new HashMap<>();
        response.put("message", "Usuário autenticado");
        return ResponseEntity.ok(response);
    }
    
    // Endpoints temporários removidos
}