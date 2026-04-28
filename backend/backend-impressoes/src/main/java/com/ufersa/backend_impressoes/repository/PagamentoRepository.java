package com.ufersa.backend_impressoes.repository;

import com.ufersa.backend_impressoes.model.Pagamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PagamentoRepository extends JpaRepository<Pagamento, Integer> {
    
    // Busca um pagamento associado a um pedido específico
    Optional<Pagamento> findByPedido_IdPedido(int idPedido);
}