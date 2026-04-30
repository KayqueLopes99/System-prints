import React, { useState, useEffect } from 'react';
import { Home, Printer, FileText, Lightbulb, Bell, Menu, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './TelaEstudante.css';

export default function TelaEstudante() {
  const [horarios, setHorarios] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:8080/api/horarios')
      .then(response => response.json())
      .then(data => setHorarios(data))
      .catch(error => console.error("Erro ao buscar horários:", error));
  }, []);

  const renderizarCelula = (texto) => {
    if (texto === 'Fechado') {
      return <span className="texto-vermelho">{texto}</span>;
    }
    return texto;
  };

  return (
    <div className="app-container">
      <header className="header-topo">
        <Menu
          size={32}
          color="#1d448b"
          onClick={() => navigate('/perfil')}
          style={{ cursor: 'pointer' }}
        />
        <Bell size={32} color="#1d448b" />
      </header>

      <main className="conteudo-principal">
        <h1 className="saudacao">Olá, estudante!</h1>

        <div className="botao-aberto">
          Aberto agora!
        </div>

        <h2 className="titulo-secao">Quadro de Horários</h2>

        {/* Tabela de Horários */}
        <div className="tabela-container">
          <table className="tabela">
            <thead>
              <tr>
                <th>Dia</th>
                <th>Manhã</th>
                <th>Tarde</th>
                <th>Noite</th>
              </tr>
            </thead>
            <tbody>
              {horarios.map((horario) => (
                <tr key={horario.idHorario}>
                  <td className={horario.manha === 'Fechado' ? 'texto-vermelho' : ''}>
                    {horario.diaSemana}
                  </td>
                  <td>{renderizarCelula(horario.manha)}</td>
                  <td>{renderizarCelula(horario.tarde)}</td>
                  <td>{renderizarCelula(horario.noite)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 👉 NOVO: Card de Informações Úteis (Padronizado com a tabela)[cite: 15, 16] */}
        <div className="tabela-container">
          <div className="info-topo-azul">
            <Info size={20} color="#fff" />
            <span>Informações Úteis</span>
          </div>

          <div className="info-corpo-tabela">
            <div className="info-linha-item">
              <strong>Local:</strong>
              <p>Setor de impressões - Bloco 2</p>
            </div>

            <div className="info-linha-item">
              <strong>E-mail:</strong>
              <p>grafica.universitaria@ufersa.edu.br</p>
            </div>

            <div className="info-linha-item">
              <strong>WhatsApp:</strong>
              <p>(84) 99999-8888</p>
            </div>
          </div>
        </div>

      </main>

      <nav className="navegacao-inferior">
        <div className="icone-nav ativo" style={{ cursor: 'pointer' }}>
          <Home size={28} />
        </div>

        <div className="icone-nav" onClick={() => navigate('/novo-pedido')} style={{ cursor: 'pointer' }}>
          <Printer size={28} />
        </div>

        <div
          className="icone-nav"
          onClick={() => navigate('/pedidos')}
          style={{ cursor: 'pointer' }}
        >
          <FileText size={28} />
        </div>

        <div className="icone-nav" onClick={() => navigate('/dicas-contextuais')}>
          <Lightbulb size={28} />
        </div>
      </nav>
    </div>
  );
}