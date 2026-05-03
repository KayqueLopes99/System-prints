package com.ufersa.backend_impressoes.controller;

import com.ufersa.backend_impressoes.dto.EstatisticasPedidoDTO;
import com.ufersa.backend_impressoes.dto.PedidoAdminDTO;
import com.ufersa.backend_impressoes.dto.PedidoCardDTO;
import com.ufersa.backend_impressoes.dto.PedidoRequestDTO;
import com.ufersa.backend_impressoes.dto.StatusFilaDTO;
import com.ufersa.backend_impressoes.model.Pedido;
import com.ufersa.backend_impressoes.model.enuns.StatusPedido;

import com.ufersa.backend_impressoes.service.PedidoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import com.ufersa.backend_impressoes.repository.PedidoRepository;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/pedidos")
@CrossOrigin(origins = "*")
public class PedidoController {

    @Autowired
    private PedidoService pedidoService;

    @Autowired
    private PedidoRepository pedidoRepository;

    // @Autowired
    // private PedidoService service; // Injetando o service para usar no endpoint
    // do admin

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

    @GetMapping("/historico/{idUsuario}")
    public ResponseEntity<List<PedidoCardDTO>> getHistoricoTodos(@PathVariable int idUsuario) {
        return ResponseEntity.ok(pedidoService.listarPedidosHistorico(idUsuario));
    }

    // Rota para abas específicas
    @GetMapping("/usuario/{idUsuario}/status/{status}")
    public ResponseEntity<List<PedidoCardDTO>> getPedidosPorStatus(
            @PathVariable int idUsuario,
            @PathVariable StatusPedido status) {
        return ResponseEntity.ok(pedidoService.listarPedidosPorStatus(idUsuario, status));
    }

    // Criar um novo pedido
    @PostMapping(value = "/criar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Pedido> criarPedido(
            @RequestPart("pedido") PedidoRequestDTO dto,
            @RequestPart("file") MultipartFile file) throws IOException {
        return ResponseEntity.ok(pedidoService.confirmarPedido(dto, file));
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> baixarArquivo(@PathVariable int id) {
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + pedido.getNomeArquivoOriginal() + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pedido.getDadosArquivo());
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

    @GetMapping("/admin/proximo")
    public ResponseEntity<PedidoCardDTO> verProximo() {
        return ResponseEntity.ok(pedidoService.verProximoDaFila());
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

    // @GetMapping("/admin/fila")
    // public ResponseEntity<List<PedidoAdminDTO>> listarFilaParaAdmin() {
    // // Retorna a lista processada pelo Service[cite: 2, 17]
    // List<PedidoAdminDTO> fila = pedidoService.listarFilaGlobalAdmin();
    // return ResponseEntity.ok(fila);
    // }

    // No seu PedidoController[cite: 18]
    // Unificado: Agora aceita os parâmetros da barra de busca e do select
    @GetMapping("/admin/fila")
    public ResponseEntity<List<PedidoAdminDTO>> listarFilaParaAdmin(
            @RequestParam(required = false) String termo,
            @RequestParam(required = false) String status) {

        // Chama a lógica de busca dinâmica do Service
        List<PedidoAdminDTO> fila = pedidoService.buscarFilaAdminFiltrada(termo, status);
        return ResponseEntity.ok(fila);
    }

    // No PedidoController.java[cite: 26]
    @PutMapping("/{id}/status")
    public ResponseEntity<Void> atualizarStatus(
            @PathVariable int id,
            @RequestParam StatusPedido novoStatus) {
        pedidoService.atualizarStatusPedido(id, novoStatus); // Usa o método que já existe no seu Service[cite: 27]
        return ResponseEntity.ok().build();
    }
}
