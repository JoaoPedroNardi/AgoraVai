package com.biblioteca.dto;

public class AvaliacaoDTO {
    private final Long idAvaliacao;
    private final ClienteDTO cliente;
    private final LivroDTO livro;
    private final Object nota;
    private final Object dtAvaliacao;

    public AvaliacaoDTO(Long idAvaliacao, ClienteDTO cliente, LivroDTO livro,
                        Object nota, Object dtAvaliacao) {
        this.idAvaliacao = idAvaliacao;
        this.cliente = cliente;
        this.livro = livro;
        this.nota = nota;
        this.dtAvaliacao = dtAvaliacao;
    }

    public Long getIdAvaliacao() { return idAvaliacao; }
    public ClienteDTO getCliente() { return cliente; }
    public LivroDTO getLivro() { return livro; }
    public Object getNota() { return nota; }
    public Object getDtAvaliacao() { return dtAvaliacao; }
}