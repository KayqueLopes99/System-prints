package com.ufersa.backend_impressoes.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import com.ufersa.backend_impressoes.model.HorarioFuncionamento;
import com.ufersa.backend_impressoes.service.HorarioFuncionamentoService;

@RestController
@RequestMapping("/api/horarios")
@CrossOrigin(origins = "http://localhost:5173") 
public class HorarioFuncionamentoController {

    @Autowired
    private HorarioFuncionamentoService service;

    // GET - Listar todos[cite: 10]
    @GetMapping
    public List<HorarioFuncionamento> obterQuadroHorarios() {
        return service.listarTodos();
    }

    // POST - Cadastrar novo horário[cite: 9]
    @PostMapping
    public HorarioFuncionamento cadastrarHorario(@RequestBody HorarioFuncionamento horario) {
        return service.salvar(horario);
    }

    // PUT - Atualizar horário existente[cite: 9]
    @PutMapping("/{id}")
    public HorarioFuncionamento atualizarHorario(@PathVariable Integer id, @RequestBody HorarioFuncionamento horario) {
        return service.atualizar(id, horario);
    }

    // DELETE - Remover um horário[cite: 9]
    @DeleteMapping("/{id}")
    public void removerHorario(@PathVariable Integer id) {
        service.excluir(id);
    }
}