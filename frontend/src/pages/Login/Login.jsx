import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
// 👉 Adicionamos o FiAlertCircle para o aviso de erro
import { FiPrinter, FiUser, FiLock, FiEye, FiEyeOff, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const [exibirSucesso, setExibirSucesso] = useState(false);
  // 👉 NOVO ESTADO: Controla a mensagem de erro na tela
  const [erroAviso, setErroAviso] = useState('');

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErroAviso(''); // Limpa o erro anterior ao tentar logar de novo

    try {
      const resposta = await axios.post('http://localhost:8080/api/usuarios/login', {
        email: email.trim(),
        senha: senha.trim()
      });

      console.log("Usuário autenticado:", resposta.data);

      // SALVE O OBJETO INTEIRO PARA O PERFIL USAR
      localStorage.setItem('usuarioLogado', JSON.stringify(resposta.data));
      // Mantém o ID se já usar em outros lugares
      localStorage.setItem('usuarioId', resposta.data.idUsuario);
      setExibirSucesso(true);

      // 1. Pega o campo que agora o Java vai enviar corretamente
      const tipo = resposta.data.tipo_usuario;

      // 2. Define o destino
      const destino = tipo === 'ADMINISTRADOR' ? '/admin' : '/estudante';

      console.log("Tipo do usuário logado:", tipo);
      console.log("Indo para:", destino);

      // 3. REMOVA as aspas e use a variável 'destino' aqui!
      setTimeout(() => {
        navigate(destino); // 👉 Sem aspas, para usar a variável!
      }, 2000);
    } catch (erro) {
      console.error("Erro no login:", erro);

      // Tratamento inteligente da mensagem de erro (igual fizemos no cadastro)
      let textoErro = "E-mail/Matrícula ou senha incorretos.";
      if (erro.response && erro.response.data) {
        if (typeof erro.response.data === 'string') {
          textoErro = erro.response.data;
        } else if (erro.response.data.message) {
          textoErro = erro.response.data.message;
        }
      } else if (erro.message) {
        textoErro = "Erro de conexão com o servidor.";
      }

      // 👉 Em vez de alert(), salvamos no estado para aparecer na tela!
      setErroAviso(textoErro);
    }
  };

  return (
    <main className="tela-container">
      <div className="card-interface">

        {exibirSucesso ? (
          /* --- TELA DE SUCESSO COM ANIMAÇÃO --- */
          <div className="container-sucesso">
            <FiCheckCircle className="icone-sucesso-animado" size={80} color="#378C26" />
            <h2 style={{ color: '#378C26', marginTop: '15px' }}>Login com Sucesso!</h2>
            <p style={{ color: '#666', marginTop: '5px' }}>Redirecionando...</p>
          </div>
        ) : (
          /* --- TELA DE FORMULÁRIO PADRÃO --- */
          <>
            <div className="logo-container">
              <div className="logo-circulo">
                <FiPrinter size={40} color="#ffffff" />
              </div>
              <h1>Xerox UFERSA</h1>
            </div>

            <div className="boas-vindas">
              <h2>Bem-vindo(a) estudante</h2>
              <p>Digite seu acesso</p>
            </div>

            {/* 👉 AVISO DE ERRO NA TELA (Renderiza apenas se erroAviso não for vazio) */}
            {erroAviso && (
              <div style={{
                backgroundColor: '#ffebee',
                color: '#c62828',
                padding: '12px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '20px',
                border: '1px solid #ef9a9a',
                fontSize: '0.9rem',
                fontWeight: '500'
              }}>
                <FiAlertCircle size={24} />
                <span>{erroAviso}</span>
              </div>
            )}

            <form className="formulario" onSubmit={handleLogin}>
              <div className="grupo-input">
                <label>E-mail ou Matrícula</label>
                <div className="input-wrapper">
                  <FiUser className="input-icone" size={20} />
                  <input
                    type="text"
                    placeholder="Informe sua matrícula ou e-mail"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErroAviso(''); // 👉 Limpa o erro se o usuário começar a digitar de novo
                    }}
                    required
                  />
                </div>
              </div>

              <div className="grupo-input">
                <label>Senha</label>
                <div className="input-wrapper">
                  <FiLock className="input-icone" size={20} />
                  <input
                    type={mostrarSenha ? "text" : "password"}
                    placeholder="Digite sua senha"
                    value={senha}
                    onChange={(e) => {
                      setSenha(e.target.value);
                      setErroAviso(''); // 👉 Limpa o erro se o usuário começar a digitar de novo
                    }}
                    required
                    style={{ paddingRight: '40px' }}
                  />
                  <button
                    type="button"
                    className="btn-mostrar-senha"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                  >
                    {mostrarSenha ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                  </button>
                </div>
              </div>

              <div className="opcoes-extras">
                <label className="checkbox-label">
                  <input type="checkbox" /> Lembrar de mim
                </label>
                <a href="/recuperar-senha" className="link-destaque">Esqueci a senha</a>
              </div>

              <button type="submit" className="btn-primario">ENTRAR</button>
            </form>

            <p className="rodape-link">
              Não tem uma conta? <a href="/cadastro" className="link-destaque">Cadastre-se</a>
            </p>
          </>
        )}

      </div>
    </main>
  );
}

