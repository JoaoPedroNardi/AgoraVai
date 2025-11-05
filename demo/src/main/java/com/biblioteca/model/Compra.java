package com.biblioteca.model;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "TB_Compra")
public class Compra {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_compra")
    private Long idCompra;
    
    @ManyToOne
    @JoinColumn(name = "id_livro", nullable = false)
    @NotNull(message = "Livro é obrigatório")
    private Livro livro;
    
    @ManyToOne
    @JoinColumn(name = "id_cliente", nullable = false)
    @NotNull(message = "Cliente é obrigatório")
    private Cliente cliente;
    
    @Column(name = "dt_inicio", nullable = false)
    private LocalDate dtInicio;
    
    @Column(name = "dt_fim")
    private LocalDate dtFim;
    
    @NotBlank(message = "Status é obrigatório")
    @Size(max = 50, message = "Status deve ter no máximo 50 caracteres")
    @Column(name = "status", nullable = false, length = 50)
    private String status;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo", length = 20)
    private TipoCompra tipo;

    @Size(max = 30, message = "Tipo de pagamento deve ter no máximo 30 caracteres")
    @Column(name = "tipo_pagamento", length = 30)
    private String tipoPagamento;

    @PrePersist
    protected void onCreate() {
        if (dtInicio == null) {
            dtInicio = LocalDate.now();
        }
        // Garantir tipo antes de decidir status
        if (tipo == null) {
            // Inferir pelo preço de aluguel do livro: se existir, é ALUGUEL; senão, COMPRA
            if (livro != null && livro.getVlAluguel() != null) {
                tipo = TipoCompra.ALUGUEL;
            } else {
                tipo = TipoCompra.COMPRA;
            }
        }
        // Definir status padrão conforme tipo
        if (status == null || status.trim().isEmpty()) {
            status = (tipo == TipoCompra.COMPRA) ? "FINALIZADA" : "PENDENTE";
        }
        // Para COMPRA, finalizar imediatamente com dtFim
        if (tipo == TipoCompra.COMPRA && dtFim == null) {
            dtFim = LocalDate.now();
        }
        // Para ALUGUEL, definir dtFim padrão como dtInicio + 30 dias, se ainda não definido
        if (tipo == TipoCompra.ALUGUEL && dtFim == null && dtInicio != null) {
            dtFim = dtInicio.plusDays(30);
        }
    }
    
    public Compra() {}
    
    public Long getIdCompra() { return idCompra; }
    public void setIdCompra(Long idCompra) { this.idCompra = idCompra; }
    
    public Livro getLivro() { return livro; }
    public void setLivro(Livro livro) { this.livro = livro; }
    
    public Cliente getCliente() { return cliente; }
    public void setCliente(Cliente cliente) { this.cliente = cliente; }
    
    public LocalDate getDtInicio() { return dtInicio; }
    public void setDtInicio(LocalDate dtInicio) { this.dtInicio = dtInicio; }
    
    public LocalDate getDtFim() { return dtFim; }
    public void setDtFim(LocalDate dtFim) { this.dtFim = dtFim; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public TipoCompra getTipo() { return tipo; }
    public void setTipo(TipoCompra tipo) { this.tipo = tipo; }

    public String getTipoPagamento() { return tipoPagamento; }
    public void setTipoPagamento(String tipoPagamento) { this.tipoPagamento = tipoPagamento; }
}