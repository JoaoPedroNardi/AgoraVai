package com.biblioteca.config;

import java.time.LocalDate;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.biblioteca.model.Admin;
import com.biblioteca.model.Funcionario;
import com.biblioteca.repository.AdminRepository;
import com.biblioteca.repository.FuncionarioRepository;

/**
 * Inicializa usuários padrão (Admin e Funcionario) para facilitar testes.
 * Cria somente se não existir um usuário com o email esperado.
 */
@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private FuncionarioRepository funcionarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        seedAdmin();
        seedFuncionario();
    }

    private void seedAdmin() {
        String email = "admin@livraria.com";
        if (adminRepository.findByEmail(email).isEmpty()) {
            Admin admin = new Admin();
            admin.setNome("Administrador do Sistema");
            admin.setEmail(email);
            admin.setSenha(passwordEncoder.encode("admin123"));
            admin.setCpf("11111111111");
            admin.setDtNascimento(LocalDate.of(1990, 1, 1));
            admin.setEndereco("Rua Biblioteca, 100 - Centro");
            admin.setTelefone("11999999999");
            admin.setIdAdmin(1L);
            adminRepository.save(admin);
        }
    }

    private void seedFuncionario() {
        String email = "func@livraria.com";
        if (funcionarioRepository.findByEmail(email).isEmpty()) {
            Funcionario func = new Funcionario();
            func.setNome("Funcionário de Acervo");
            func.setEmail(email);
            func.setSenha(passwordEncoder.encode("func123"));
            func.setCpf("22222222222");
            func.setDtNascimento(LocalDate.of(1995, 5, 20));
            func.setEndereco("Avenida dos Livros, 200 - Bairro");
            func.setTelefone("11988887777");
            func.setIdFuncionario(101L);
            funcionarioRepository.save(func);
        }
    }
}