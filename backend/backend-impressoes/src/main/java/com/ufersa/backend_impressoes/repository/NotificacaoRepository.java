package com.ufersa.backend_impressoes.repository;

import com.ufersa.backend_impressoes.model.Notificacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificacaoRepository extends JpaRepository<Notificacao, Integer> {
    
    // Lista as notificações do usuário da mais recente para a mais antiga
    List<Notificacao> findByUsuario_IdUsuarioOrderByDataHoraDesc(int idUsuario);
    
    // Conta quantas notificações ainda não foram lidas
    long countByUsuario_IdUsuarioAndLidaFalse(int idUsuario);
}