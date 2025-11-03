package com.biblioteca.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class LivroDTO {
    private Long idLivro;
    private String titulo;
    private String autor;
    private String genero;
    private LocalDate dtPublicacao;
    private BigDecimal vlCompra;
    private BigDecimal vlAluguel;
    private java.math.BigDecimal avaliacao;
    private String capaUrl;
    private String resumoCurto;
    private String sinopse;

    public LivroDTO() {}

    public LivroDTO(Long idLivro, String titulo, String autor, String genero, LocalDate dtPublicacao,
                    BigDecimal vlCompra, BigDecimal vlAluguel, java.math.BigDecimal avaliacao,
                    String capaUrl, String resumoCurto, String sinopse) {
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
    }

    public Long getIdLivro() { return idLivro; }
    public void setIdLivro(Long idLivro) { this.idLivro = idLivro; }
    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }
    public String getAutor() { return autor; }
    public void setAutor(String autor) { this.autor = autor; }
    public String getGenero() { return genero; }
    public void setGenero(String genero) { this.genero = genero; }
    public LocalDate getDtPublicacao() { return dtPublicacao; }
    public void setDtPublicacao(LocalDate dtPublicacao) { this.dtPublicacao = dtPublicacao; }
    public BigDecimal getVlCompra() { return vlCompra; }
    public void setVlCompra(BigDecimal vlCompra) { this.vlCompra = vlCompra; }
    public BigDecimal getVlAluguel() { return vlAluguel; }
    public void setVlAluguel(BigDecimal vlAluguel) { this.vlAluguel = vlAluguel; }
    public java.math.BigDecimal getAvaliacao() { return avaliacao; }
    public void setAvaliacao(java.math.BigDecimal avaliacao) { this.avaliacao = avaliacao; }
    public String getCapaUrl() { return capaUrl; }
    public void setCapaUrl(String capaUrl) { this.capaUrl = capaUrl; }
    public String getResumoCurto() { return resumoCurto; }
    public void setResumoCurto(String resumoCurto) { this.resumoCurto = resumoCurto; }
    public String getSinopse() { return sinopse; }
    public void setSinopse(String sinopse) { this.sinopse = sinopse; }
}