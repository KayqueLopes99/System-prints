package com.ufersa.backend_impressoes.model;

import com.ufersa.backend_impressoes.model.enuns.TipoPagamento;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "pagamento")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Pagamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_pagamento")
    private int idPagamento;

    @OneToOne
    @JoinColumn(name = "id_pedido", referencedColumnName = "id_pedido", nullable = false, unique = true)
    private Pedido pedido;

    @Enumerated(EnumType.STRING)
    @Column(name = "metodo", nullable = false)
    private TipoPagamento metodo;
}