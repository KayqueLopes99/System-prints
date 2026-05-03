package com.ufersa.backend_impressoes.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.ufersa.backend_impressoes.model.Pedido;
import com.ufersa.backend_impressoes.model.ItemPedido;
import com.ufersa.backend_impressoes.model.enuns.CategoriaServico;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PedidoCardDTO {
    private int idPedido;
    private LocalDateTime dataHora;
    private String nomeArquivoOriginal;
    private String statusFila;
    private Integer totalPaginasArquivo;
    private Double valorTotal;
    private int idUsuario;
    private CategoriaServico tipoServico;
    private String detalhesImpressao;
    private String nomeEstudante;

    public PedidoCardDTO(Pedido pedido) {
        this.idPedido = pedido.getIdPedido();
        this.idUsuario = pedido.getUsuario().getIdUsuario();
        this.nomeEstudante = pedido.getUsuario().getNomeCompleto();
        this.dataHora = pedido.getDataHora();
        this.nomeArquivoOriginal = pedido.getNomeArquivoOriginal();
        this.statusFila = pedido.getStatusFila().name();
        this.totalPaginasArquivo = pedido.getTotalPaginasArquivo();
        this.valorTotal = pedido.getValorTotal();

        if (pedido.getItens() != null && !pedido.getItens().isEmpty()) {
            ItemPedido item = pedido.getItens().get(0);
            this.tipoServico = item.getTipoServico();
            String cor = (item.getTipoCor() != null && item.getTipoCor().name().equals("PRETO_BRANCO")) ? "P&B"
                    : "Colorido";
            String frenteVerso = (item.getFrenteVerso() != null && item.getFrenteVerso()) ? "Frente e Verso"
                    : "Apenas Frente";
            this.detalhesImpressao = item.getTamanhoPapel() + " • " + cor + " • " + frenteVerso;
        } else {
            this.detalhesImpressao = "Configurações não informadas";
            this.tipoServico = CategoriaServico.IMPRESSAO;
        }
    }
}