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

        // Salvamento dos bytes reais do arquivo
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
    public List<PedidoCardDTO> listarFilaGlobalAdminPedido() {
        List<StatusPedido> statusAtivos = Arrays.asList(StatusPedido.PENDENTE);
        return pedidoRepository.findByStatusFilaInOrderByDataHoraAsc(statusAtivos)
                .stream().map(PedidoCardDTO::new).collect(Collectors.toList());
    }

    // 3. Chamar o próximo da fila (Admin)[cite: 17]
    // Versão apenas para consulta (sem mudar status)
    public PedidoCardDTO verProximoDaFila() {
        // Busca o primeiro que estiver PENDENTE, seguindo a ordem de chegada
        Pedido proximo = pedidoRepository.findFirstByStatusFilaInOrderByDataHoraAsc(
                Arrays.asList(StatusPedido.PENDENTE))
                .orElseThrow(() -> new RuntimeException("Não há pedidos aguardando na fila."));

        return new PedidoCardDTO(proximo);
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
        long totalPedidos = pedidoRepository.countByStatusFila(StatusPedido.PENDENTE);
        if (totalPedidos <= 4)
            return NivelOcupacao.BAIXA;
        if (totalPedidos <= 7)
            return NivelOcupacao.MODERADA;
        return NivelOcupacao.CHEIA;
    }

    // 2. Status da Fila Geral (Badge de Ocupação) atualizado
    public StatusFilaDTO obterStatusFilaGeral() {
        // Considera apenas pedidos PENDENTES como carga de trabalho ativa[cite: 17]
        List<StatusPedido> statusAtivosFila = Arrays.asList(StatusPedido.PENDENTE);

        // Conta o total de pedidos que realmente estão na fila aguardando[cite: 17]
        long totalPedidos = pedidoRepository.countByStatusFilaIn(statusAtivosFila);

        // Define o nível de ocupação baseado na quantidade de pedidos PENDENTES[cite:
        // 17]
        NivelOcupacao nivel = (totalPedidos <= 4) ? NivelOcupacao.BAIXA
                : (totalPedidos <= 7) ? NivelOcupacao.MODERADA : NivelOcupacao.CHEIA;

        // Busca o primeiro pedido da fila para estimar o tempo[cite: 17]
        String tempo = "Vazia";
        Optional<Pedido> proximo = pedidoRepository.findFirstByStatusFilaInOrderByDataHoraAsc(statusAtivosFila);

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
    // 1. Estatísticas Gerais (Cards do Dashboard Admin) atualizadas para os Enums
    // do Banco
    public Map<String, Long> obterEstatisticasGerais() {
        LocalDateTime inicioDoDia = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);

        Map<String, Long> stats = new HashMap<>();

        // Pendentes: Apenas os pedidos que aguardam ação (Status PENDENTE)
        stats.put("pendentes", pedidoRepository.countByStatusFila(StatusPedido.PENDENTE));

        // Em Processamento: Definido como 0 pois o status intermediário foi removido
        stats.put("processando", 0L);

        // Concluídos Hoje: Soma de pedidos que estão prontos para entrega ou já
        // finalizados
        long concluidosHoje = pedidoRepository.countByStatusFilaAndDataHoraAfter(StatusPedido.PRONTO, inicioDoDia) +
                pedidoRepository.countByStatusFilaAndDataHoraAfter(StatusPedido.CONCLUIDO, inicioDoDia);
        stats.put("concluidos", concluidosHoje);

        // Cancelados Hoje[cite: 17]
        stats.put("cancelados",
                pedidoRepository.countByStatusFilaAndDataHoraAfter(StatusPedido.CANCELADO, inicioDoDia));

        return stats;
    }

    public RelatorioDTO gerarRelatorioCompleto() {
        RelatorioDTO relatorio = new RelatorioDTO();

        // 1. RECEITA TOTAL (Mês atual)
        Double receita = pedidoRepository.somarReceitaNoMesAtual();
        relatorio.setReceitaTotalMes(receita != null ? receita : 0.0);

        // 2. TOTAL DE USUÁRIOS (Todos os cadastrados no sistema)
        // Se quiser apenas os que pediram este mês, use contarUsuariosDistintosNoMes()
        relatorio.setUsuariosAtivosMes(usuarioRepository.count());

        // 3. TOTAL DE IMPRESSÕES (Mês atual)
        Long totalImpressoes = pedidoRepository.contarItensPorCategoriaNoMes(
                com.ufersa.backend_impressoes.model.enuns.CategoriaServico.IMPRESSAO);
        relatorio.setTotalImpressoesMes(totalImpressoes != null ? totalImpressoes : 0);

        // 4. TICKET MÉDIO (Corrigido: Receita Mês / Qtd Pedidos Mês)
        long totalPedidosMes = pedidoRepository.countPedidosNoMes();
        relatorio.setTicketMedio(totalPedidosMes > 0 ? relatorio.getReceitaTotalMes() / totalPedidosMes : 0);

        // --- 2. GRÁFICO DE PIZZA (Distribuição por Tipo de Serviço) ---
        List<Object[]> distribuicaoRaw = pedidoRepository.buscarDistribuicaoPorServico();
        Map<String, Double> pizzaData = new HashMap<>();
        for (Object[] row : distribuicaoRaw) {
            // row[0] é o Enum CategoriaServico, row[1] é a Soma (Long)
            pizzaData.put(row[0].toString(), ((Long) row[1]).doubleValue());
        }
        relatorio.setDistribuicaoServicos(pizzaData);

        // --- 3. GRÁFICO DE LINHA (Evolução Mensal) ---
        List<Object[]> evolucaoRaw = pedidoRepository.buscarEvolucaoReceitaMensal();
        Map<String, Double> linhaData = new LinkedHashMap<>(); // LinkedHashMap mantém a ordem dos meses
        String[] mesesNomes = { "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez" };

        for (Object[] row : evolucaoRaw) {
            int mesNumero = (int) row[0]; // Retorna 1 para Janeiro, etc.
            Double valor = (Double) row[1];
            linhaData.put(mesesNomes[mesNumero - 1], valor);
        }
        relatorio.setEvolucaoReceitaMensal(linhaData);

        return relatorio;
    }

    public List<PedidoAdminDTO> listarFilaGlobalAdmin() {
        // Busca apenas os status que fazem parte da fila de trabalho do admin
        List<StatusPedido> statusAtivos = Arrays.asList(
                StatusPedido.PENDENTE,
                StatusPedido.PRONTO);

        return pedidoRepository.findByStatusFilaInOrderByDataHoraAsc(statusAtivos)
                .stream()
                .map(PedidoAdminDTO::new) // Utiliza o construtor da DTO para mapear os dados[cite: 2]
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

        // Se for a tela do estudante (termo e status nulos), filtramos apenas os
        // ativos[cite: 15, 19]
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