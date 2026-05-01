package com.ufersa.backend_impressoes.repository;

import com.ufersa.backend_impressoes.model.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.ufersa.backend_impressoes.model.enuns.StatusPedido;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

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

    // Busca pedidos ativos para a fila do Administrador (Ordenados por
    // chegada)[cite: 18]
    List<Pedido> findByStatusFilaInOrderByDataHoraAsc(List<StatusPedido> status);

    // Busca pedidos por status para o Admin (Ex: Ver tudo que está 'PRONTO')[cite:
    // 18]
    List<Pedido> findByStatusFilaOrderByDataHoraAsc(StatusPedido status);

    // Busca o próximo pedido da fila (O mais antigo que ainda não foi
    // impresso)[cite: 18]
    Optional<Pedido> findFirstByStatusFilaInOrderByDataHoraAsc(List<StatusPedido> status);

    // Soma o total de páginas de todos os pedidos que estão na frente de um
    // determinado momento[cite: 18]
    @Query("SELECT COALESCE(SUM(p.totalPaginasArquivo), 0) FROM Pedido p WHERE p.statusFila IN ('PENDENTE', 'NA_FILA', 'IMPRIMINDO') AND p.dataHora < :dataHora")
    long somarPaginasNaFrente(@Param("dataHora") java.time.LocalDateTime dataHora);

    // Conta quantos pedidos existem com os status informados na lista[cite: 16]
    long countByStatusFilaIn(List<StatusPedido> status);

    // No PedidoRepository, adicione estes métodos:
    long countByStatusFila(StatusPedido status);

    // Para contar os concluídos e cancelados de "Hoje"
    long countByStatusFilaAndDataHoraAfter(StatusPedido status, LocalDateTime data);

}