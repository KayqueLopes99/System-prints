package com.ufersa.backend_impressoes.service;

import com.ufersa.backend_impressoes.dto.EstatisticasPedidoDTO;
import com.ufersa.backend_impressoes.dto.PedidoCardDTO;
import com.ufersa.backend_impressoes.dto.PedidoRequestDTO;
import com.ufersa.backend_impressoes.model.ItemPedido;
import com.ufersa.backend_impressoes.model.Pedido;
import com.ufersa.backend_impressoes.model.Usuario;
import com.ufersa.backend_impressoes.model.enuns.StatusPedido;
import com.ufersa.backend_impressoes.model.enuns.TipoCor;
import com.ufersa.backend_impressoes.repository.PedidoRepository;
import com.ufersa.backend_impressoes.repository.UsuarioRepository;
import com.ufersa.backend_impressoes.model.Pagamento;
import com.ufersa.backend_impressoes.repository.PagamentoRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.transaction.annotation.Transactional;
import java.time.Duration;

@Service
public class PedidoService {

    @Autowired
    private PedidoRepository pedidoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PagamentoRepository pagamentoRepository;

    // Constantes de preço (Poderiam vir do banco futuramente)
    private final double PRECO_PB = 0.15;
    private final double PRECO_COLORIDO = 1.00;

    // Novas constantes para Encadernação
    private final double PRECO_BASE_ENCADERNACAO = 5.00; // Valor da capa + espiral
    private final double PRECO_FOLHA_ENCADERNACAO = 0.15; // R$ 1,50 / 10 folhas

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
        double total = 0;

        if (dto.getTipoServico() == com.ufersa.backend_impressoes.model.enuns.CategoriaServico.IMPRESSAO) {
            // Lógica de Impressão (Preço por página baseado na cor)
            double valorUnitario = (dto.getTipoCor() == TipoCor.PRETO_BRANCO) ? PRECO_PB : PRECO_COLORIDO;
            total = (valorUnitario * dto.getTotalPaginas()) * dto.getQuantidade();
        } else if (dto.getTipoServico() == com.ufersa.backend_impressoes.model.enuns.CategoriaServico.ENCADERNACAO) {
            // Lógica de Encadernação (Preço Base + R$ 0,15 por folha)
            total = (PRECO_BASE_ENCADERNACAO + (dto.getTotalPaginas() * PRECO_FOLHA_ENCADERNACAO))
                    * dto.getQuantidade();
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
}