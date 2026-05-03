package com.ufersa.backend_impressoes.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "horario_funcionamento")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HorarioFuncionamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_horario")
    private Integer idHorario;

    @Column(name = "dia_semana", nullable = false, length = 50)
    private String diaSemana;

    @Column(name = "manha", length = 50)
    private String manha;

    @Column(name = "tarde", length = 50)
    private String tarde;

    @Column(name = "noite", length = 50)
    private String noite;
}