package com.biblioteca.dto;

public class FuncionarioDTO {
    private final Long idPessoa;
    private final Long idFuncionario;
    private final String nome;
    private final String email;
    private final String telefone;
    private final String cpf;
    private final Object dtNascimento;
    private final String genero;
    private final String endereco;
    private final Object createdAt;
    private final String createdByEmail;
    private final String createdByRole;

    public FuncionarioDTO(Long idPessoa, Long idFuncionario, String nome, String email, String telefone, String cpf,
                          Object dtNascimento, String genero, String endereco,
                          Object createdAt, String createdByEmail, String createdByRole) {
        this.idPessoa = idPessoa;
        this.idFuncionario = idFuncionario;
        this.nome = nome;
        this.email = email;
        this.telefone = telefone;
        this.cpf = cpf;
        this.dtNascimento = dtNascimento;
        this.genero = genero;
        this.endereco = endereco;
        this.createdAt = createdAt;
        this.createdByEmail = createdByEmail;
        this.createdByRole = createdByRole;
    }

    public Long getIdPessoa() { return idPessoa; }
    public Long getIdFuncionario() { return idFuncionario; }
    public String getNome() { return nome; }
    public String getEmail() { return email; }
    public String getTelefone() { return telefone; }
    public String getCpf() { return cpf; }
    public Object getDtNascimento() { return dtNascimento; }
    public String getGenero() { return genero; }
    public String getEndereco() { return endereco; }
    public Object getCreatedAt() { return createdAt; }
    public String getCreatedByEmail() { return createdByEmail; }
    public String getCreatedByRole() { return createdByRole; }
}