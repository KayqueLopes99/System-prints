package com.ufersa.backend_impressoes.dto;

import lombok.Data;
import java.util.Map;

@Data
public class RelatorioDTO {
    // Cards Superiores
    private long totalImpressoesMes;
    private double receitaTotalMes;
    private long usuariosAtivosMes;
    private double ticketMedio;

    // Gráfico de Atividade Semanal (Seg a Sex)
    private Map<String, Map<String, Long>> atividadeSemanal; 

    // Gráfico de Pizza (Distribuição)
    private Map<String, Double> distribuicaoServicos;

    // Gráfico de Linha (Evolução Mensal)
    private Map<String, Double> evolucaoReceitaMensal;
}