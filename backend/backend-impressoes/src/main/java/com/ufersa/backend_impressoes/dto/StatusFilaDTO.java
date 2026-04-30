package com.ufersa.backend_impressoes.dto;

import com.ufersa.backend_impressoes.model.enuns.NivelOcupacao;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StatusFilaDTO {
    private String tempoEstimado;
    private NivelOcupacao nivelOcupacao;
    private long quantidadePessoas;
}