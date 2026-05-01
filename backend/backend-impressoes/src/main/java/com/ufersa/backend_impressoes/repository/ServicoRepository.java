package com.ufersa.backend_impressoes.repository;

import com.ufersa.backend_impressoes.model.Servico;
import com.ufersa.backend_impressoes.model.enuns.CategoriaServico;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ServicoRepository extends JpaRepository<Servico, Integer> {
    // Busca por categoria para facilitar o cálculo no PedidoService
    Optional<Servico> findByCategoriaServico(CategoriaServico categoria);
}