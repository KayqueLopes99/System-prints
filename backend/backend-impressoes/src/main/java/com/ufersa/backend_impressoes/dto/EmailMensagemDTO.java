package com.ufersa.backend_impressoes.dto;

public class EmailMensagemDTO {
    private String destinatario;
    private String link;

    
    public EmailMensagemDTO() {}

    public EmailMensagemDTO(String destinatario, String link) {
        this.destinatario = destinatario;
        this.link = link;
    }

    public String getDestinatario() { return destinatario; }
    public void setDestinatario(String destinatario) { this.destinatario = destinatario; }
    public String getLink() { return link; }
    public void setLink(String link) { this.link = link; }
}