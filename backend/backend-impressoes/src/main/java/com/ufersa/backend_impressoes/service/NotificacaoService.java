package com.ufersa.backend_impressoes.service;

import com.ufersa.backend_impressoes.model.Notificacao;
import com.ufersa.backend_impressoes.model.Usuario;
import com.ufersa.backend_impressoes.repository.NotificacaoRepository;
import com.ufersa.backend_impressoes.repository.UsuarioRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificacaoService {

    @Autowired
    private NotificacaoRepository repository;

    @Transactional
    public void gerarNotificacao(Usuario usuario, String titulo, String mensagem) {
        // Verifica se o usuário deseja receber notificações antes de criar
        if (usuario.getPreferenciasNotificacao()) {
            Notificacao n = new Notificacao();
            n.setUsuario(usuario);
            n.setTitulo(titulo);
            n.setMensagem(mensagem);
            n.setLida(false);
            n.setDataHora(LocalDateTime.now());
            repository.save(n);
        }
    }

    public List<Notificacao> buscarPorUsuario(int idUsuario) {
        return repository.findByUsuario_IdUsuarioOrderByDataHoraDesc(idUsuario);
    }

    @Transactional
    public void marcarComoLida(int idNotificacao) {
        Notificacao n = repository.findById(idNotificacao)
                .orElseThrow(() -> new RuntimeException("Notificação não encontrada"));
        n.setLida(true);
        repository.save(n);
    }

    public long buscarTotalNaoLidas(int idUsuario) {
        return repository.countByUsuario_IdUsuarioAndLidaFalse(idUsuario);
    }

    // Adicione o UsuarioRepository nas dependências do Service
    @Autowired
    private UsuarioRepository usuarioRepository;

    @Transactional
    public void cadastrarNotificacaoGeral(String titulo, String mensagem) {
        // 1. Busca todos os usuários cadastrados no sistema
        List<Usuario> todosUsuarios = usuarioRepository.findAll();

        // 2. Percorre a lista e gera a notificação para cada um
        for (Usuario usuario : todosUsuarios) {
            // O método gerarNotificacao já checa se o usuário quer receber
            // (preferenciasNotificacao)
            gerarNotificacao(usuario, titulo, mensagem);
        }
    }
}