package com.ufersa.backend_impressoes.dto;

import lombok.Data;
import java.util.Map;

@Data
public class RelatorioDTO {
    private long totalImpressoesMes;
    private double receitaTotalMes;
    private long usuariosAtivosMes;
    private double ticketMedio;

    private Map<String, Map<String, Long>> atividadeSemanal; 
    private Map<String, Double> distribuicaoServicos;
    private Map<String, Double> evolucaoReceitaMensal;
}