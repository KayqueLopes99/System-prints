package com.ufersa.backend_impressoes.service;

import com.ufersa.backend_impressoes.config.RabbitMQConfig;
import com.ufersa.backend_impressoes.dto.EmailMensagemDTO;
import com.ufersa.backend_impressoes.dto.UsuarioAtualizacaoDTO;
import com.ufersa.backend_impressoes.model.Administrador;
import com.ufersa.backend_impressoes.model.Estudante;
import com.ufersa.backend_impressoes.model.Usuario;
import com.ufersa.backend_impressoes.repository.UsuarioRepository;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;
import java.util.List;


@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private RabbitTemplate rabbitTemplate;

    // 1. Autenticação (E-mail ou Matrícula)
    public Usuario autenticarUsuario(String login, String senhaDigitada) {
        Optional<Usuario> usuarioNoBanco = usuarioRepository.findByEmailOrMatricula(login);

        if (usuarioNoBanco.isPresent() && usuarioNoBanco.get().getSenha().equals(senhaDigitada)) {
            return usuarioNoBanco.get();
        }
        throw new RuntimeException("E-mail/Matrícula ou senha incorretos.");
    }

    // 2. Recuperação de Senha via RabbitMQ
    public void recuperarSenha(String email) {
        Optional<Usuario> usuarioOptional = usuarioRepository.findByEmail(email);

        if (usuarioOptional.isPresent()) {
            Usuario usuario = usuarioOptional.get();
            String codigo = UUID.randomUUID().toString();

            usuario.setCodigoRecuperacao(codigo);
            usuario.setDataExpiracao(LocalDateTime.now().plusMinutes(30));
            usuarioRepository.save(usuario);

            String link = "http://localhost:5173/AtualizarSenha?id=" + codigo;
            EmailMensagemDTO mensagemEmail = new EmailMensagemDTO(usuario.getEmail(), link);
            rabbitTemplate.convertAndSend(RabbitMQConfig.FILA_EMAIL, mensagemEmail);
        } else {
            throw new RuntimeException("E-mail não encontrado no sistema.");
        }
    }

    // 3. Alteração de Senha (via link de e-mail)
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

    // 4. Cadastro Inicial
    public Usuario cadastrarUsuario(Usuario novoUsuario) {
        if (usuarioRepository.findByEmail(novoUsuario.getEmail()).isPresent()) {
            throw new RuntimeException("Erro: Este e-mail já está em uso!");
        }
        return usuarioRepository.save(novoUsuario);
    }

    // 5. Visualizar Perfil
    public Usuario visualizarPerfil(int idUsuario) {
        return usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Utilizador não encontrado."));
    }

    // 6. Atualizar Perfil (Lidando com Herança de Estudante)
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


    // 1. Cadastrar Administrador Interno[cite: 19]
    public Administrador cadastrarAdministradorInterno(String nome, String email, String senha, String cargo) {
        Administrador admin = new Administrador();
        admin.setNomeCompleto(nome);
        admin.setEmail(email);
        admin.setSenha(senha); // Lembre-se de criptografar a senha futuramente
        admin.setCargoSetor(cargo);
        
        return usuarioRepository.save(admin);
    }

    // 2. Listar todos os usuários
    public List<Usuario> listarTodos() {
        return usuarioRepository.findAll();
    }

    // 3. Buscar usuários por nome
    public List<Usuario> buscarPorNome(String nome) {
        return usuarioRepository.findByNomeCompletoContainingIgnoreCase(nome);
    }
}