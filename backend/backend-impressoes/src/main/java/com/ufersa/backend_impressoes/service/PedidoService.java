package com.ufersa.backend_impressoes.service;

import com.ufersa.backend_impressoes.dto.EstatisticasPedidoDTO;
import com.ufersa.backend_impressoes.dto.PedidoAdminDTO;
import com.ufersa.backend_impressoes.dto.PedidoCardDTO;
import com.ufersa.backend_impressoes.dto.PedidoRequestDTO;
import com.ufersa.backend_impressoes.dto.RelatorioDTO;
import com.ufersa.backend_impressoes.dto.StatusFilaDTO;
import com.ufersa.backend_impressoes.model.ItemPedido;
import com.ufersa.backend_impressoes.model.Pedido;
import com.ufersa.backend_impressoes.model.Servico;
import com.ufersa.backend_impressoes.model.Usuario;
import com.ufersa.backend_impressoes.model.enuns.NivelOcupacao;
import com.ufersa.backend_impressoes.model.enuns.StatusPedido;
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
import java.util.LinkedHashMap;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
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

    @Autowired
    private ServicoRepository servicoRepository;

    @Autowired
    private ConfiguracaoService configuracaoService;

    private Double buscarPrecoPorId(Integer id) {
        return servicoRepository.findById(id)
                .map(Servico::getPrecoUnitario)
                .orElseThrow(() -> new RuntimeException("Preço ID " + id + " não configurado no banco!"));
    }

    public EstatisticasPedidoDTO obterEstatisticasUsuario(int idUsuario) {
        long pedidos = pedidoRepository.contarPedidosPorUsuario(idUsuario);
        long paginas = pedidoRepository.somarPaginasPorUsuario(idUsuario);
        double gasto = pedidoRepository.somarGastoPorUsuario(idUsuario);

        return new EstatisticasPedidoDTO(pedidos, paginas, gasto);
    }

    public List<PedidoCardDTO> listarPedidosAtivos(int idUsuario) {
        List<StatusPedido> statusAtivos = Arrays.asList(
                StatusPedido.PENDENTE,
                StatusPedido.PRONTO);

        List<Pedido> pedidos = pedidoRepository.findByUsuario_IdUsuarioAndStatusFilaInOrderByDataHoraDesc(idUsuario,
                statusAtivos);

        return pedidos.stream()
                .map(PedidoCardDTO::new)
                .collect(Collectors.toList());
    }

    public List<PedidoCardDTO> listarPedidosHistorico(int idUsuario) {
        List<StatusPedido> statusHistorico = Arrays.asList(
                StatusPedido.CONCLUIDO,
                StatusPedido.CANCELADO);

        return pedidoRepository.findByUsuario_IdUsuarioAndStatusFilaInOrderByDataHoraDesc(idUsuario, statusHistorico)
                .stream()
                .map(PedidoCardDTO::new)
                .collect(Collectors.toList());
    }

    public List<PedidoCardDTO> listarPedidosPorStatus(int idUsuario, StatusPedido status) {
        return pedidoRepository.findByUsuario_IdUsuarioAndStatusFilaOrderByDataHoraDesc(idUsuario, status)
                .stream()
                .map(PedidoCardDTO::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public Pedido confirmarPedido(PedidoRequestDTO dto, MultipartFile arquivoReal) throws IOException {

        var config = configuracaoService.obterConfiguracao();
        if (!config.isSetorAberto()) {
            throw new RuntimeException("Gráfica Fechada: " + config.getMensagemAviso());
        }

        if (dto.getTotalPaginas() > 120) {
            throw new RuntimeException("O limite de 120 páginas foi excedido.");
        }

        Usuario usuario = usuarioRepository.findById(dto.getIdUsuario())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        Pedido novoPedido = new Pedido();
        novoPedido.setUsuario(usuario);
        novoPedido.setDataHora(LocalDateTime.now());
        novoPedido.setStatusFila(StatusPedido.PENDENTE);

        novoPedido.setDadosArquivo(arquivoReal.getBytes());
        novoPedido.setNomeArquivoOriginal(arquivoReal.getOriginalFilename());
        novoPedido.setTamanhoArquivoMb((double) arquivoReal.getSize() / (1024 * 1024));
        novoPedido.setTotalPaginasArquivo(dto.getTotalPaginas());

        ItemPedido item = new ItemPedido();
        item.setPedido(novoPedido);
        item.setQuantidade(dto.getQuantidade());
        item.setTamanhoPapel(dto.getTamanhoPapel());
        item.setOrientacao(dto.getOrientacao());
        item.setFrenteVerso(dto.getFrenteVerso());
        item.setTipoCor(dto.getTipoCor());
        item.setTipoServico(dto.getTipoServico());

        double total = 0;
        if (dto.getTipoServico() == com.ufersa.backend_impressoes.model.enuns.CategoriaServico.IMPRESSAO) {
            double valorUnitario = (dto.getTipoCor() == com.ufersa.backend_impressoes.model.enuns.TipoCor.PRETO_BRANCO)
                    ? buscarPrecoPorId(1)
                    : buscarPrecoPorId(2);
            total = (valorUnitario * dto.getTotalPaginas()) * dto.getQuantidade();
        } else {
            double valorBase = buscarPrecoPorId(3);
            double adicionalFolha = buscarPrecoPorId(4);
            total = (valorBase + (dto.getTotalPaginas() * adicionalFolha)) * dto.getQuantidade();
        }

        novoPedido.setValorTotal(total);
        List<ItemPedido> itens = new ArrayList<>();
        itens.add(item);
        novoPedido.setItens(itens);

        Pedido pedidoSalvo = pedidoRepository.save(novoPedido);

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

        dispararNotificacaoStatus(p);
    }

    public void cancelarPedido(int idPedido) {
        Pedido p = pedidoRepository.findById(idPedido)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));

        LocalDateTime agora = LocalDateTime.now();
        Duration duracao = Duration.between(p.getDataHora(), agora);

        if (duracao.toMinutes() >= 5) {
            throw new RuntimeException(
                    "O prazo de 5 minutos para cancelamento expirou. O pedido já está em processamento.");
        }

        if (p.getStatusFila() == StatusPedido.CONCLUIDO || p.getStatusFila() == StatusPedido.CANCELADO) {
            throw new RuntimeException("Este pedido não pode mais ser cancelado.");
        }

        p.setStatusFila(StatusPedido.CANCELADO);
        pedidoRepository.save(p);
    }

    public int obterPosicaoFila(int idPedido) {
        Pedido p = pedidoRepository.findById(idPedido)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));
        return pedidoRepository.contarPedidosNaFrente(p.getDataHora()) + 1;
    }

    public String estimarTempoFila(int idPedido) {
        Pedido p = pedidoRepository.findById(idPedido)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));

        long paginasNaFrente = pedidoRepository.somarPaginasNaFrente(p.getDataHora());
        int pedidosNaFrente = pedidoRepository.contarPedidosNaFrente(p.getDataHora());

        long totalSegundos = (paginasNaFrente * 2) + (pedidosNaFrente * 30);

        if (totalSegundos < 60)
            return "Menos de 1 minuto";
        return (totalSegundos / 60) + " minutos";
    }

    public List<PedidoCardDTO> listarFilaGlobalAdminPedido() {
        List<StatusPedido> statusAtivos = Arrays.asList(StatusPedido.PENDENTE);
        return pedidoRepository.findByStatusFilaInOrderByDataHoraAsc(statusAtivos)
                .stream().map(PedidoCardDTO::new).collect(Collectors.toList());
    }

    public PedidoCardDTO verProximoDaFila() {
        Pedido proximo = pedidoRepository.findFirstByStatusFilaInOrderByDataHoraAsc(
                Arrays.asList(StatusPedido.PENDENTE))
                .orElseThrow(() -> new RuntimeException("Não há pedidos aguardando na fila."));

        return new PedidoCardDTO(proximo);
    }

    @Transactional
    public void concluirImpressao(int idPedido) {
        Pedido p = pedidoRepository.findById(idPedido)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));
        p.setStatusFila(StatusPedido.PRONTO);
        pedidoRepository.save(p);
    }

    public PedidoCardDTO obterDetalhesPedido(int idPedido) {
        Pedido p = pedidoRepository.findById(idPedido)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));
        return new PedidoCardDTO(p);
    }

    public NivelOcupacao obterNivelOcupacao() {
        long totalPedidos = pedidoRepository.countByStatusFila(StatusPedido.PENDENTE);
        if (totalPedidos <= 4)
            return NivelOcupacao.BAIXA;
        if (totalPedidos <= 7)
            return NivelOcupacao.MODERADA;
        return NivelOcupacao.CHEIA;
    }

    public StatusFilaDTO obterStatusFilaGeral() {
        List<StatusPedido> statusAtivosFila = Arrays.asList(StatusPedido.PENDENTE);

        long totalPedidos = pedidoRepository.countByStatusFilaIn(statusAtivosFila);

        NivelOcupacao nivel = (totalPedidos <= 4) ? NivelOcupacao.BAIXA
                : (totalPedidos <= 7) ? NivelOcupacao.MODERADA : NivelOcupacao.CHEIA;

        String tempo = "Vazia";
        Optional<Pedido> proximo = pedidoRepository.findFirstByStatusFilaInOrderByDataHoraAsc(statusAtivosFila);

        if (proximo.isPresent()) {
            tempo = estimarTempoFila(proximo.get().getIdPedido());
        }

        return new StatusFilaDTO(tempo, nivel, totalPedidos);
    }

    private void dispararNotificacaoStatus(Pedido pedido) {
        String titulo = "";
        String mensagem = "";

        switch (pedido.getStatusFila()) {
            case PENDENTE:
                titulo = "Pedido Recebido";
                mensagem = "Seu pedido #" + pedido.getIdPedido() + " foi recebido e está aguardando análise.";
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

            case CONCLUIDO:
                titulo = "Pedido Concluído";
                mensagem = "Seu pedido #" + pedido.getIdPedido() + " foi concluído. Agradecemos pela preferência!";
                break;
            default:
                return;
        }
        notificacaoService.gerarNotificacao(pedido.getUsuario(), titulo, mensagem); //
    }

    public Map<String, Long> obterEstatisticasGerais() {
        LocalDateTime inicioDoDia = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);

        Map<String, Long> stats = new HashMap<>();

        stats.put("pendentes", pedidoRepository.countByStatusFila(StatusPedido.PENDENTE));

        stats.put("processando", 0L);

        long concluidosHoje = pedidoRepository.countByStatusFilaAndDataHoraAfter(StatusPedido.PRONTO, inicioDoDia) +
                pedidoRepository.countByStatusFilaAndDataHoraAfter(StatusPedido.CONCLUIDO, inicioDoDia);
        stats.put("concluidos", concluidosHoje);

        stats.put("cancelados",
                pedidoRepository.countByStatusFilaAndDataHoraAfter(StatusPedido.CANCELADO, inicioDoDia));

        return stats;
    }

    public RelatorioDTO gerarRelatorioCompleto() {
        RelatorioDTO relatorio = new RelatorioDTO();

        Double receita = pedidoRepository.somarReceitaNoMesAtual();
        relatorio.setReceitaTotalMes(receita != null ? receita : 0.0);

        relatorio.setUsuariosAtivosMes(usuarioRepository.count());

        Long totalImpressoes = pedidoRepository.contarItensPorCategoriaNoMes(
                com.ufersa.backend_impressoes.model.enuns.CategoriaServico.IMPRESSAO);
        relatorio.setTotalImpressoesMes(totalImpressoes != null ? totalImpressoes : 0);

        long totalPedidosMes = pedidoRepository.countPedidosNoMes();
        relatorio.setTicketMedio(totalPedidosMes > 0 ? relatorio.getReceitaTotalMes() / totalPedidosMes : 0);

        List<Object[]> distribuicaoRaw = pedidoRepository.buscarDistribuicaoPorServico();
        Map<String, Double> pizzaData = new HashMap<>();
        for (Object[] row : distribuicaoRaw) {
            pizzaData.put(row[0].toString(), ((Long) row[1]).doubleValue());
        }
        relatorio.setDistribuicaoServicos(pizzaData);

        List<Object[]> evolucaoRaw = pedidoRepository.buscarEvolucaoReceitaMensal();
        Map<String, Double> linhaData = new LinkedHashMap<>();
        String[] mesesNomes = { "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez" };

        for (Object[] row : evolucaoRaw) {
            int mesNumero = (int) row[0];
            Double valor = (Double) row[1];
            linhaData.put(mesesNomes[mesNumero - 1], valor);
        }
        relatorio.setEvolucaoReceitaMensal(linhaData);

        return relatorio;
    }

    public List<PedidoAdminDTO> listarFilaGlobalAdmin() {
        List<StatusPedido> statusAtivos = Arrays.asList(
                StatusPedido.PENDENTE,
                StatusPedido.PRONTO);

        return pedidoRepository.findByStatusFilaInOrderByDataHoraAsc(statusAtivos)
                .stream()
                .map(PedidoAdminDTO::new)
                .collect(Collectors.toList());
    }

    public List<PedidoAdminDTO> buscarFilaAdminFiltrada(String termo, String statusStr) {
        StatusPedido status = null;

        if (statusStr != null && !statusStr.equalsIgnoreCase("TODOS")) {
            try {
                status = StatusPedido.valueOf(statusStr.toUpperCase());
            } catch (Exception e) {
                status = null;
            }
        }

        if (termo == null && status == null) {
            return pedidoRepository.findByStatusFilaInOrderByDataHoraAsc(
                    Arrays.asList(StatusPedido.PENDENTE, StatusPedido.PRONTO))
                    .stream()
                    .map(PedidoAdminDTO::new)
                    .collect(Collectors.toList());
        }

        return pedidoRepository.buscarFilaComFiltros(termo, status)
                .stream()
                .map(PedidoAdminDTO::new)
                .collect(Collectors.toList());
    }
}