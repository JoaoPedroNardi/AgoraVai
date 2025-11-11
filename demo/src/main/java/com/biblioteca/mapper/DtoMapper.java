package com.biblioteca.mapper;

import com.biblioteca.dto.*;
import com.biblioteca.model.*;

public class DtoMapper {
    public static ClienteDTO toClienteDTO(Cliente c) {
        if (c == null) return null;
        return new ClienteDTO(
            c.getIdPessoa(),
            c.getNome(),
            c.getEmail(),
            c.getTelefone(),
            c.getCpf(),
            c.getDtNascimento(),
            c.getGenero(),
            c.getEndereco(),
            c.getCreatedAt(),
            c.getCreatedByEmail(),
            c.getCreatedByRole()
        );
    }

    public static LivroDTO toLivroDTO(Livro l) {
        if (l == null) return null;
        return new LivroDTO(
            l.getIdLivro(),
            l.getTitulo(),
            l.getAutor(),
            l.getGenero(),
            l.getDtPublicacao(),
            l.getVlCompra(),
            l.getVlAluguel(),
            l.getAvaliacao(),
            l.getCapaUrl(),
            l.getResumoCurto(),
            l.getSinopse(),
            l.getCreatedByEmail(),
            l.getCreatedByRole(),
            l.getCreatedAt()
        );
    }

    public static CompraDTO toCompraDTO(Compra cp) {
        if (cp == null) return null;
        String tipoStr = cp.getTipo() != null
                ? cp.getTipo().name()
                : (cp.getLivro() != null && cp.getLivro().getVlAluguel() != null ? "ALUGUEL" : "COMPRA");
        return new CompraDTO(cp.getIdCompra(), toLivroDTO(cp.getLivro()), toClienteDTO(cp.getCliente()),
                cp.getDtInicio(), cp.getDtFim(), cp.getStatus(), tipoStr, cp.getTipoPagamento());
    }

    public static AvaliacaoDTO toAvaliacaoDTO(Avaliacao av) {
        if (av == null) return null;
        return new AvaliacaoDTO(av.getIdAvaliacao(), toClienteDTO(av.getCliente()), toLivroDTO(av.getLivro()),
                av.getNota(), av.getDtAvaliacao());
    }

    public static FuncionarioDTO toFuncionarioDTO(Funcionario f) {
        if (f == null) return null;
        return new FuncionarioDTO(
            f.getIdPessoa(),
            f.getIdFuncionario(),
            f.getNome(),
            f.getEmail(),
            f.getTelefone(),
            f.getCpf(),
            f.getDtNascimento(),
            f.getGenero(),
            f.getEndereco(),
            f.getCreatedAt(),
            f.getCreatedByEmail(),
            f.getCreatedByRole()
        );
    }

    public static AdminDTO toAdminDTO(Admin a) {
        if (a == null) return null;
        return new AdminDTO(
            a.getIdPessoa(),
            a.getIdAdmin(),
            a.getNome(),
            a.getEmail(),
            a.getTelefone(),
            a.getCpf(),
            a.getDtNascimento(),
            a.getGenero(),
            a.getEndereco(),
            a.getCreatedAt(),
            a.getCreatedByEmail(),
            a.getCreatedByRole()
        );
    }
}