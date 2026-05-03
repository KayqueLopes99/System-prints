package com.ufersa.backend_impressoes.service;

import com.ufersa.backend_impressoes.model.Servico;
import com.ufersa.backend_impressoes.repository.ServicoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ServicoService {

    @Autowired
    private ServicoRepository repository;

    public List<Servico> listarServicos() {
        return repository.findAll();
    }

    public Servico gerenciarPrecos(Integer idServico, Double novoPreco) {
        Servico s = repository.findById(idServico)
                .orElseThrow(() -> new RuntimeException("Serviço não encontrado"));
        
        s.setPrecoUnitario(novoPreco);
        return repository.save(s);
    }

    public void alterarDisponibilidade(Integer idServico, Boolean disponivel) {
        Servico s = repository.findById(idServico)
                .orElseThrow(() -> new RuntimeException("Serviço não encontrado"));
        s.setDisponivel(disponivel);
        repository.save(s);
    }
}