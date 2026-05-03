import React, { useState } from 'react';
import { FiArrowLeft, FiUser, FiMail, FiLock, FiCheckCircle, FiEye, FiEyeOff } from 'react-icons/fi';
import { IoSchoolOutline } from 'react-icons/io5';

import axios from 'axios';
import './Cadastro.css';

export default function Cadastro() {
  const [formData, setFormData] = useState({
    nome: '',
    matricula: '',
    email: '',
    senha: ''
  });

  const [cadastroSucesso, setCadastroSucesso] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  
  // 👉 ESTADOS DE ERRO PARA CADA CAMPO
  const [erroNome, setErroNome] = useState('');
  const [erroEmail, setErroEmail] = useState('');
  const [erroMatricula, setErroMatricula] = useState('');
  const [erroSenha, setErroSenha] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // 👉 VALIDAÇÕES EM TEMPO REAL

    // Validação de Nome (Apenas letras, acentos e espaços)
    if (name === 'nome') {
      // Regex que aceita letras maiúsculas/minúsculas, caracteres acentuados e espaços
      if (value.length > 0 && !/^[a-zA-ZÀ-ÿ\s]+$/.test(value)) {
        setErroNome('O nome deve conter apenas letras e espaços');
      } else {
        setErroNome('');
      }
    }
    
    // Validação de E-mail
    if (name === 'email') {
      if (value.length > 0 && !value.endsWith('@alunos.ufersa.edu.br') && !value.endsWith('@ufersa.edu.br')) {
        setErroEmail('Utilize seu e-mail @alunos.ufersa.edu.br');
      } else {
        setErroEmail(''); 
      }
    }

    // Validação de Matrícula (Exatamente 10 números)
    if (name === 'matricula') {
      if (value.length > 0 && (value.length !== 10 || !/^\d+$/.test(value))) {
        setErroMatricula('A matrícula deve ter exatamente 10 números');
      } else {
        setErroMatricula('');
      }
    }

    // Validação de Senha (Mínimo de 8 caracteres)
    if (name === 'senha') {
      if (value.length > 0 && value.length < 8) {
        setErroSenha('A senha deve ter no mínimo 8 caracteres');
      } else {
        setErroSenha('');
      }
    }
  };

  const handleCadastro = async (e) => {
    e.preventDefault();

    // 👉 O .trim() salva vidas! Ele remove espaços invisíveis no começo e no final.
    const nomeLimpo = formData.nome.trim();
    const emailLimpo = formData.email.trim();
    const matriculaLimpa = formData.matricula.trim();
    const senhaLimpa = formData.senha.trim();

    // 1. Validação Direta do Nome
    if (!nomeLimpo || !/^[a-zA-ZÀ-ÿ\s]+$/.test(nomeLimpo)) {
      alert('Erro no Nome: Verifique se está preenchido e não contém números.');
      return; 
    }

    // 2. Validação Direta do E-mail (agora imune a espaços!)
    if (!emailLimpo.endsWith('@alunos.ufersa.edu.br') && !emailLimpo.endsWith('@ufersa.edu.br')) {
      alert(`Erro no E-mail: O e-mail precisa terminar com @alunos.ufersa.edu.br ou @ufersa.edu.br`);
      return; 
    }

    // 3. Validação Direta da Matrícula
    if (matriculaLimpa.length !== 10 || !/^\d+$/.test(matriculaLimpa)) {
      alert(`Erro na Matrícula: Você digitou ${matriculaLimpa.length} caracteres, mas precisamos de exatamente 10 números.`);
      return; 
    }

    // 4. Validação Direta da Senha
    if (senhaLimpa.length < 8) {
      alert('Erro na Senha: A senha deve ter no mínimo 8 caracteres.');
      return; 
    }

    // Se tudo estiver certo, prepara para enviar ao Java!
// Se tudo estiver certo, prepara para enviar ao Java!
    const dadosParaEnviar = {
      nomeCompleto: nomeLimpo,
      email: emailLimpo,
      senha: senhaLimpa,
      matricula: matriculaLimpa,
      curso: "Não informado",
      tipo_usuario: "ESTUDANTE" // <-- ADICIONE ESTA LINHA
    };

    try {
      await axios.post('http://localhost:8080/api/usuarios/cadastrar/estudante', dadosParaEnviar);

      setCadastroSucesso(true);

      setTimeout(() => {
        window.location.href = '/';
      }, 3000);

    } catch (erro) {
      console.error("Erro completo ao cadastrar:", erro);
      
      let mensagemErro = "Ocorreu um erro inesperado ao conectar com o servidor.";

      // Se o erro veio do back-end (Spring Boot) com uma resposta estruturada
      if (erro.response && erro.response.data) {
          // Verifica se o Spring Boot mandou uma string simples
          if (typeof erro.response.data === 'string') {
              mensagemErro = erro.response.data;
          } 
          // Verifica se é o formato padrão de erro do Spring Boot (JSON com propriedade 'message')
          else if (erro.response.data.message) {
              mensagemErro = erro.response.data.message;
          }
          // Caso seja outro tipo de objeto JSON, tentamos convertê-lo em texto legível
          else {
              mensagemErro = JSON.stringify(erro.response.data);
          }
      } 
      // Se não tem response, pode ser erro de rede (Servidor fora do ar, RabbitMQ caiu etc)
      else if (erro.message) {
          mensagemErro = erro.message;
      }

      alert("Atenção: " + mensagemErro);
    }
  };

  return (
    <main className="tela-container">
      <div className="card-interface">

        {cadastroSucesso ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <FiCheckCircle size={80} color="var(--cor-sucesso, #378C26)" />
            <h2 style={{ color: 'var(--cor-sucesso, #378C26)', margin: 0 }}>Cadastro Confirmado!</h2>
            <p style={{ color: 'var(--text)', fontSize: '1rem' }}>
              Sua conta foi criada com sucesso.<br />
              Redirecionando para o login...
            </p>
          </div>
        ) : (
          <>
            <div className="cabecalho-simples">
              <button className="btn-voltar" onClick={() => window.history.back()} title="Voltar">
                <FiArrowLeft size={24} /> Voltar
              </button>
              <h2>Criar Conta</h2>
            </div>

            <p className="texto-instrucao">
              Preencha os dados para acessar o sistema de impressão.
            </p>

            <form className="formulario" onSubmit={handleCadastro}>
              
              {/* CAMPO DE NOME COM VALIDAÇÃO */}
              <div className="grupo-input">
                <label>Nome Completo</label>
                <div className="input-wrapper">
                  <FiUser className="input-icone" size={20} />
                  <input
                    type="text"
                    name="nome"
                    placeholder="Digite seu nome completo"
                    value={formData.nome}
                    onChange={handleChange}
                    required
                    style={erroNome ? { borderColor: '#d32f2f' } : {}}
                  />
                </div>
                {erroNome && (
                  <span style={{ color: '#d32f2f', fontSize: '0.85rem', marginTop: '2px' }}>
                    {erroNome}
                  </span>
                )}
              </div>

              {/* CAMPO DE MATRÍCULA COM VALIDAÇÃO */}
              <div className="grupo-input">
                <label>Matrícula</label>
                <div className="input-wrapper">
                  <IoSchoolOutline className="input-icone" size={20} />
                  <input
                    type="text"
                    name="matricula"
                    placeholder="Digite os 10 números da matrícula"
                    value={formData.matricula}
                    onChange={handleChange}
                    required
                    maxLength="10" 
                    style={erroMatricula ? { borderColor: '#d32f2f' } : {}}
                  />
                </div>
                {erroMatricula && (
                  <span style={{ color: '#d32f2f', fontSize: '0.85rem', marginTop: '2px' }}>
                    {erroMatricula}
                  </span>
                )}
              </div>

              {/* CAMPO DE E-MAIL COM VALIDAÇÃO */}
              <div className="grupo-input">
                <label>E-mail Institucional</label>
                <div className="input-wrapper">
                  <FiMail className="input-icone" size={20} />
                  <input
                    type="email"
                    name="email"
                    placeholder="exemplo@alunos.ufersa.edu.br"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    style={erroEmail ? { borderColor: '#d32f2f' } : {}}
                  />
                </div>
                {erroEmail && (
                  <span style={{ color: '#d32f2f', fontSize: '0.85rem', marginTop: '2px' }}>
                    {erroEmail}
                  </span>
                )}
              </div>

              {/* CAMPO DE SENHA COM VALIDAÇÃO */}
              <div className="grupo-input">
                <label>Senha</label>
                <div className="input-wrapper">
                  <FiLock className="input-icone" size={20} />
                  <input
                    type={mostrarSenha ? "text" : "password"}
                    name="senha"
                    placeholder="Digite sua senha (mín. 8 caracteres)"
                    value={formData.senha}
                    onChange={handleChange}
                    required
                    style={{ 
                      paddingRight: '40px', 
                      borderColor: erroSenha ? '#d32f2f' : undefined 
                    }}
                  />
                  <button
                    type="button"
                    className="btn-mostrar-senha"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    title={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {mostrarSenha ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                  </button>
                </div>
                {erroSenha && (
                  <span style={{ color: '#d32f2f', fontSize: '0.85rem', marginTop: '2px' }}>
                    {erroSenha}
                  </span>
                )}
              </div>

              <button 
                type="submit" 
                className="btn-primario" 
                style={{ marginTop: '16px' }}
                // Desativa se ALGUM dos 4 campos tiver mensagem de erro
                disabled={erroNome !== '' || erroEmail !== '' || erroMatricula !== '' || erroSenha !== ''}
              >
                Finalizar Cadastro
              </button>
            </form>
          </>
        )}

      </div>
    </main>
  );
}