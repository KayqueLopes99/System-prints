package com.ufersa.backend_impressoes.repository;

import com.ufersa.backend_impressoes.model.ConfiguracaoSistema;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ConfiguracaoRepository extends JpaRepository<ConfiguracaoSistema, Integer> {
}