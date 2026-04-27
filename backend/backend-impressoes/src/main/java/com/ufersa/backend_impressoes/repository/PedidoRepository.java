package com.ufersa.backend_impressoes.repository;

import com.ufersa.backend_impressoes.model.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.ufersa.backend_impressoes.model.enuns.StatusPedido;

import java.util.List;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Integer> {

    // Busca pedidos de um usuário filtrando por uma LISTA de status (ex: PENDENTE,
    // IMPRIMINDO)
    List<Pedido> findByUsuario_IdUsuarioAndStatusFilaInOrderByDataHoraDesc(int idUsuario, List<StatusPedido> status);

    // Busca pedidos de um usuário filtrando por UM status específico (ex:
    // CONCLUIDO)
    List<Pedido> findByUsuario_IdUsuarioAndStatusFilaOrderByDataHoraDesc(int idUsuario, StatusPedido status);

    // --- Consultas para as Estatísticas ---

    @Query("SELECT COUNT(p) FROM Pedido p WHERE p.usuario.idUsuario = :idUsuario")
    long contarPedidosPorUsuario(@Param("idUsuario") int idUsuario);

    @Query("SELECT COALESCE(SUM(p.totalPaginasArquivo), 0) FROM Pedido p WHERE p.usuario.idUsuario = :idUsuario")
    long somarPaginasPorUsuario(@Param("idUsuario") int idUsuario);

    @Query("SELECT COALESCE(SUM(p.valorTotal), 0.0) FROM Pedido p WHERE p.usuario.idUsuario = :idUsuario")
    double somarGastoPorUsuario(@Param("idUsuario") int idUsuario);

    // Conta quantos pedidos Ativos existem criados ANTES do pedido atual
    @Query("SELECT COUNT(p) FROM Pedido p WHERE p.statusFila IN ('PENDENTE', 'NA_FILA', 'IMPRIMINDO') AND p.dataHora < :dataHora")
    int contarPedidosNaFrente(@Param("dataHora") java.time.LocalDateTime dataHora);
}