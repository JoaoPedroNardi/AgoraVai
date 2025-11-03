package com.biblioteca.enums;

public enum Role {
    ADMIN("ADMIN"),
    FUNCIONARIO("FUNCIONARIO"),
    CLIENTE("CLIENTE");
    
    private String value;
    
    Role(String value) {
        this.value = value;
    }
    
    public String getValue() {
        return value;
    }
    
    public static Role fromString(String role) {
        for (Role r : Role.values()) {
            if (r.value.equalsIgnoreCase(role)) {
                return r;
            }
        }
        throw new IllegalArgumentException("Role inválida: " + role);
    }
}