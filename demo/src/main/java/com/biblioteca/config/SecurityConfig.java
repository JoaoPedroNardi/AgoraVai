package com.biblioteca.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
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
import java.util.List;

import com.biblioteca.security.JwtAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Value("${cors.allowed.origins:*}")
    private String allowedOrigins;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(authorize -> authorize
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/livros/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/avaliacoes/**").permitAll()
                .requestMatchers("/", "/index.html", "/pages/**", "/assets/**").permitAll()

                .requestMatchers(HttpMethod.POST, "/api/compras/**").hasRole("CLIENTE")
                .requestMatchers(HttpMethod.POST, "/api/avaliacoes/**").hasRole("CLIENTE")
                .requestMatchers(HttpMethod.PUT, "/api/avaliacoes/**").hasRole("CLIENTE")
                .requestMatchers(HttpMethod.DELETE, "/api/avaliacoes/**").hasAnyRole("CLIENTE", "ADMIN")

                .requestMatchers("/api/funcionarios/**").hasAnyRole("FUNCIONARIO", "ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/livros/**").hasAnyRole("FUNCIONARIO", "ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/livros/**").hasAnyRole("FUNCIONARIO", "ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/livros/**").hasAnyRole("FUNCIONARIO", "ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/compras/minhas").hasRole("CLIENTE")
                .requestMatchers(HttpMethod.PATCH, "/api/compras/*/renovar").hasRole("CLIENTE")
                .requestMatchers(HttpMethod.GET, "/api/compras/**").hasAnyRole("FUNCIONARIO", "ADMIN")
                .requestMatchers(HttpMethod.PATCH, "/api/compras/**").hasAnyRole("FUNCIONARIO", "ADMIN")

                .requestMatchers("/api/administradores/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/funcionarios/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/funcionarios/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/funcionarios/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/compras/**").hasRole("ADMIN")

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
        List<String> patterns = Arrays.stream((allowedOrigins == null ? "*" : allowedOrigins).split(","))
            .map(String::trim)
            .filter(s -> !s.isBlank())
            .toList();
        if (patterns.isEmpty()) {
            config.setAllowedOriginPatterns(Arrays.asList("*"));
        } else {
            config.setAllowedOriginPatterns(patterns);
        }
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        config.setAllowedHeaders(Arrays.asList("*"));
        config.setExposedHeaders(Arrays.asList("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}