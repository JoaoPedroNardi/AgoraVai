package com.biblioteca.dto;

import java.time.LocalDate;

public class CompraDTO {
    private Long idCompra;
    private LivroDTO livro;
    private ClienteDTO cliente;
    private LocalDate dtInicio;
    private LocalDate dtFim;
    private String status;
    private String tipo;
    private String tipoPagamento;

    public CompraDTO() {}

    public CompraDTO(Long idCompra, LivroDTO livro, ClienteDTO cliente, LocalDate dtInicio, LocalDate dtFim, String status, String tipo, String tipoPagamento) {
        this.idCompra = idCompra;
        this.livro = livro;
        this.cliente = cliente;
        this.dtInicio = dtInicio;
        this.dtFim = dtFim;
        this.status = status;
        this.tipo = tipo;
        this.tipoPagamento = tipoPagamento;
    }

    public Long getIdCompra() { return idCompra; }
    public void setIdCompra(Long idCompra) { this.idCompra = idCompra; }
    public LivroDTO getLivro() { return livro; }
    public void setLivro(LivroDTO livro) { this.livro = livro; }
    public ClienteDTO getCliente() { return cliente; }
    public void setCliente(ClienteDTO cliente) { this.cliente = cliente; }
    public LocalDate getDtInicio() { return dtInicio; }
    public void setDtInicio(LocalDate dtInicio) { this.dtInicio = dtInicio; }
    public LocalDate getDtFim() { return dtFim; }
    public void setDtFim(LocalDate dtFim) { this.dtFim = dtFim; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }
    public String getTipoPagamento() { return tipoPagamento; }
    public void setTipoPagamento(String tipoPagamento) { this.tipoPagamento = tipoPagamento; }
}