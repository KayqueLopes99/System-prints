package com.ufersa.backend_impressoes.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificacaoGeralDTO {
    private String titulo;
    private String mensagem;
}