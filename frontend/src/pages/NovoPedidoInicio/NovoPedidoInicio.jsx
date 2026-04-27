import React, { useState, useEffect } from 'react';
import { Home, Printer, FileText, Lightbulb, Upload, Book, Brain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './NovoPedidoInicio.css';

export default function NovoPedidoInicio() {
    const navigate = useNavigate();
    const [pedidosAtivos, setPedidosAtivos] = useState([]);
    
    // Estado para controlar qual serviço está selecionado
    const [servicoSelecionado, setServicoSelecionado] = useState(null); 
    
    const idUsuario = 1; // Substitua pelo ID do usuário logado

    useEffect(() => {
        fetch(`http://localhost:8080/api/pedidos/ativos/${idUsuario}`)
            .then(response => response.json())
            .then(data => setPedidosAtivos(data))
            .catch(error => console.error("Erro ao buscar pedidos ativos:", error));
    }, [idUsuario]);

    const getStatusStyle = (status) => {
        switch (status) {
            case 'PRONTO': return 'pronto';
            case 'IMPRIMINDO': return 'imprimindo';
            default: return 'na-fila';
        }
    };

    const traduzirStatus = (status) => {
        if (status === 'PRONTO') return 'Pronto para Retirada';
        if (status === 'IMPRIMINDO') return 'Sendo Impresso...';
        if (status === 'NA_FILA') return 'Na Fila';
        return 'Pendente';
    };

    return (
        <div className="novo-pedido-container">
            {/* SVG escondido apenas para criar o gradiente do ícone Brain */}
            <svg width="0" height="0">
                <linearGradient id="brain-gradient" x1="100%" y1="100%" x2="0%" y2="0%">
                    <stop stopColor="#ff007f" offset="0%" />
                    <stop stopColor="#0055ff" offset="100%" />
                </linearGradient>
            </svg>

            <header className="novo-pedido-header">
                <h1>Novo Pedido</h1>
                <p>Selecione o que você precisa hoje.</p>
            </header>

            <main className="novo-pedido-main">
                <section className="secao-pedidos">
                    <h2 className="titulo-secao">Pedidos</h2>
                    <div className="card-cabecalho-tabela">Em progresso</div>

                    {pedidosAtivos.length > 0 ? (
                        pedidosAtivos.map(pedido => (
                            <div className="card-pedido-progresso" key={pedido.idPedido} style={{ marginBottom: '15px' }}>
                                <div className={`faixa-topo ${getStatusStyle(pedido.statusFila)}`}></div>
                                <div className="conteudo-card">
                                    <span className="pedido-id">Pedido #{pedido.idPedido}</span>
                                    <h3 className="pedido-arquivo">{pedido.nomeArquivoOriginal}</h3>
                                    <p className="pedido-detalhes">{pedido.detalhesImpressao}</p>

                                    <div className={`badge-status ${getStatusStyle(pedido.statusFila)}`}>
                                        <span className="dot"></span> {traduzirStatus(pedido.statusFila)}
                                    </div>

                                    <div className="pedido-valor">
                                        <span className="label-valor">Valor Total</span>
                                        <span className="valor-rs">
                                            {pedido.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="card-vazio">Nenhum pedido em andamento.</div>
                    )}
                </section>

                <section className="secao-servicos">
                    <h2 className="titulo-secao">Serviços</h2>

                    {/* 👉 TIREI O onClick DO LABEL */}
                    <label className="card-servico">
                        <div className="icone-servico bg-azul-claro">
                            <Upload size={24} color="#1d448b" />
                        </div>
                        <div className="info-servico">
                            <h3>Nova Impressão</h3>
                            <span className="sub-info">Envio de Arquivo</span>
                            <p className="descricao-servico">PDF, DWG ou JPG.</p>
                        </div>
                        <input 
                            type="checkbox" 
                            className="checkbox-servico" 
                            checked={servicoSelecionado === 'impressao'} 
                            /* 👉 LÓGICA DE CLICAR E DESCLICAR AQUI */
                            onChange={() => setServicoSelecionado(servicoSelecionado === 'impressao' ? null : 'impressao')} 
                        />
                    </label>

                    {/* 👉 TIREI O onClick DO LABEL */}
                    <label className="card-servico">
                        <div className="icone-servico">
                            <Book size={24} color="#555" />
                        </div>
                        <div className="info-servico">
                            <h3>Encadernação</h3>
                            <span className="sub-info">Para materiais que você já tem</span>
                        </div>
                        <input 
                            type="checkbox" 
                            className="checkbox-servico" 
                            checked={servicoSelecionado === 'encadernacao'} 
                            /* 👉 LÓGICA DE CLICAR E DESCLICAR AQUI */
                            onChange={() => setServicoSelecionado(servicoSelecionado === 'encadernacao' ? null : 'encadernacao')} 
                        />
                    </label>
                </section>

                {/* Botão Avançar que só renderiza se tiver serviço selecionado */}
                {servicoSelecionado && (
                    <div className="container-avancar">
                        <button className="botao-avancar">
                            Avançar
                        </button>
                    </div>
                )}

            </main>

            {/* MENU INFERIOR */}
            <nav className="navegacao-inferior dark-nav">
                
                {/* Ícone 1: Home */}
                <div className="icone-nav" onClick={() => navigate('/estudante')}>
                    <Home size={26} color="#fff" />
                </div>
                
                {/* Ícone 2: Nova Impressão (ATIVO) */}
                <div className="icone-nav destaque-ativo">
                    <Printer size={26} color="#1d448b"/>
                </div>

                {/* Ícone 3: Meus Pedidos */}
                <div className="icone-nav" onClick={() => navigate('/pedidos')}>
                    <FileText size={26} color="#fff"/> 
                </div>

                {/* Ícone 4: Ideias / Avisos */}
                <div className="icone-nav">
                    <Lightbulb size={26} color="#fff" />
                </div>

            </nav>
        </div>
    );
}