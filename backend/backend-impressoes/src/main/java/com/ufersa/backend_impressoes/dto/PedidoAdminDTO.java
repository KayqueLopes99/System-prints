package com.ufersa.backend_impressoes.dto;

import com.ufersa.backend_impressoes.model.Pedido;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class PedidoAdminDTO {
    private int idPedido;
    private String nomeEstudante;
    private String nomeArquivo;
    private String tipoServico;
    private LocalDateTime dataHora;
    private String status;

    public PedidoAdminDTO(Pedido p) {
        this.idPedido = p.getIdPedido();
        // Acessa o objeto Usuario para pegar o nome real
        this.nomeEstudante = (p.getUsuario() != null) ? p.getUsuario().getNomeCompleto() : "Usuário";
        this.nomeArquivo = p.getNomeArquivoOriginal();
        
        // Pega o serviço do primeiro item da lista[cite: 2]
        if (p.getItens() != null && !p.getItens().isEmpty()) {
            this.tipoServico = p.getItens().get(0).getTipoServico().toString();
        } else {
            this.tipoServico = "IMPRESSAO";
        }
        
        this.dataHora = p.getDataHora();
        this.status = p.getStatusFila().toString();
    }
}