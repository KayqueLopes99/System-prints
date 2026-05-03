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

    public List<HorarioFuncionamento> listarTodos() {
        return repository.findAllByOrderByIdHorarioAsc();
    }

    public HorarioFuncionamento salvar(HorarioFuncionamento horario) {
        return repository.save(horario);
    }

    public HorarioFuncionamento atualizar(Integer id, HorarioFuncionamento dadosNovos) {
        return repository.findById(id).map(existente -> {
            existente.setDiaSemana(dadosNovos.getDiaSemana());
            existente.setManha(dadosNovos.getManha());
            existente.setTarde(dadosNovos.getTarde());
            existente.setNoite(dadosNovos.getNoite());
            return repository.save(existente);
        }).orElseThrow(() -> new RuntimeException("Horário com ID " + id + " não encontrado."));
    }

    public void excluir(Integer id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Não é possível excluir: Horário não encontrado.");
        }
        repository.deleteById(id);
    }
}