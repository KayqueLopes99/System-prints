package com.ufersa.backend_impressoes.model;

import com.ufersa.backend_impressoes.model.enuns.CategoriaServico;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "servico")
@Data
public class Servico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idServico;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CategoriaServico categoriaServico; // IMPRESSAO ou ENCADERNACAO

    @Column(name = "preco_unitario", nullable = false)
    private Double precoUnitario;

    @Column(nullable = false)
    private Boolean disponivel = true; // Se o serviço está ativo no momento
}