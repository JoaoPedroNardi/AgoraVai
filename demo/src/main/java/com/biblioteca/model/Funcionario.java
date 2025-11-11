package com.biblioteca.model;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "TB_Funcionario")
public class Funcionario extends Pessoa {
    
    @Column(name = "id_funcionario")
    private Long idFuncionario;
    
    @Column(name = "created_by_email", length = 255)
    private String createdByEmail;
    
    @Column(name = "created_by_role", length = 50)
    private String createdByRole;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    public Funcionario() {}
    
    public Long getIdFuncionario() { return idFuncionario; }
    public void setIdFuncionario(Long idFuncionario) { this.idFuncionario = idFuncionario; }
    public String getCreatedByEmail() { return createdByEmail; }
    public void setCreatedByEmail(String createdByEmail) { this.createdByEmail = createdByEmail; }
    public String getCreatedByRole() { return createdByRole; }
    public void setCreatedByRole(String createdByRole) { this.createdByRole = createdByRole; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    // Compatibilidade com nomes antigos
    @JsonProperty("dtCadastro")
    public LocalDateTime getDtCadastroAlias() { return createdAt; }
    @JsonProperty("cadastradoPorEmail")
    public String getCadastradoPorEmailAlias() { return createdByEmail; }
    @JsonProperty("cadastradoPorRole")
    public String getCadastradoPorRoleAlias() { return createdByRole; }
}