package com.ufersa.backend_impressoes.model;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import lombok.Setter;
import lombok.Getter;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;

import lombok.NoArgsConstructor;

@Entity
@Table(name = "usuario")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "tipo_usuario", discriminatorType = DiscriminatorType.STRING)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.EXISTING_PROPERTY, property = "tipo_usuario", visible = true)
@JsonSubTypes({
    @JsonSubTypes.Type(value = Estudante.class, name = "ESTUDANTE"),
    @JsonSubTypes.Type(value = Administrador.class, name = "ADMINISTRADOR")
})

public class Usuario {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id_usuario")
  private int idUsuario;

  @Column(name = "nome_completo", nullable = false)
  private String nomeCompleto;

  @Column(nullable = false, unique = true)
  private String email;

  @Column(name = "senha", nullable = false)
  private String senha;

  @Column(name = "preferencias_notificacao", nullable = false, columnDefinition = "boolean default true")
  private Boolean preferenciasNotificacao = true;

  @Column(name = "codigo_recuperacao")
  private String codigoRecuperacao;

  @Column(name = "data_expiracao")
  private LocalDateTime dataExpiracao;

  @Transient
  @com.fasterxml.jackson.annotation.JsonProperty("tipo_usuario")
  public String getTipoUsuario() {
    return this instanceof Administrador ? "ADMINISTRADOR" : "ESTUDANTE";
  }

}