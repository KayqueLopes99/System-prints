package com.ufersa.backend_impressoes.repository;

import com.ufersa.backend_impressoes.model.Pedido;
import com.ufersa.backend_impressoes.model.enuns.StatusPedido;
import com.ufersa.backend_impressoes.model.enuns.CategoriaServico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Integer> {

    // --- Buscas Padrão ---
    List<Pedido> findByUsuario_IdUsuarioAndStatusFilaInOrderByDataHoraDesc(int idUsuario, List<StatusPedido> status);

    List<Pedido> findByUsuario_IdUsuarioAndStatusFilaOrderByDataHoraDesc(int idUsuario, StatusPedido status);

    List<Pedido> findByStatusFilaInOrderByDataHoraAsc(List<StatusPedido> status);

    List<Pedido> findByStatusFilaOrderByDataHoraAsc(StatusPedido status);

    Optional<Pedido> findFirstByStatusFilaInOrderByDataHoraAsc(List<StatusPedido> status);

    long countByStatusFilaIn(List<StatusPedido> status);

    long countByStatusFila(StatusPedido status);

    long countByStatusFilaAndDataHoraAfter(StatusPedido status, LocalDateTime data);

    // --- Consultas para Estatísticas de Usuário ---
    @Query("SELECT COUNT(p) FROM Pedido p WHERE p.usuario.idUsuario = :idUsuario AND p.statusFila <> com.ufersa.backend_impressoes.model.enuns.StatusPedido.CANCELADO")
    long contarPedidosPorUsuario(@Param("idUsuario") int idUsuario);

    @Query("SELECT COALESCE(SUM(p.totalPaginasArquivo), 0) FROM Pedido p WHERE p.usuario.idUsuario = :idUsuario AND p.statusFila <> com.ufersa.backend_impressoes.model.enuns.StatusPedido.CANCELADO")
    long somarPaginasPorUsuario(@Param("idUsuario") int idUsuario);

    @Query("SELECT COALESCE(SUM(p.valorTotal), 0.0) FROM Pedido p WHERE p.usuario.idUsuario = :idUsuario AND p.statusFila <> com.ufersa.backend_impressoes.model.enuns.StatusPedido.CANCELADO")
    double somarGastoPorUsuario(@Param("idUsuario") int idUsuario);

    @Query("SELECT COUNT(p) FROM Pedido p WHERE p.statusFila IN ('PENDENTE', 'NA_FILA', 'IMPRIMINDO') AND p.dataHora < :dataHora")
    int contarPedidosNaFrente(@Param("dataHora") LocalDateTime dataHora);

    @Query("SELECT COALESCE(SUM(p.totalPaginasArquivo), 0) FROM Pedido p WHERE p.statusFila IN ('PENDENTE', 'NA_FILA', 'IMPRIMINDO') AND p.dataHora < :dataHora")
    long somarPaginasNaFrente(@Param("dataHora") LocalDateTime dataHora);

    // --- Consultas para Relatórios Gerais (Admin) ---

    @Query("SELECT SUM(p.valorTotal) FROM Pedido p WHERE MONTH(p.dataHora) = MONTH(CURRENT_DATE) AND YEAR(p.dataHora) = YEAR(CURRENT_DATE) AND p.statusFila <> com.ufersa.backend_impressoes.model.enuns.StatusPedido.CANCELADO")
    Double somarReceitaNoMesAtual();

    @Query("SELECT COUNT(DISTINCT p.usuario.idUsuario) FROM Pedido p WHERE MONTH(p.dataHora) = MONTH(CURRENT_DATE) AND YEAR(p.dataHora) = YEAR(CURRENT_DATE)")
    Long contarUsuariosDistintosNoMes();

    // Removido o JOIN s.servico pois você usa o enum tipoServico diretamente
    @Query("SELECT SUM(i.quantidade) " +
            "FROM ItemPedido i JOIN i.pedido p " +
            "WHERE i.tipoServico = :categoria " +
            "AND MONTH(p.dataHora) = MONTH(CURRENT_DATE) " +
            "AND YEAR(p.dataHora) = YEAR(CURRENT_DATE) " +
            "AND p.statusFila <> com.ufersa.backend_impressoes.model.enuns.StatusPedido.CANCELADO")
    Long contarItensPorCategoriaNoMes(
            @Param("categoria") com.ufersa.backend_impressoes.model.enuns.CategoriaServico categoria);

    @Query("SELECT i.tipoServico, SUM(i.quantidade) " +
            "FROM ItemPedido i JOIN i.pedido p " +
            "WHERE p.statusFila <> com.ufersa.backend_impressoes.model.enuns.StatusPedido.CANCELADO " +
            "GROUP BY i.tipoServico")
    List<Object[]> buscarDistribuicaoPorServico();

    @Query("SELECT MONTH(p.dataHora), SUM(p.valorTotal) FROM Pedido p WHERE YEAR(p.dataHora) = YEAR(CURRENT_DATE) AND p.statusFila <> com.ufersa.backend_impressoes.model.enuns.StatusPedido.CANCELADO GROUP BY MONTH(p.dataHora) ORDER BY MONTH(p.dataHora)")
    List<Object[]> buscarEvolucaoReceitaMensal();

    // Adicione este método ao seu PedidoRepository.java
    @Query("SELECT COUNT(p) FROM Pedido p WHERE MONTH(p.dataHora) = MONTH(CURRENT_DATE) AND YEAR(p.dataHora) = YEAR(CURRENT_DATE) AND p.statusFila <> com.ufersa.backend_impressoes.model.enuns.StatusPedido.CANCELADO")
    long countPedidosNoMes();
}