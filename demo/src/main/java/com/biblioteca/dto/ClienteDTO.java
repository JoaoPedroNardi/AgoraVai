package com.biblioteca.dto;

public class ClienteDTO {
    private Long idPessoa;
    private String nome;
    private String email;
    private String telefone;
    private String cpf;
    private java.time.LocalDate dtNascimento;
    private String endereco;
    private java.time.LocalDateTime dtCadastro;

    public ClienteDTO() {}

    public ClienteDTO(Long idPessoa, String nome, String email) {
        this.idPessoa = idPessoa;
        this.nome = nome;
        this.email = email;
    }

    public ClienteDTO(Long idPessoa, String nome, String email,
                       String telefone, String cpf, java.time.LocalDate dtNascimento,
                       String endereco, java.time.LocalDateTime dtCadastro) {
        this.idPessoa = idPessoa;
        this.nome = nome;
        this.email = email;
        this.telefone = telefone;
        this.cpf = cpf;
        this.dtNascimento = dtNascimento;
        this.endereco = endereco;
        this.dtCadastro = dtCadastro;
    }

    public Long getIdPessoa() { return idPessoa; }
    public void setIdPessoa(Long idPessoa) { this.idPessoa = idPessoa; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getTelefone() { return telefone; }
    public void setTelefone(String telefone) { this.telefone = telefone; }
    public String getCpf() { return cpf; }
    public void setCpf(String cpf) { this.cpf = cpf; }
    public java.time.LocalDate getDtNascimento() { return dtNascimento; }
    public void setDtNascimento(java.time.LocalDate dtNascimento) { this.dtNascimento = dtNascimento; }
    public String getEndereco() { return endereco; }
    public void setEndereco(String endereco) { this.endereco = endereco; }
    public java.time.LocalDateTime getDtCadastro() { return dtCadastro; }
    public void setDtCadastro(java.time.LocalDateTime dtCadastro) { this.dtCadastro = dtCadastro; }
}