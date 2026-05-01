package com.ufersa.backend_impressoes.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "configuracao_sistema")
@Data
public class ConfiguracaoSistema {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_config")
    private Integer idConfig;

    @Column(name = "setor_aberto")
    private boolean setorAberto;

    @Column(name = "mensagem_aviso")
    private String mensagemAviso;
}