package com.biblioteca.model;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "TB_Avaliacao",
       uniqueConstraints = @UniqueConstraint(columnNames = {"id_cliente", "id_livro"}))
public class Avaliacao {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_avaliacao")
    private Long idAvaliacao;
    
    @ManyToOne
    @JoinColumn(name = "id_cliente", nullable = false)
    @NotNull(message = "Cliente é obrigatório")
    private Cliente cliente;
    
    @ManyToOne
    @JoinColumn(name = "id_livro", nullable = false)
    @NotNull(message = "Livro é obrigatório")
    private Livro livro;
    
    @NotNull(message = "Nota é obrigatória")
    @DecimalMin(value = "0.0", message = "Nota mínima é 0.0")
    @DecimalMax(value = "5.0", message = "Nota máxima é 5.0")
    @Column(name = "nota", nullable = false, precision = 2, scale = 1)
    private BigDecimal nota;
    
    @Column(name = "dt_avaliacao", nullable = false)
    private LocalDate dtAvaliacao;
    
    @PrePersist
    protected void onCreate() {
        if (dtAvaliacao == null) {
            dtAvaliacao = LocalDate.now();
        }
    }
    
    public Avaliacao() {}
    
    public Long getIdAvaliacao() { return idAvaliacao; }
    public void setIdAvaliacao(Long idAvaliacao) { this.idAvaliacao = idAvaliacao; }
    
    public Cliente getCliente() { return cliente; }
    public void setCliente(Cliente cliente) { this.cliente = cliente; }
    
    public Livro getLivro() { return livro; }
    public void setLivro(Livro livro) { this.livro = livro; }
    
    public BigDecimal getNota() { return nota; }
    public void setNota(BigDecimal nota) { this.nota = nota; }
    
    public LocalDate getDtAvaliacao() { return dtAvaliacao; }
    public void setDtAvaliacao(LocalDate dtAvaliacao) { this.dtAvaliacao = dtAvaliacao; }
}