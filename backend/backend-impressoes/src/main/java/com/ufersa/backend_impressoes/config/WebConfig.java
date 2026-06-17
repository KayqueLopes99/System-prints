package com.ufersa.backend_impressoes.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
public class WebConfig {

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        
        config.setAllowCredentials(true);
        config.addAllowedOriginPattern("*"); // Libera acesso da Vercel, Localhost, etc.
        config.addAllowedHeader("*"); // Libera todos os cabeçalhos
        config.addAllowedMethod("*"); // Libera POST, GET, OPTIONS, PUT, DELETE
        
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}