package com.ufersa.backend_impressoes.model;

import com.ufersa.backend_impressoes.model.enuns.StatusPedido;

import java.time.LocalDateTime;
import java.util.List;

import org.hibernate.annotations.JdbcTypeCode;
import java.sql.Types;


import com.fasterxml.jackson.annotation.JsonManagedReference;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "pedido")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_pedido")
    private int idPedido;

    @ManyToOne
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @Column(name = "data_hora")
    private LocalDateTime dataHora;

    @Enumerated(EnumType.STRING)
    @Column(name = "status_fila")
    private StatusPedido statusFila;

    @Column(name = "arquivo_url")
    private String arquivoUrl;

    @Column(name = "nome_arquivo_original")
    private String nomeArquivoOriginal;

    @Column(name = "tamanho_arquivo_mb")
    private Double tamanhoArquivoMb;

    @Column(name = "total_paginas_arquivo")
    private Integer totalPaginasArquivo;

    @Column(name = "valor_total")
    private Double valorTotal;

    @JdbcTypeCode(Types.VARBINARY)
    @Column(name = "dados_arquivo")
    private byte[] dadosArquivo;

    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @JsonManagedReference
    private List<ItemPedido> itens;
}