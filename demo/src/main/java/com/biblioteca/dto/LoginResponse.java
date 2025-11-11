package com.biblioteca.dto;

public class LoginResponse {
    private final String token;
    private final String nome;
    private final String email;
    private final String role;
    private final Long userId;

    public LoginResponse(String token, String nome, String email, String role, Long userId) {
        this.token = token;
        this.nome = nome;
        this.email = email;
        this.role = role;
        this.userId = userId;
    }

    public String getToken() { return token; }
    public String getNome() { return nome; }
    public String getEmail() { return email; }
    public String getRole() { return role; }
    public Long getUserId() { return userId; }
}