package com.ufersa.backend_impressoes.service;

import com.ufersa.backend_impressoes.model.Pagamento;
import com.ufersa.backend_impressoes.model.Pedido;
import com.ufersa.backend_impressoes.model.enuns.TipoPagamento;
import com.ufersa.backend_impressoes.repository.PagamentoRepository;
import com.ufersa.backend_impressoes.repository.PedidoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PagamentoService {

    @Autowired
    private PagamentoRepository pagamentoRepository;

    @Autowired
    private PedidoRepository pedidoRepository;

    @Transactional
    public Pagamento registrarPagamento(int idPedido, TipoPagamento metodo) {
        // 1. Verifica se o pedido existe
        Pedido pedido = pedidoRepository.findById(idPedido)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado para o ID: " + idPedido));

        // 2. Verifica se já existe um pagamento para este pedido (evita duplicação)
        if (pagamentoRepository.findByPedido_IdPedido(idPedido).isPresent()) {
            throw new RuntimeException("Já existe um pagamento registrado para este pedido.");
        }

        // 3. Cria a entidade Pagamento e associa os dados
        Pagamento novoPagamento = new Pagamento();
        novoPagamento.setPedido(pedido);
        novoPagamento.setMetodo(metodo);

        // 4. Salva no banco de dados (PostgreSQL)
        return pagamentoRepository.save(novoPagamento);
    }
}