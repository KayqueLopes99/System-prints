package com.ufersa.backend_impressoes.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import com.ufersa.backend_impressoes.repository.HorarioFuncionamentoRepository;
import com.ufersa.backend_impressoes.model.HorarioFuncionamento;

@Service
public class HorarioFuncionamentoService {

    @Autowired
    private HorarioFuncionamentoRepository repository;

    // Listar todos (obterQuadroHorarios)[cite: 11]
    public List<HorarioFuncionamento> listarTodos() {
        // Em vez de findAll(), use o método com OrderBy
        return repository.findAllByOrderByIdHorarioAsc();
    }

    // Criar novo horário (cadastrarHorario)
    public HorarioFuncionamento salvar(HorarioFuncionamento horario) {
        return repository.save(horario);
    }

    // Atualizar horário existente (atualizarHorario)[cite: 9]
    public HorarioFuncionamento atualizar(Integer id, HorarioFuncionamento dadosNovos) {
        return repository.findById(id).map(existente -> {
            existente.setDiaSemana(dadosNovos.getDiaSemana());
            existente.setManha(dadosNovos.getManha());
            existente.setTarde(dadosNovos.getTarde());
            existente.setNoite(dadosNovos.getNoite());
            return repository.save(existente);
        }).orElseThrow(() -> new RuntimeException("Horário com ID " + id + " não encontrado."));
    }

    // Remover horário (Parte do gerenciarHorarios)[cite: 9]
    public void excluir(Integer id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Não é possível excluir: Horário não encontrado.");
        }
        repository.deleteById(id);
    }
}