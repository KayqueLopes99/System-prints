package com.ufersa.backend_impressoes.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.ufersa.backend_impressoes.model.enuns.Orientacao;

import com.ufersa.backend_impressoes.model.enuns.TipoCor;
import com.ufersa.backend_impressoes.model.enuns.CategoriaServico;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "item_pedido")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ItemPedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_item")
    private int idItem;

    @ManyToOne
    @JoinColumn(name = "id_pedido", nullable = false)
    @JsonBackReference
    private Pedido pedido;

    @Column(name = "quantidade")
    private Integer quantidade;

    @Column(name = "tamanho_papel")
    private String tamanhoPapel;

    @Enumerated(EnumType.STRING)
    @Column(name = "orientacao")
    private Orientacao orientacao;

    @Column(name = "frente_verso")
    private Boolean frenteVerso;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_cor")
    private TipoCor tipoCor;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_servico", nullable = false)
    private CategoriaServico tipoServico;

}