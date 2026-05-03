package com.ufersa.backend_impressoes.dto;

import lombok.Data;

@Data
public class UsuarioAtualizacaoDTO {
    private String nomeCompleto;
    private String email;
    private String senha;
    
    private String matricula; 
    private String curso;     
}
