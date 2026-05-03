package com.ufersa.backend_impressoes.controller;

import com.ufersa.backend_impressoes.model.Pagamento;
import com.ufersa.backend_impressoes.model.enuns.TipoPagamento;
import com.ufersa.backend_impressoes.service.PagamentoService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pagamentos")
@CrossOrigin(origins = "*") 
public class PagamentoController {

    @Autowired
    private PagamentoService pagamentoService;

    @PostMapping("/registrar")
    public ResponseEntity<Pagamento> registrarPagamento(
            @RequestParam int idPedido,
            @RequestParam TipoPagamento metodo) {
        
        Pagamento pagamento = pagamentoService.registrarPagamento(idPedido, metodo);
        return ResponseEntity.ok(pagamento);
    }
}