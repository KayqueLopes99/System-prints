package com.ufersa.backend_impressoes.dto;

import com.ufersa.backend_impressoes.model.Pedido;
import com.ufersa.backend_impressoes.model.ItemPedido;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class PedidoAdminDTO {
    private int idPedido;
    private int idUsuario; // Necessário para o findIndex (Sua Posição)
    private String nomeEstudante;
    private String nomeArquivo;
    private String tipoServico;
    private Integer totalPaginasArquivo; // Necessário para as tags[cite: 15, 17]
    private String detalhesImpressao; // Ex: "A4 • P&B"
    private LocalDateTime dataHora;
    private String status;

    public PedidoAdminDTO(Pedido p) {
        this.idPedido = p.getIdPedido();
        this.idUsuario = (p.getUsuario() != null) ? p.getUsuario().getIdUsuario() : 0;
        this.nomeEstudante = (p.getUsuario() != null) ? p.getUsuario().getNomeCompleto() : "Usuário";
        this.nomeArquivo = p.getNomeArquivoOriginal();
        this.totalPaginasArquivo = p.getTotalPaginasArquivo();
        this.dataHora = p.getDataHora();
        this.status = (p.getStatusFila() != null) ? p.getStatusFila().name() : "PENDENTE";

        if (p.getItens() != null && !p.getItens().isEmpty()) {
            ItemPedido item = p.getItens().get(0);
            this.tipoServico = item.getTipoServico().name();
            
            // Formata detalhes como no PedidoCardDTO[cite: 17]
            String cor = (item.getTipoCor() != null && item.getTipoCor().name().equals("PRETO_BRANCO")) ? "P&B" : "Colorido";
            this.detalhesImpressao = item.getTamanhoPapel() + " • " + cor;
        } else {
            this.tipoServico = "IMPRESSAO";
            this.detalhesImpressao = "A4 • P&B";
        }
    }
}