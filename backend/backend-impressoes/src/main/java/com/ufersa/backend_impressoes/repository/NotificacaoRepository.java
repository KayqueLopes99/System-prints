package com.ufersa.backend_impressoes.repository;

import com.ufersa.backend_impressoes.model.Notificacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificacaoRepository extends JpaRepository<Notificacao, Integer> {
    
    List<Notificacao> findByUsuario_IdUsuarioOrderByDataHoraDesc(int idUsuario);
    
    long countByUsuario_IdUsuarioAndLidaFalse(int idUsuario);
}