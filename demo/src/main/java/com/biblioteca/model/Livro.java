package com.biblioteca.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "TB_Livro")
public class Livro {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_livro")
    private Long idLivro;
    
    @NotBlank(message = "Título é obrigatório")
    @Size(min = 1, max = 255, message = "Título deve ter entre 1 e 255 caracteres")
    @Column(name = "titulo", nullable = false, length = 255)
    private String titulo;
    
    @NotBlank(message = "Autor é obrigatório")
    @Size(min = 1, max = 255, message = "Autor deve ter entre 1 e 255 caracteres")
    @Column(name = "autor", nullable = false, length = 255)
    private String autor;
    
    @PastOrPresent(message = "Data de publicação não pode ser futura")
    @Column(name = "dt_publicacao")
    private LocalDate dtPublicacao;
    
    @Size(max = 50, message = "Gênero deve ter no máximo 50 caracteres")
    @Column(name = "genero", length = 50)
    private String genero;
    
    @DecimalMin(value = "0.0", message = "Valor de compra não pode ser negativo")
    @Column(name = "vl_compra", precision = 10, scale = 2)
    private BigDecimal vlCompra;
    
    @DecimalMin(value = "0.0", message = "Valor de aluguel não pode ser negativo")
    @Column(name = "vl_aluguel", precision = 10, scale = 2)
    private BigDecimal vlAluguel;
    
    
    @DecimalMin(value = "0.0", message = "Avaliação não pode ser negativa")
    @DecimalMax(value = "5.0", message = "Avaliação não pode ser maior que 5.0")
    @Column(name = "avaliacao", precision = 2, scale = 1)
    private BigDecimal avaliacao;

    // Nova coluna: URL da imagem de capa
    @Size(max = 255, message = "URL da capa deve ter no máximo 255 caracteres")
    @Column(name = "capa_url", length = 255)
    private String capaUrl;

    // Nova coluna: resumo curto
    @Size(max = 512, message = "Resumo curto deve ter no máximo 512 caracteres")
    @Column(name = "resumo_curto", length = 512)
    private String resumoCurto;

    // Nova coluna: sinopse longa (texto)
    @Column(name = "sinopse", columnDefinition = "TEXT")
    private String sinopse;
    
    @Column(name = "created_by_email", length = 255)
    private String createdByEmail;
    
    @Column(name = "created_by_role", length = 50)
    private String createdByRole;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @JsonIgnore
    @OneToMany(mappedBy = "livro", cascade = CascadeType.ALL)
    private List<Compra> compras;
    
    @JsonIgnore
    @OneToMany(mappedBy = "livro", cascade = CascadeType.ALL)
    private List<Avaliacao> avaliacoes;
    
    public Livro() {}
    
    public Long getIdLivro() { return idLivro; }
    public void setIdLivro(Long idLivro) { this.idLivro = idLivro; }
    
    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }
    
    public String getAutor() { return autor; }
    public void setAutor(String autor) { this.autor = autor; }
    
    public LocalDate getDtPublicacao() { return dtPublicacao; }
    public void setDtPublicacao(LocalDate dtPublicacao) { this.dtPublicacao = dtPublicacao; }
    
    public String getGenero() { return genero; }
    public void setGenero(String genero) { this.genero = genero; }
    
    public BigDecimal getVlCompra() { return vlCompra; }
    public void setVlCompra(BigDecimal vlCompra) { this.vlCompra = vlCompra; }
    
    public BigDecimal getVlAluguel() { return vlAluguel; }
    public void setVlAluguel(BigDecimal vlAluguel) { this.vlAluguel = vlAluguel; }
    
    
    public BigDecimal getAvaliacao() { return avaliacao; }
    public void setAvaliacao(BigDecimal avaliacao) { this.avaliacao = avaliacao; }

    public String getCapaUrl() { return capaUrl; }
    public void setCapaUrl(String capaUrl) { this.capaUrl = capaUrl; }

    public String getResumoCurto() { return resumoCurto; }
    public void setResumoCurto(String resumoCurto) { this.resumoCurto = resumoCurto; }

    public String getSinopse() { return sinopse; }
    public void setSinopse(String sinopse) { this.sinopse = sinopse; }
    
    public String getCreatedByEmail() { return createdByEmail; }
    public void setCreatedByEmail(String createdByEmail) { this.createdByEmail = createdByEmail; }
    
    public String getCreatedByRole() { return createdByRole; }
    public void setCreatedByRole(String createdByRole) { this.createdByRole = createdByRole; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public List<Compra> getCompras() { return compras; }
    public void setCompras(List<Compra> compras) { this.compras = compras; }
    
    public List<Avaliacao> getAvaliacoes() { return avaliacoes; }
    public void setAvaliacoes(List<Avaliacao> avaliacoes) { this.avaliacoes = avaliacoes; }
}