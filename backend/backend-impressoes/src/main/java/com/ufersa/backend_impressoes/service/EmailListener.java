// package com.ufersa.backend_impressoes.service;

// import com.ufersa.backend_impressoes.config.RabbitMQConfig;
// import com.ufersa.backend_impressoes.dto.EmailMensagemDTO;
// import org.springframework.amqp.rabbit.annotation.RabbitListener;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.mail.SimpleMailMessage;
// import org.springframework.mail.javamail.JavaMailSender;
// import org.springframework.stereotype.Component;

// @Component
// public class EmailListener {

//     @Autowired
//     private JavaMailSender mailSender;

//     @RabbitListener(queues = RabbitMQConfig.FILA_EMAIL)
//     public void escutarFilaDeEmail(EmailMensagemDTO mensagem) {
//         try {
//             System.out.println("Recebido da fila! Processando e-mail para: " + mensagem.getDestinatario());

//             SimpleMailMessage email = new SimpleMailMessage();
//             email.setFrom("kayquephoto@gmail.com");
//             email.setTo(mensagem.getDestinatario());
//             email.setSubject("Recuperação de Senha - Sistema UFERSA");
//             email.setText("Olá!\n\nVocê solicitou a alteração de senha no sistema.\n" +
//                           "Clique no link abaixo para cadastrar uma nova senha:\n\n" + mensagem.getLink() +
//                           "\n\nAtenção: Este link é válido por apenas 30 minutos.");

//             mailSender.send(email);
//             System.out.println("E-mail enviado com sucesso!");

//         } catch (Exception e) {
//             System.err.println("Erro ao tentar enviar o e-mail na fila: " + e.getMessage());
//         }
//     }
// }