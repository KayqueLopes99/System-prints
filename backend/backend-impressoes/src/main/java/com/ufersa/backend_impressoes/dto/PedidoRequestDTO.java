package com.ufersa.backend_impressoes.dto;

import com.ufersa.backend_impressoes.model.enuns.Orientacao;
import com.ufersa.backend_impressoes.model.enuns.TipoCor;
import com.ufersa.backend_impressoes.model.enuns.TipoPagamento;
import com.ufersa.backend_impressoes.model.enuns.CategoriaServico;

import lombok.Data;

@Data
public class PedidoRequestDTO {
    private int idUsuario;
    private String nomeArquivo;
    private int totalPaginas;
    private double tamanhoMb;
    private int quantidade;
    private String tamanhoPapel;
    private Orientacao orientacao;
    private Boolean frenteVerso;
    private TipoCor tipoCor;

    private CategoriaServico tipoServico;
    
    private TipoPagamento metodoPagamento;
}