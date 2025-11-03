package com.biblioteca.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum TipoCompra {
    COMPRA,
    ALUGUEL;

    @JsonCreator
    public static TipoCompra fromString(String value) {
        if (value == null) return null;
        String v = value.trim().toUpperCase();
        for (TipoCompra t : values()) {
            if (t.name().equals(v)) {
                return t;
            }
        }
        // Retornar null para permitir fallback em @PrePersist ou regras de serviço
        return null;
    }

    @JsonValue
    public String toJson() {
        return this.name();
    }
}