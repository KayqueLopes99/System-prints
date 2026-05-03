package com.ufersa.backend_impressoes.controller;

import com.ufersa.backend_impressoes.model.Usuario;
import com.ufersa.backend_impressoes.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.ufersa.backend_impressoes.model.Administrador;
import com.ufersa.backend_impressoes.model.Estudante;

import java.util.Map;
import com.ufersa.backend_impressoes.dto.UsuarioAtualizacaoDTO;
@RestController 
@RequestMapping("/api/usuarios") 
@CrossOrigin(origins = "*")

public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> dadosLogin) {
        try {
            String login = dadosLogin.get("email"); 
            String senha = dadosLogin.get("senha");
            
            Usuario usuarioLogado = usuarioService.autenticarUsuario(login, senha);
            return ResponseEntity.ok(usuarioLogado); 
            
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage()); 
        }
    }

    @PostMapping("/recuperar-senha")
    public ResponseEntity<?> recuperarSenha(@RequestBody Map<String, String> dados) {
        try {
            String email = dados.get("email");

            usuarioService.recuperarSenha(email);

            return ResponseEntity.ok("E-mail de recuperação enviado com sucesso! Verifique sua caixa de entrada.");

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/alterar-senha")
    public ResponseEntity<?> alterarSenha(@RequestBody Map<String, String> dados) {
        try {
            String email = dados.get("email");
            String novaSenha = dados.get("novaSenha");

            usuarioService.alterarSenha(email, novaSenha);
            return ResponseEntity.ok("Senha alterada com sucesso!");

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/cadastrar/estudante")
    public ResponseEntity<?> cadastrarEstudante(@RequestBody Estudante estudante) {
        try {
            Usuario usuarioSalvo = usuarioService.cadastrarUsuario(estudante);
            return ResponseEntity.ok(usuarioSalvo);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/cadastrar/administrador")
    public ResponseEntity<?> cadastrarAdministrador(@RequestBody Administrador administrador) {
        try {
            Usuario usuarioSalvo = usuarioService.cadastrarUsuario(administrador);
            return ResponseEntity.ok(usuarioSalvo);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> visualizarPerfil(@PathVariable int id) {
        try {
            Usuario usuario = usuarioService.visualizarPerfil(id);
            return ResponseEntity.ok(usuario);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> atualizarPerfil(@PathVariable int id, @RequestBody UsuarioAtualizacaoDTO dto) {
        try {
            Usuario usuarioAtualizado = usuarioService.atualizarPerfil(id, dto);
            return ResponseEntity.ok(usuarioAtualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    

    
}