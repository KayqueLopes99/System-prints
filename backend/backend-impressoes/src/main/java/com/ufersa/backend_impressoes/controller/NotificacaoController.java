package com.ufersa.backend_impressoes.controller;

import com.ufersa.backend_impressoes.dto.NotificacaoGeralDTO;
import com.ufersa.backend_impressoes.model.Notificacao;
import com.ufersa.backend_impressoes.service.NotificacaoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/notificacoes")
@CrossOrigin(origins = "*")
public class NotificacaoController {

    @Autowired
    private NotificacaoService service;

    @GetMapping("/usuario/{idUsuario}")
    public ResponseEntity<List<Notificacao>> listar(@PathVariable int idUsuario) {
        return ResponseEntity.ok(service.buscarPorUsuario(idUsuario));
    }

    @GetMapping("/usuario/{idUsuario}/nao-lidas")
    public ResponseEntity<Long> contarNaoLidas(@PathVariable int idUsuario) {
        return ResponseEntity.ok(service.buscarTotalNaoLidas(idUsuario));
    }

    @PatchMapping("/{id}/lida")
    public ResponseEntity<Void> marcarLida(@PathVariable int id) {
        service.marcarComoLida(id);
        return ResponseEntity.ok().build();
    }

    // Endpoint para enviar aviso a todos os usuários do sistema
    @PostMapping("/geral")
    public ResponseEntity<Void> criarNotificacaoGeral(@RequestBody NotificacaoGeralDTO dto) {
        service.cadastrarNotificacaoGeral(dto.getTitulo(), dto.getMensagem());
        return ResponseEntity.ok().build();
    }
}