package com.biblioteca.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

import com.biblioteca.security.JwtAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {
    
    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(authorize -> authorize
                // Rotas públicas
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/livros/**").permitAll() // Qualquer um pode ver livros (apenas leitura)
                .requestMatchers(HttpMethod.GET, "/api/avaliacoes/**").permitAll() // Qualquer um pode ver avaliações (apenas leitura)
                // Páginas estáticas e assets (frontend público)
                .requestMatchers("/", "/index.html", "/pages/**", "/assets/**").permitAll()
                
                // Rotas de Cliente (apenas clientes autenticados)
                .requestMatchers(HttpMethod.POST, "/api/compras/**").hasRole("CLIENTE")
                .requestMatchers(HttpMethod.POST, "/api/avaliacoes/**").hasRole("CLIENTE")
                .requestMatchers(HttpMethod.PUT, "/api/avaliacoes/**").hasRole("CLIENTE")
                // Admin pode excluir avaliações indevidas/inapropriadas
                .requestMatchers(HttpMethod.DELETE, "/api/avaliacoes/**").hasAnyRole("CLIENTE", "ADMIN")
                
                // Rotas de Funcionário (funcionários e admins)
                .requestMatchers("/api/funcionarios/**").hasAnyRole("FUNCIONARIO", "ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/livros/**").hasAnyRole("FUNCIONARIO", "ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/livros/**").hasAnyRole("FUNCIONARIO", "ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/livros/**").hasAnyRole("FUNCIONARIO", "ADMIN")
                // Permitir clientes listarem e renovarem suas próprias compras
                .requestMatchers(HttpMethod.GET, "/api/compras/minhas").hasRole("CLIENTE")
                .requestMatchers(HttpMethod.PATCH, "/api/compras/*/renovar").hasRole("CLIENTE")
                // Demais consultas de compras restritas a funcionários/admins
                .requestMatchers(HttpMethod.GET, "/api/compras/**").hasAnyRole("FUNCIONARIO", "ADMIN")
                .requestMatchers(HttpMethod.PATCH, "/api/compras/**").hasAnyRole("FUNCIONARIO", "ADMIN")
                
                
                // Rotas de Admin (apenas admins)
                .requestMatchers("/api/administradores/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/funcionarios/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/funcionarios/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/funcionarios/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/compras/**").hasRole("ADMIN")
                
                // Qualquer outra rota requer autenticação
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        // Permitir origens comuns de desenvolvimento (inclui o servidor de preview em 8000)
        config.setAllowedOrigins(Arrays.asList(
            // Servidores estáticos comuns
            "http://localhost:8000",
            "http://127.0.0.1:8000",
            // Porta alternativa usada nesta validação
            "http://localhost:8001",
            "http://127.0.0.1:8001",
            // Ambientes front-end de desenvolvimento
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://localhost:5500",
            "http://127.0.0.1:5500"
        ));
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        config.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}