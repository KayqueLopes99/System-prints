package com.ufersa.backend_impressoes.config; // Ajuste se o nome do seu pacote for diferente

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns("*") // Libera para Vercel, localhost, etc.
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "TRACE", "CONNECT") // O "OPTIONS" aqui é o que resolve o seu erro!
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}