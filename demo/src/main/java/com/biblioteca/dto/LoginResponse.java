package com.biblioteca.dto;

public class LoginResponse {
    private String token;
    private String nome;
    private String email;
    private String role;
    private Long userId;
    
    public LoginResponse() {}
    
    public LoginResponse(String token, String nome, String email, String role, Long userId) {
        this.token = token;
        this.nome = nome;
        this.email = email;
        this.role = role;
        this.userId = userId;
    }
    
    // Getters e Setters
    public String getToken() {
        return token;
    }
    
    public void setToken(String token) {
        this.token = token;
    }
    
    public String getNome() {
        return nome;
    }
    
    public void setNome(String nome) {
        this.nome = nome;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getRole() {
        return role;
    }
    
    public void setRole(String role) {
        this.role = role;
    }
    
    public Long getUserId() {
        return userId;
    }
    
    public void setUserId(Long userId) {
        this.userId = userId;
    }
}