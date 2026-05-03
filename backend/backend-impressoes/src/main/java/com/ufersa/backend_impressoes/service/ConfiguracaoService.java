package com.ufersa.backend_impressoes.service;

import com.ufersa.backend_impressoes.model.ConfiguracaoSistema;
import com.ufersa.backend_impressoes.repository.ConfiguracaoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ConfiguracaoService {

    @Autowired
    private ConfiguracaoRepository repository;

    
    public ConfiguracaoSistema obterConfiguracao() {
        return repository.findById(1).orElseGet(() -> {
            ConfiguracaoSistema padrao = new ConfiguracaoSistema();
            padrao.setSetorAberto(true);
            padrao.setMensagemAviso("Gráfica em funcionamento.");
            return repository.save(padrao);
        });
    }

    
    public void alterarStatus(boolean status, String mensagem) {
        ConfiguracaoSistema config = obterConfiguracao();
        config.setSetorAberto(status);
        config.setMensagemAviso(mensagem);
        repository.save(config);
    }
}