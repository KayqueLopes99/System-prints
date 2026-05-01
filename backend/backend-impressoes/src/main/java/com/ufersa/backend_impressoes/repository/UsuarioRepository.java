package com.ufersa.backend_impressoes.repository;

import com.ufersa.backend_impressoes.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {

    Optional<Usuario> findByEmail(String email);

    @Query("SELECT u FROM Usuario u WHERE u.email = :login OR (treat(u as Estudante).matricula = :login)")
    Optional<Usuario> findByEmailOrMatricula(@Param("login") String login);

    Optional<Usuario> findByCodigoRecuperacao(String codigoRecuperacao);

    // Busca usuários cujo nome contém a sequência informada (case insensitive)
    List<Usuario> findByNomeCompletoContainingIgnoreCase(String nome);


}