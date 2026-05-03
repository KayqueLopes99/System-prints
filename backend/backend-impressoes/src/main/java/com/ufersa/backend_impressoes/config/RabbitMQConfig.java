package com.ufersa.backend_impressoes.config;

import org.springframework.amqp.core.Queue;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String FILA_EMAIL = "fila.email.recuperacao";

    @Bean
    public Queue filaEmail() {
        return new Queue(FILA_EMAIL, true);
    }
}