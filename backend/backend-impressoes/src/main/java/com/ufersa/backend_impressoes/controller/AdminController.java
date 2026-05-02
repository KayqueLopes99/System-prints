package com.ufersa.backend_impressoes.controller;

import com.ufersa.backend_impressoes.dto.RelatorioDTO;
import com.ufersa.backend_impressoes.model.Administrador;
import com.ufersa.backend_impressoes.model.ConfiguracaoSistema;
import com.ufersa.backend_impressoes.model.Servico;
import com.ufersa.backend_impressoes.model.Usuario;
import com.ufersa.backend_impressoes.service.ConfiguracaoService;
import com.ufersa.backend_impressoes.service.PedidoService;
import com.ufersa.backend_impressoes.service.ServicoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.List;
import com.ufersa.backend_impressoes.service.UsuarioService;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5173")

public class AdminController {

    @Autowired
    private ServicoService servicoService;

    @Autowired
    private ConfiguracaoService configuracaoService;

    @Autowired
    private UsuarioService usuarioService;

    // --- GESTÃO DE CONFIGURAÇÃO DO SISTEMA ---

    @GetMapping("/status-setor") // + verificarStatusSetor()
    public ConfiguracaoSistema verificarStatusSetor() {
        return configuracaoService.obterConfiguracao();
    }

    @PutMapping("/status-setor") // + alterarStatusSetor()
    public void alterarStatusSetor(@RequestParam boolean status, @RequestParam String mensagem) {
        configuracaoService.alterarStatus(status, mensagem);
    }

    // --- GESTÃO DE SERVIÇOS E PREÇOS ---

    @GetMapping("/servicos") // + listarServicos()[cite: 9]
    public List<Servico> listarServicos() {
        return servicoService.listarServicos(); //
    }

    @PatchMapping("/servicos/{id}/preco") // + gerenciarPreços()[cite: 9]
    public Servico gerenciarPrecos(@PathVariable Integer id, @RequestParam Double novoPreco) {
        return servicoService.gerenciarPrecos(id, novoPreco); // [cite: 10]
    }

    @PatchMapping("/servicos/{id}/disponibilidade") // + alterarDisponibilidadeServico()[cite: 9]
    public void alterarDisponibilidadeServico(@PathVariable Integer id, @RequestParam boolean disponivel) {
        servicoService.alterarDisponibilidade(id, disponivel); // [cite: 10]
    }

    @Autowired
    private PedidoService pedidoService;

    @GetMapping("/estatisticas-gerais")
    public ResponseEntity<Map<String, Long>> obterEstatisticas() {
        return ResponseEntity.ok(pedidoService.obterEstatisticasGerais());
    }

    @GetMapping("/usuarios")
    public List<Usuario> gerenciarUsuarios(@RequestParam(required = false) String nome) {
        if (nome != null && !nome.isEmpty()) {
            return usuarioService.buscarPorNome(nome);
        }
        return usuarioService.listarTodos();
    }

    // POST - Para cadastrar o Administrador Interno
    @PostMapping("/usuarios/admin")
    public ResponseEntity<Administrador> cadastrarAdmin(@RequestBody Map<String, String> dados) {
        // Aqui usamos o service para garantir que o tipo seja ADMINISTRADOR[cite: 12,
        // 13]
        Administrador novoAdmin = usuarioService.cadastrarAdministradorInterno(
                dados.get("nome"),
                dados.get("email"),
                dados.get("senha"),
                dados.get("cargo"));
        return ResponseEntity.ok(novoAdmin);
    }

    @GetMapping("/relatorios") // 👈 Verifique se o caminho está idêntico ao do React
    public ResponseEntity<RelatorioDTO> visualizarRelatorios() {
        return ResponseEntity.ok(pedidoService.gerarRelatorioCompleto());
    }
}