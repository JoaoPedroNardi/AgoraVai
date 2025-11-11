package com.biblioteca.dto;

public class LivroDTO {
    private final Long idLivro;
    private final String titulo;
    private final String autor;
    private final String genero;
    private final Object dtPublicacao;
    private final Object vlCompra;
    private final Object vlAluguel;
    private final Object avaliacao;
    private final String capaUrl;
    private final String resumoCurto;
    private final String sinopse;
    private final String createdByEmail;
    private final String createdByRole;
    private final Object createdAt;

    public LivroDTO(Long idLivro, String titulo, String autor, String genero, Object dtPublicacao,
                    Object vlCompra, Object vlAluguel, Object avaliacao,
                    String capaUrl, String resumoCurto, String sinopse,
                    String createdByEmail, String createdByRole, Object createdAt) {
        this.idLivro = idLivro;
        this.titulo = titulo;
        this.autor = autor;
        this.genero = genero;
        this.dtPublicacao = dtPublicacao;
        this.vlCompra = vlCompra;
        this.vlAluguel = vlAluguel;
        this.avaliacao = avaliacao;
        this.capaUrl = capaUrl;
        this.resumoCurto = resumoCurto;
        this.sinopse = sinopse;
        this.createdByEmail = createdByEmail;
        this.createdByRole = createdByRole;
        this.createdAt = createdAt;
    }

    public Long getIdLivro() { return idLivro; }
    public String getTitulo() { return titulo; }
    public String getAutor() { return autor; }
    public String getGenero() { return genero; }
    public Object getDtPublicacao() { return dtPublicacao; }
    public Object getVlCompra() { return vlCompra; }
    public Object getVlAluguel() { return vlAluguel; }
    public Object getAvaliacao() { return avaliacao; }
    public String getCapaUrl() { return capaUrl; }
    public String getResumoCurto() { return resumoCurto; }
    public String getSinopse() { return sinopse; }
    public String getCreatedByEmail() { return createdByEmail; }
    public String getCreatedByRole() { return createdByRole; }
    public Object getCreatedAt() { return createdAt; }
}