import React, { useState } from 'react';
import { Home, Printer, FileText, Lightbulb, Upload, Book } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './NovoPedidoInicio.css';

export default function NovoPedidoInicio() {
    const navigate = useNavigate();

    // Estado para controlar qual serviço está selecionado
    const [servicoSelecionado, setServicoSelecionado] = useState(null);

    return (
        <div className="novo-pedido-container">
            <header className="novo-pedido-header">
                {/* 👉 ADICIONADO: Ícone grande no topo */}
                <div className="header-icon-container">
                    <Printer size={60} color="#1d448b" strokeWidth={1.5} />
                </div>
                <h1>Novo Pedido</h1>
                <p>Selecione o que você precisa hoje para começar.</p>
            </header>

            <main className="novo-pedido-main">
                <section className="secao-servicos">
                    <h2 className="titulo-secao">Serviços Disponíveis</h2>

                    <label className="card-servico">
                        <div className="icone-servico bg-azul-claro">
                            <Upload size={24} color="#1d448b" />
                        </div>
                        <div className="info-servico">
                            <h3>Nova Impressão</h3>
                            <span className="sub-info">Envio de Arquivo Digital</span>
                            <p className="descricao-servico">Suporta PDF, DWG ou JPG.</p>
                        </div>
                        <input
                            type="checkbox"
                            className="checkbox-servico"
                            checked={servicoSelecionado === 'impressao'}
                            onChange={() => setServicoSelecionado(servicoSelecionado === 'impressao' ? null : 'impressao')}
                        />
                    </label>

                    <label className="card-servico">
                        <div className="icone-servico">
                            <Book size={24} color="#555" />
                        </div>
                        <div className="info-servico">
                            <h3>Encadernação</h3>
                            <span className="sub-info">Para materiais impressos</span>
                        </div>
                        <input
                            type="checkbox"
                            className="checkbox-servico"
                            checked={servicoSelecionado === 'encadernacao'}
                            onChange={() => setServicoSelecionado(servicoSelecionado === 'encadernacao' ? null : 'encadernacao')}
                        />
                    </label>
                </section>

                {/* Botão Avançar que só renderiza se tiver serviço selecionado */}
                {servicoSelecionado && (
                    <div className="container-avancar">
                        <button
                            className="botao-avancar"
                            onClick={() => {
                                // 👇 Verifica se o serviço selecionado é a impressão
                                if (servicoSelecionado === 'impressao') {
                                    navigate('/configuracao-pedido', { state: { tipoServico: servicoSelecionado } });
                                } else {
                                    // Se for encadernação, avisa o usuário (pois faremos essa tela depois)
                                    navigate('/configuracao-encadernacao', { state: { tipoServico: servicoSelecionado } });
                                }
                            }}

                        >
                            Avançar
                        </button>
                    </div>
                )}

            </main>

            {/* MENU INFERIOR */}
            <nav className="navegacao-inferior dark-nav">
                <div className="icone-nav" onClick={() => navigate('/estudante')}>
                    <Home size={26} color="#fff" />
                </div>

                <div className="icone-nav ativo" style={{ cursor: 'pointer' }}>
                    <Printer size={26} color="#1d448b" />
                </div>

                <div className="icone-nav" onClick={() => navigate('/pedidos')}>
                    <FileText size={26} color="#fff" />
                </div>

                <div className="icone-nav">
                    <Lightbulb size={26} color="#fff" />
                </div>
            </nav>
        </div>
    );
}