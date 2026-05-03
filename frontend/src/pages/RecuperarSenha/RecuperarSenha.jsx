import React, { useState } from 'react';
import axios from 'axios'; // Não esqueça de instalar: npm install axios
import { FiArrowLeft, FiMail } from 'react-icons/fi';
import { MdVpnKey } from 'react-icons/md'; 
import './RecuperarSenha.css';

export default function RecuperarSenha() {
  const [email, setEmail] = useState('');
  const [erroEmail, setErroEmail] = useState('');
  
  // 👉 NOVOS ESTADOS PARA FEEDBACK
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  const [erroServidor, setErroServidor] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleChangeEmail = (e) => {
    const value = e.target.value;
    setEmail(value);
    
    // Limpa avisos de erro/sucesso enquanto o usuário digita novamente
    setErroServidor('');
    setMensagemSucesso('');

    if (value.length > 0) {
      if (!value.endsWith('@alunos.ufersa.edu.br') && !value.endsWith('@ufersa.edu.br')) {
        setErroEmail('Utilize seu e-mail institucional (@alunos.ufersa.edu.br ou @ufersa.edu.br)');
      } else {
        setErroEmail(''); 
      }
    } else {
      setErroEmail('');
    }
  };

  const handleRecuperar = async (e) => {
    e.preventDefault();
    
    // Reset de mensagens antes de tentar
    setErroServidor('');
    setMensagemSucesso('');

    if (erroEmail || email === '') return;

    setCarregando(true);

    try {
      // Chamada para o seu Back-end
      await axios.post('http://localhost:8080/api/usuarios/recuperar-senha', { email });
      
      setMensagemSucesso('Link enviado! Verifique sua caixa de entrada e spam.');
      
      // Redireciona para o login após um tempo para o usuário ler a mensagem
      setTimeout(() => {
        window.location.href = '/';
      }, 4000);

    } catch (erro) {
      console.error("Erro ao solicitar recuperação:", erro);
      
      // Tratamento de erro específico
      if (erro.response && erro.response.status === 404) {
        setErroEmail('E-mail não encontrado em nossa base de dados.');
      } else {
        setErroServidor('Falha na conexão com o servidor. Tente mais tarde.');
      }
    } finally {
      setCarregando(false);
    }
  };

  return (
    <main className="tela-container">
      <div className="card-interface">
        
        <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-start', marginBottom: '10px' }}>
          <button className="btn-voltar" onClick={() => window.history.back()} title="Voltar"> Voltar
            <FiArrowLeft size={24} />
          </button>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <MdVpnKey 
            size={80} 
            color="var(--cor-primaria, #1A6AA8)" 
            style={{ marginBottom: '16px' }} 
          />
          <h2 style={{ fontSize: '1.8rem', color: '#333', margin: 0 }}>
            Recuperar Senha
          </h2>
        </div>

        <p className="texto-instrucao" style={{ textAlign: 'center', marginBottom: '24px' }}>
          Insira seu e-mail institucional. Enviaremos um link para você redefinir sua senha.
        </p>

        <form className="formulario" onSubmit={handleRecuperar}>
          <div className="grupo-input">
            <label>E-mail Cadastrado</label>
            <div className="input-wrapper">
              <FiMail className="input-icone" size={20} />
              <input 
                type="email" 
                placeholder="Ex: nome@alunos.ufersa.edu.br" 
                value={email}
                onChange={handleChangeEmail}
                required
                // Aplica borda vermelha se houver erro de validação ou do servidor
                style={(erroEmail || erroServidor) ? { borderColor: '#d32f2f' } : {}}
              />
            </div>

            {/* MENSAGENS DE FEEDBACK ABAIXO DO INPUT */}
            {erroEmail && (
              <span style={{ color: '#d32f2f', fontSize: '0.85rem', marginTop: '4px', display: 'block' }}>
                {erroEmail}
              </span>
            )}

            {erroServidor && (
              <span style={{ color: '#d32f2f', fontSize: '0.85rem', marginTop: '4px', display: 'block', fontWeight: '500' }}>
                {erroServidor}
              </span>
            )}

            {mensagemSucesso && (
              <span style={{ 
                color: '#1b5e20', 
                fontSize: '0.9rem', 
                marginTop: '10px', 
                display: 'block', 
                textAlign: 'center',
                backgroundColor: '#e8f5e9',
                padding: '10px',
                borderRadius: '4px',
                border: '1px solid #c8e6c9'
              }}>
                {mensagemSucesso}
              </span>
            )}
          </div>

          <button 
            type="submit" 
            className="btn-primario" 
            style={{ marginTop: '16px', opacity: carregando ? 0.7 : 1 }}
            disabled={carregando || erroEmail !== '' || email === ''}
          >
            {carregando ? 'ENVIANDO...' : 'ENVIAR LINK'}
          </button>
        </form>

      </div>
    </main>
  );
}