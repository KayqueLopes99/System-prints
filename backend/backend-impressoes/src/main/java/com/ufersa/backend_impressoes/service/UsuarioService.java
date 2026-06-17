package com.ufersa.backend_impressoes.service;

// import com.ufersa.backend_impressoes.config.RabbitMQConfig;
// import com.ufersa.backend_impressoes.dto.EmailMensagemDTO;
import com.ufersa.backend_impressoes.dto.UsuarioAtualizacaoDTO;
import com.ufersa.backend_impressoes.model.Administrador;
import com.ufersa.backend_impressoes.model.Estudante;
import com.ufersa.backend_impressoes.model.Usuario;
import com.ufersa.backend_impressoes.repository.UsuarioRepository;
// import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
// import java.util.UUID;
import java.util.List;


@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    // @Autowired
    // private RabbitTemplate rabbitTemplate;

    public Usuario autenticarUsuario(String login, String senhaDigitada) {
        Optional<Usuario> usuarioNoBanco = usuarioRepository.findByEmailOrMatricula(login);

        if (usuarioNoBanco.isPresent() && usuarioNoBanco.get().getSenha().equals(senhaDigitada)) {
            return usuarioNoBanco.get();
        }
        throw new RuntimeException("E-mail/Matrícula ou senha incorretos.");
    }

    // public void recuperarSenha(String email) {
    //     Optional<Usuario> usuarioOptional = usuarioRepository.findByEmail(email);

    //     if (usuarioOptional.isPresent()) {
    //         Usuario usuario = usuarioOptional.get();
    //         String codigo = UUID.randomUUID().toString();

    //         usuario.setCodigoRecuperacao(codigo);
    //         usuario.setDataExpiracao(LocalDateTime.now().plusMinutes(30));
    //         usuarioRepository.save(usuario);

    //         String link = "http://localhost:5173/AtualizarSenha?id=" + codigo;
    //         EmailMensagemDTO mensagemEmail = new EmailMensagemDTO(usuario.getEmail(), link);
    //         rabbitTemplate.convertAndSend(RabbitMQConfig.FILA_EMAIL, mensagemEmail);
    //     } else {
    //         throw new RuntimeException("E-mail não encontrado no sistema.");
    //     }
    // }

    public void alterarSenha(String codigo, String novaSenha) {
        Optional<Usuario> usuarioOptional = usuarioRepository.findByCodigoRecuperacao(codigo);

        if (usuarioOptional.isPresent()) {
            Usuario usuario = usuarioOptional.get();

            if (usuario.getDataExpiracao().isBefore(LocalDateTime.now())) {
                throw new RuntimeException("Este link de recuperação expirou.");
            }

            usuario.setSenha(novaSenha);
            usuario.setCodigoRecuperacao(null);
            usuario.setDataExpiracao(null);
            usuarioRepository.save(usuario);
        } else {
            throw new RuntimeException("Link de recuperação inválido.");
        }
    }

    public Usuario cadastrarUsuario(Usuario novoUsuario) {
        if (usuarioRepository.findByEmail(novoUsuario.getEmail()).isPresent()) {
            throw new RuntimeException("Erro: Este e-mail já está em uso!");
        }
        return usuarioRepository.save(novoUsuario);
    }

    public Usuario visualizarPerfil(int idUsuario) {
        return usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Utilizador não encontrado."));
    }

    public Usuario atualizarPerfil(int idUsuario, UsuarioAtualizacaoDTO dto) {
        Usuario usuarioExistente = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Utilizador não encontrado."));

        if (dto.getNomeCompleto() != null) usuarioExistente.setNomeCompleto(dto.getNomeCompleto());
        if (dto.getEmail() != null) usuarioExistente.setEmail(dto.getEmail());

        if (dto.getSenha() != null && !dto.getSenha().trim().isEmpty()) {
            usuarioExistente.setSenha(dto.getSenha());
        }

        
        if (usuarioExistente instanceof Estudante) {
            Estudante estudante = (Estudante) usuarioExistente;
            
            if (dto.getMatricula() != null) estudante.setMatricula(dto.getMatricula());
            if (dto.getCurso() != null) estudante.setCurso(dto.getCurso());
            
            return usuarioRepository.save(estudante); 
        }

        return usuarioRepository.save(usuarioExistente);
    }


    public Administrador cadastrarAdministradorInterno(String nome, String email, String senha, String cargo) {
        Administrador admin = new Administrador();
        admin.setNomeCompleto(nome);
        admin.setEmail(email);
        admin.setSenha(senha); 
        admin.setCargoSetor(cargo);
        
        return usuarioRepository.save(admin);
    }


    public List<Usuario> listarTodos() {
        return usuarioRepository.findAll();
    }

    public List<Usuario> buscarPorNome(String nome) {
        return usuarioRepository.findByNomeCompletoContainingIgnoreCase(nome);
    }
}