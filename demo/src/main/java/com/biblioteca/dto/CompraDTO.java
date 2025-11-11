package com.biblioteca.dto;

public class CompraDTO {
    private final Long idCompra;
    private final LivroDTO livro;
    private final ClienteDTO cliente;
    private final Object dtInicio;
    private final Object dtFim;
    private final String status;
    private final String tipo;
    private final String tipoPagamento;

    public CompraDTO(Long idCompra, LivroDTO livro, ClienteDTO cliente,
                     Object dtInicio, Object dtFim, String status,
                     String tipo, String tipoPagamento) {
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
    public LivroDTO getLivro() { return livro; }
    public ClienteDTO getCliente() { return cliente; }
    public Object getDtInicio() { return dtInicio; }
    public Object getDtFim() { return dtFim; }
    public String getStatus() { return status; }
    public String getTipo() { return tipo; }
    public String getTipoPagamento() { return tipoPagamento; }
}