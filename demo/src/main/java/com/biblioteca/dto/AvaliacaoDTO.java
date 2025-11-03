package com.biblioteca.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class AvaliacaoDTO {
    private Long idAvaliacao;
    private ClienteDTO cliente;
    private LivroDTO livro;
    private BigDecimal nota;
    private LocalDate dtAvaliacao;

    public AvaliacaoDTO() {}

    public AvaliacaoDTO(Long idAvaliacao, ClienteDTO cliente, LivroDTO livro, BigDecimal nota, LocalDate dtAvaliacao) {
        this.idAvaliacao = idAvaliacao;
        this.cliente = cliente;
        this.livro = livro;
        this.nota = nota;
        this.dtAvaliacao = dtAvaliacao;
    }

    public Long getIdAvaliacao() { return idAvaliacao; }
    public void setIdAvaliacao(Long idAvaliacao) { this.idAvaliacao = idAvaliacao; }
    public ClienteDTO getCliente() { return cliente; }
    public void setCliente(ClienteDTO cliente) { this.cliente = cliente; }
    public LivroDTO getLivro() { return livro; }
    public void setLivro(LivroDTO livro) { this.livro = livro; }
    public BigDecimal getNota() { return nota; }
    public void setNota(BigDecimal nota) { this.nota = nota; }
    public LocalDate getDtAvaliacao() { return dtAvaliacao; }
    public void setDtAvaliacao(LocalDate dtAvaliacao) { this.dtAvaliacao = dtAvaliacao; }
}