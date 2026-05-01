package com.ufersa.backend_impressoes.service;

import com.ufersa.backend_impressoes.dto.EstatisticasPedidoDTO;
import com.ufersa.backend_impressoes.dto.PedidoCardDTO;
import com.ufersa.backend_impressoes.dto.PedidoRequestDTO;
import com.ufersa.backend_impressoes.dto.StatusFilaDTO;
import com.ufersa.backend_impressoes.model.ItemPedido;
import com.ufersa.backend_impressoes.model.Pedido;
import com.ufersa.backend_impressoes.model.Servico;
import com.ufersa.backend_impressoes.model.Usuario;
import com.ufersa.backend_impressoes.model.enuns.NivelOcupacao;
import com.ufersa.backend_impressoes.model.enuns.StatusPedido;
import com.ufersa.backend_impressoes.model.enuns.TipoCor;
import com.ufersa.backend_impressoes.repository.PedidoRepository;
import com.ufersa.backend_impressoes.repository.ServicoRepository;
import com.ufersa.backend_impressoes.repository.UsuarioRepository;
import com.ufersa.backend_impressoes.model.Pagamento;
import com.ufersa.backend_impressoes.repository.PagamentoRepository;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.transaction.annotation.Transactional;
import java.time.Duration;
import java.util.Map;

@Service
public class PedidoService {

    @Autowired
    private PedidoRepository pedidoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PagamentoRepository pagamentoRepository;

    @Autowired
    private NotificacaoService notificacaoService;

    // Constantes de preço (Poderiam vir do banco futuramente)
    // private final double PRECO_PB = 0.15;
    // private final double PRECO_COLORIDO = 1.00;

    // // Novas constantes para Encadernação
    // private final double PRECO_BASE_ENCADERNACAO = 5.00; // Valor da capa +
    // espiral
    // private final double PRECO_FOLHA_ENCADERNACAO = 0.15; // R$ 1,50 / 10 folhas

    // --- REMOVA AS CONSTANTES ANTIGAS ---
    // private final double PRECO_PB = 0.15; ... (apague todas)

    // --- ADICIONE ESTAS INJEÇÕES ---
    @Autowired
    private ServicoRepository servicoRepository; // Para buscar os preços ID 1, 2, 3 e 4

    @Autowired
    private ConfiguracaoService configuracaoService; // Para verificar se o setor está aberto

    // --- ADICIONE ESTE MÉTODO AUXILIAR NO FINAL DA CLASSE ---
    private Double buscarPrecoPorId(Integer id) {
        return servicoRepository.findById(id)
                .map(Servico::getPrecoUnitario)
                .orElseThrow(() -> new RuntimeException("Preço ID " + id + " não configurado no banco!"));
    }

    // 1. Estatísticas do Usuário (Cards do topo)
    public EstatisticasPedidoDTO obterEstatisticasUsuario(int idUsuario) {
        long pedidos = pedidoRepository.contarPedidosPorUsuario(idUsuario);
        long paginas = pedidoRepository.somarPaginasPorUsuario(idUsuario);
        double gasto = pedidoRepository.somarGastoPorUsuario(idUsuario);

        return new EstatisticasPedidoDTO(pedidos, paginas, gasto);
    }

    // 2. Listar Pedidos Ativos (Pendente, Na Fila, Imprimindo, Pronto)
    // Importe a lista e o stream

    public List<PedidoCardDTO> listarPedidosAtivos(int idUsuario) {
        List<StatusPedido> statusAtivos = Arrays.asList(
                StatusPedido.PENDENTE,
                StatusPedido.NA_FILA,
                StatusPedido.IMPRIMINDO,
                StatusPedido.PRONTO);

        // Busca no banco
        List<Pedido> pedidos = pedidoRepository.findByUsuario_IdUsuarioAndStatusFilaInOrderByDataHoraDesc(idUsuario,
                statusAtivos);

        // Converte a lista de 'Pedido' para lista de 'PedidoCardDTO'
        return pedidos.stream()
                .map(PedidoCardDTO::new)
                .collect(Collectors.toList());
    }

    // 3. Listar Histórico Completo (Aba "Todos")
    public List<Pedido> listarPedidosHistorico(int idUsuario) {
        List<StatusPedido> statusHistorico = Arrays.asList(
                StatusPedido.CONCLUIDO,
                StatusPedido.CANCELADO);
        return pedidoRepository.findByUsuario_IdUsuarioAndStatusFilaInOrderByDataHoraDesc(idUsuario, statusHistorico);
    }

    // 4. Listar por Status Específico (Abas "Concluídos" ou "Cancelados")
    public List<Pedido> listarPedidosPorStatus(int idUsuario, StatusPedido status) {
        return pedidoRepository.findByUsuario_IdUsuarioAndStatusFilaOrderByDataHoraDesc(idUsuario, status);
    }

    @Transactional
    public Pedido confirmarPedido(PedidoRequestDTO dto) {

        // 1. VERIFICAÇÃO DE SEGURANÇA: O SETOR ESTÁ ABERTO?[cite: 9]
        var config = configuracaoService.obterConfiguracao();
        if (!config.isSetorAberto()) {
            throw new RuntimeException("Gráfica Fechada: " + config.getMensagemAviso());
        }

        // Validação de limite de páginas (mantenha a sua lógica)
        if (dto.getTotalPaginas() > 120) {
            throw new RuntimeException("O limite de 120 páginas foi excedido.");
        }

        // 1. Buscar usuário
        Usuario usuario = usuarioRepository.findById(dto.getIdUsuario())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        // 2. Criar o objeto Pedido
        Pedido novoPedido = new Pedido();
        novoPedido.setUsuario(usuario);
        novoPedido.setDataHora(LocalDateTime.now());
        novoPedido.setStatusFila(StatusPedido.PENDENTE);
        novoPedido.setNomeArquivoOriginal(dto.getNomeArquivo());
        novoPedido.setTamanhoArquivoMb(dto.getTamanhoMb());
        novoPedido.setTotalPaginasArquivo(dto.getTotalPaginas());

        // 3. Simular Upload
        String urlSimulada = "uploads/" + System.currentTimeMillis() + "_"
                + (dto.getNomeArquivo() != null ? dto.getNomeArquivo() : "encadernacao.pdf");
        novoPedido.setArquivoUrl(urlSimulada);

        // 4. Criar Item e calcular valor
        ItemPedido item = new ItemPedido();
        item.setPedido(novoPedido);
        item.setQuantidade(dto.getQuantidade());
        item.setTamanhoPapel(dto.getTamanhoPapel());
        item.setOrientacao(dto.getOrientacao());
        item.setFrenteVerso(dto.getFrenteVerso());
        item.setTipoCor(dto.getTipoCor());
        item.setTipoServico(dto.getTipoServico()); // 👉 Seta o serviço (IMPRESSAO ou ENCADERNACAO)

        // 💰 LÓGICA DE CÁLCULO DINÂMICA
        // 💰 LÓGICA DE CÁLCULO DINÂMICA (SUBSTITUA A ANTIGA POR ESTA)
        double total = 0;

        if (dto.getTipoServico() == com.ufersa.backend_impressoes.model.enuns.CategoriaServico.IMPRESSAO) {
            // Busca ID 1 para P&B ou ID 2 para Colorido[cite: 12]
            double valorUnitario = (dto.getTipoCor() == TipoCor.PRETO_BRANCO)
                    ? buscarPrecoPorId(1)
                    : buscarPrecoPorId(2);

            total = (valorUnitario * dto.getTotalPaginas()) * dto.getQuantidade();

        } else if (dto.getTipoServico() == com.ufersa.backend_impressoes.model.enuns.CategoriaServico.ENCADERNACAO) {
            // Busca ID 3 (Valor Base) e ID 4 (Adicional por folha)
            double valorBase = buscarPrecoPorId(3);
            double adicionalFolha = buscarPrecoPorId(4);

            total = (valorBase + (dto.getTotalPaginas() * adicionalFolha)) * dto.getQuantidade();
        }

        novoPedido.setValorTotal(total);

        // Relacionar item ao pedido
        List<ItemPedido> itens = new ArrayList<>();
        itens.add(item);
        novoPedido.setItens(itens);

        // 5. Salvar o PEDIDO
        Pedido pedidoSalvo = pedidoRepository.save(novoPedido);

        // 6. Salvar o PAGAMENTO
        if (dto.getMetodoPagamento() != null) {
            Pagamento pagamento = new Pagamento();
            pagamento.setPedido(pedidoSalvo);
            pagamento.setMetodo(dto.getMetodoPagamento());
            pagamentoRepository.save(pagamento);
        }

        return pedidoSalvo;
    }

    public void atualizarStatusPedido(int idPedido, StatusPedido novoStatus) {
        Pedido p = pedidoRepository.findById(idPedido).get();
        p.setStatusFila(novoStatus);
        pedidoRepository.save(p);
    }

    public void cancelarPedido(int idPedido) {
        // 1. Busca o pedido ou lança erro se não existir
        Pedido p = pedidoRepository.findById(idPedido)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));

        // 2. Regra de Negócio: Verificar tempo decorrido
        LocalDateTime agora = LocalDateTime.now();
        Duration duracao = Duration.between(p.getDataHora(), agora);

        // Se a diferença for de 5 minutos ou mais, impede o cancelamento
        if (duracao.toMinutes() >= 5) {
            throw new RuntimeException(
                    "O prazo de 5 minutos para cancelamento expirou. O pedido já está em processamento.");
        }

        // 3. Verifica se o pedido já não foi concluído ou cancelado antes
        if (p.getStatusFila() == StatusPedido.CONCLUIDO || p.getStatusFila() == StatusPedido.CANCELADO) {
            throw new RuntimeException("Este pedido não pode mais ser cancelado.");
        }

        // 4. Atualiza o status
        p.setStatusFila(StatusPedido.CANCELADO);
        pedidoRepository.save(p);
    }

    public int obterPosicaoFila(int idPedido) {
        Pedido p = pedidoRepository.findById(idPedido)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));
        return pedidoRepository.contarPedidosNaFrente(p.getDataHora()) + 1;
    }

    // 1. Estimar o tempo de espera (Baseado em 2s por página + 30s de setup)
    public String estimarTempoFila(int idPedido) {
        Pedido p = pedidoRepository.findById(idPedido)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));

        long paginasNaFrente = pedidoRepository.somarPaginasNaFrente(p.getDataHora());
        int pedidosNaFrente = pedidoRepository.contarPedidosNaFrente(p.getDataHora());

        // Fórmula: (Páginas * 2 segundos) + (Pedidos * 30 segundos de setup)
        long totalSegundos = (paginasNaFrente * 2) + (pedidosNaFrente * 30);

        if (totalSegundos < 60)
            return "Menos de 1 minuto";
        return (totalSegundos / 60) + " minutos";
    }

    // 2. Listar Fila Global (Visão do Admin)
    public List<PedidoCardDTO> listarFilaGlobalAdmin() {
        List<StatusPedido> statusAtivos = Arrays.asList(StatusPedido.PENDENTE, StatusPedido.NA_FILA,
                StatusPedido.IMPRIMINDO);
        return pedidoRepository.findByStatusFilaInOrderByDataHoraAsc(statusAtivos)
                .stream().map(PedidoCardDTO::new).collect(Collectors.toList());
    }

    // 3. Chamar o próximo da fila (Admin)[cite: 17]
    @Transactional
    public PedidoCardDTO chamarProximoPedido() {
        List<StatusPedido> statusAguardando = Arrays.asList(StatusPedido.PENDENTE, StatusPedido.NA_FILA);
        Pedido proximo = pedidoRepository.findFirstByStatusFilaInOrderByDataHoraAsc(statusAguardando)
                .orElseThrow(() -> new RuntimeException("Não há pedidos aguardando na fila."));

        proximo.setStatusFila(StatusPedido.IMPRIMINDO);
        return new PedidoCardDTO(pedidoRepository.save(proximo));
    }

    // 4. Concluir Impressão (Admin)[cite: 17]
    @Transactional
    public void concluirImpressao(int idPedido) {
        Pedido p = pedidoRepository.findById(idPedido)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));
        p.setStatusFila(StatusPedido.PRONTO);
        pedidoRepository.save(p);
    }

    // 5. Obter detalhes de um único pedido[cite: 17]
    public PedidoCardDTO obterDetalhesPedido(int idPedido) {
        Pedido p = pedidoRepository.findById(idPedido)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));
        return new PedidoCardDTO(p);
    }

    public NivelOcupacao obterNivelOcupacao() {
        List<StatusPedido> statusAtivos = Arrays.asList(
                StatusPedido.PENDENTE,
                StatusPedido.NA_FILA,
                StatusPedido.IMPRIMINDO);

        long totalPedidos = pedidoRepository.countByStatusFilaIn(statusAtivos);

        if (totalPedidos <= 4) {
            return NivelOcupacao.BAIXA;
        } else if (totalPedidos <= 7) {
            return NivelOcupacao.MODERADA;
        } else {
            return NivelOcupacao.CHEIA;
        }
    }

    // Método consolidado para o Status da Fila[cite: 13, 17]
    public StatusFilaDTO obterStatusFilaGeral() {
        List<StatusPedido> statusAtivos = Arrays.asList(
                StatusPedido.PENDENTE,
                StatusPedido.NA_FILA,
                StatusPedido.IMPRIMINDO);

        // 1. Conta o total de pedidos ativos[cite: 14]
        long totalPedidos = pedidoRepository.countByStatusFilaIn(statusAtivos);

        // 2. Define o nível de ocupação[cite: 13]
        NivelOcupacao nivel = (totalPedidos <= 4) ? NivelOcupacao.BAIXA
                : (totalPedidos <= 7) ? NivelOcupacao.MODERADA : NivelOcupacao.CHEIA;

        // 3. Calcula o tempo estimado do próximo pedido na fila (ou do geral)[cite: 13]
        // Buscamos o primeiro da fila para ter uma base de tempo[cite: 14]
        String tempo = "Vazia";
        Optional<Pedido> proximo = pedidoRepository.findFirstByStatusFilaInOrderByDataHoraAsc(statusAtivos);

        if (proximo.isPresent()) {
            tempo = estimarTempoFila(proximo.get().getIdPedido());
        }

        return new StatusFilaDTO(tempo, nivel, totalPedidos);
    }

    // 👉 ADICIONE ESTE MÉTODO NO FINAL DA CLASSE
    private void dispararNotificacaoStatus(Pedido pedido) {
        String titulo = "";
        String mensagem = "";

        switch (pedido.getStatusFila()) {
            case PENDENTE:
                titulo = "Pedido Recebido";
                mensagem = "Seu pedido #" + pedido.getIdPedido() + " foi recebido e está aguardando análise.";
                break;
            case IMPRIMINDO:
                titulo = "Pedido em Impressão";
                mensagem = "O serviço de " + (pedido
                        .getNomeArquivoOriginal() != null ? "impressão" : "encadernação")
                        + " #" + pedido.getIdPedido() + " começou!";
                break;
            case PRONTO:
                titulo = "Pedido Pronto!";
                mensagem = "Boa notícia! Seu pedido #" + pedido.getIdPedido()
                        + " já está pronto. Pode vir buscar na gráfica.";
                break;
            case CANCELADO:
                titulo = "Pedido Cancelado";
                mensagem = "O pedido #" + pedido.getIdPedido() + " foi cancelado. Se tiver dúvidas, entre em contato.";
                break;
            default:
                return;
        }
        notificacaoService.gerarNotificacao(pedido.getUsuario(), titulo, mensagem); //
    }

    // Adicione este método ao seu PedidoService
    public Map<String, Long> obterEstatisticasGerais() {
        LocalDateTime inicioDoDia = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);

        Map<String, Long> stats = new HashMap<>();

        // 1. Pendentes: PENDENTE + NA_FILA[cite: 10]
        stats.put("pendentes", pedidoRepository.countByStatusFila(StatusPedido.PENDENTE) +
                pedidoRepository.countByStatusFila(StatusPedido.NA_FILA));

        // 2. Em Processamento: IMPRIMINDO[cite: 10]
        stats.put("processando", pedidoRepository.countByStatusFila(StatusPedido.IMPRIMINDO));

        // 3. Concluídos Hoje: PRONTO ou CONCLUIDO[cite: 10]
        stats.put("concluidos", pedidoRepository.countByStatusFilaAndDataHoraAfter(StatusPedido.PRONTO, inicioDoDia));

        // 4. Cancelados Hoje[cite: 10]
        stats.put("cancelados",
                pedidoRepository.countByStatusFilaAndDataHoraAfter(StatusPedido.CANCELADO, inicioDoDia));

        return stats;
    }
}