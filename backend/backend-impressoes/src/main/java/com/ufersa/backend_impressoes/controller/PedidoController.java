package com.ufersa.backend_impressoes.controller;

import com.ufersa.backend_impressoes.dto.EstatisticasPedidoDTO;
import com.ufersa.backend_impressoes.dto.PedidoCardDTO;
import com.ufersa.backend_impressoes.dto.PedidoRequestDTO;
import com.ufersa.backend_impressoes.dto.StatusFilaDTO;
import com.ufersa.backend_impressoes.model.Pedido;
import com.ufersa.backend_impressoes.model.enuns.StatusPedido;

import com.ufersa.backend_impressoes.service.PedidoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pedidos")
@CrossOrigin(origins = "*") // Permite o React acessar sem erro de CORS
public class PedidoController {

    @Autowired
    private PedidoService pedidoService;

    // Rota para os cards: GET /api/pedidos/estatisticas/1
    @GetMapping("/estatisticas/{idUsuario}")
    public ResponseEntity<EstatisticasPedidoDTO> getEstatisticas(@PathVariable int idUsuario) {
        return ResponseEntity.ok(pedidoService.obterEstatisticasUsuario(idUsuario));
    }

    // Rota para a aba "Ativos": GET /api/pedidos/ativos/1
    @GetMapping("/ativos/{idUsuario}")
    public ResponseEntity<List<PedidoCardDTO>> getPedidosAtivos(@PathVariable int idUsuario) {
        // Chamando o método correto do service que criamos no passo anterior
        List<PedidoCardDTO> pedidos = pedidoService.listarPedidosAtivos(idUsuario);
        return ResponseEntity.ok(pedidos);
    }

    // Rota para aba "Histórico" (Todos): GET /api/pedidos/historico/1
    @GetMapping("/historico/{idUsuario}")
    public ResponseEntity<List<Pedido>> getHistoricoTodos(@PathVariable int idUsuario) {
        return ResponseEntity.ok(pedidoService.listarPedidosHistorico(idUsuario));
    }

    // Rota para abas específicas: GET /api/pedidos/usuario/1/status/CONCLUIDO
    @GetMapping("/usuario/{idUsuario}/status/{status}")
    public ResponseEntity<List<Pedido>> getPedidosPorStatus(
            @PathVariable int idUsuario,
            @PathVariable StatusPedido status) {
        return ResponseEntity.ok(pedidoService.listarPedidosPorStatus(idUsuario, status));
    }

    // Criar um novo pedido
    @PostMapping("/criar")
    public ResponseEntity<Pedido> criarPedido(@RequestBody PedidoRequestDTO dto) {
        return ResponseEntity.ok(pedidoService.confirmarPedido(dto));
    }

    // Cancelar um pedido
    @PutMapping("/{id}/cancelar")
    public ResponseEntity<Void> cancelar(@PathVariable int id) {
        pedidoService.cancelarPedido(id);
        return ResponseEntity.ok().build();
    }

    // Obter posição na fila
    @GetMapping("/{id}/posicao")
    public ResponseEntity<Integer> getPosicao(@PathVariable int id) {
        return ResponseEntity.ok(pedidoService.obterPosicaoFila(id));
    }

    // Detalhes de um pedido específico
    @GetMapping("/{id}")
    public ResponseEntity<PedidoCardDTO> getDetalhes(@PathVariable int id) {
        return ResponseEntity.ok(pedidoService.obterDetalhesPedido(id));
    }

    // Estimação de tempo para o estudante
    @GetMapping("/{id}/tempo-estimado")
    public ResponseEntity<String> getTempoEstimado(@PathVariable int id) {
        return ResponseEntity.ok(pedidoService.estimarTempoFila(id));
    }

    // --- ROTAS DO ADMINISTRADOR ---

    @GetMapping("/admin/fila")
    public ResponseEntity<List<PedidoCardDTO>> getFilaGlobal() {
        return ResponseEntity.ok(pedidoService.listarFilaGlobalAdmin());
    }

    @PutMapping("/admin/chamar-proximo")
    public ResponseEntity<PedidoCardDTO> chamarProximo() {
        return ResponseEntity.ok(pedidoService.chamarProximoPedido());
    }

    @PutMapping("/{id}/concluir")
    public ResponseEntity<Void> concluir(@PathVariable int id) {
        pedidoService.concluirImpressao(id);
        return ResponseEntity.ok().build();
    }

    // Rota consolidada para otimizar o carregamento no React[cite: 12]
    @GetMapping("/fila/status-geral")
    public ResponseEntity<StatusFilaDTO> getStatusFilaGeral() {
        return ResponseEntity.ok(pedidoService.obterStatusFilaGeral());
    }
}
