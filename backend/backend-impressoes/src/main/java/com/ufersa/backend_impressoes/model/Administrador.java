package com.ufersa.backend_impressoes.model;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@DiscriminatorValue("ADMINISTRADOR")
@Data
@EqualsAndHashCode(callSuper = true)
public class Administrador extends Usuario {

    @Column(name = "cargo_setor", length = 100)
    private String cargoSetor;
}
