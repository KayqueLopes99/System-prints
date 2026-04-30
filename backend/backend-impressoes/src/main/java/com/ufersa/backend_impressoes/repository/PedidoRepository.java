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

    List<Pedido> findByUsuario_IdUsuarioAndStatusFilaInOrderByDataHoraDesc(int idUsuario, List<StatusPedido> status);

    List<Pedido> findByUsuario_IdUsuarioAndStatusFilaOrderByDataHoraDesc(int idUsuario, StatusPedido status);

    // --- Consultas para as Estatísticas (AJUSTADAS) ---

    // 1. Conta apenas pedidos que NÃO foram cancelados
    @Query("SELECT COUNT(p) FROM Pedido p WHERE p.usuario.idUsuario = :idUsuario AND p.statusFila <> com.ufersa.backend_impressoes.model.enuns.StatusPedido.CANCELADO")
    long contarPedidosPorUsuario(@Param("idUsuario") int idUsuario);

    // 2. Soma as páginas apenas de pedidos que NÃO foram cancelados
    @Query("SELECT COALESCE(SUM(p.totalPaginasArquivo), 0) FROM Pedido p WHERE p.usuario.idUsuario = :idUsuario AND p.statusFila <> com.ufersa.backend_impressoes.model.enuns.StatusPedido.CANCELADO")
    long somarPaginasPorUsuario(@Param("idUsuario") int idUsuario);

    // 3. Soma o gasto apenas de pedidos que NÃO foram cancelados
    @Query("SELECT COALESCE(SUM(p.valorTotal), 0.0) FROM Pedido p WHERE p.usuario.idUsuario = :idUsuario AND p.statusFila <> com.ufersa.backend_impressoes.model.enuns.StatusPedido.CANCELADO")
    double somarGastoPorUsuario(@Param("idUsuario") int idUsuario);

    @Query("SELECT COUNT(p) FROM Pedido p WHERE p.statusFila IN ('PENDENTE', 'NA_FILA', 'IMPRIMINDO') AND p.dataHora < :dataHora")
    int contarPedidosNaFrente(@Param("dataHora") java.time.LocalDateTime dataHora);
}