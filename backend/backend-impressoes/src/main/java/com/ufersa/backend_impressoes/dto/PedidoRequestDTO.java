package com.ufersa.backend_impressoes.dto;

import com.ufersa.backend_impressoes.model.enuns.Orientacao;
import com.ufersa.backend_impressoes.model.enuns.TipoCor;
import lombok.Data;

@Data
public class PedidoRequestDTO {
    private int idUsuario;
    private String nomeArquivo;
    private int totalPaginas;
    private double tamanhoMb;
    
    // Detalhes do Item
    private int quantidade;
    private String tamanhoPapel;
    private Orientacao orientacao;
    private Boolean frenteVerso;
    private TipoCor tipoCor;
    private String observacoes;
}