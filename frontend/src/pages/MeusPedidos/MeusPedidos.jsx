import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Home, Printer, FileText, Lightbulb, Check, X, Hourglass, File, DollarSign, Trash2 } from 'lucide-react';
import './MeusPedidos.css';

export default function MeusPedidos() {
    const navigate = useNavigate();

    // Estados de Controle de Abas
    const [abaPrincipal, setAbaPrincipal] = useState('ativos'); // 'ativos' ou 'historico'
    const [subAba, setSubAba] = useState('TODOS'); // 'TODOS', 'CONCLUIDO', 'CANCELADO'

    // Estados dos Dados
    const [estatisticas, setEstatisticas] = useState({ totalPedidos: 0, totalPaginas: 0, totalGasto: 0 });
    const [pedidos, setPedidos] = useState([]);

    // Pegar ID do usuário logado
    const idUsuario = localStorage.getItem('usuarioId') || 1;

    // Efeito 1: Carrega estatísticas
    useEffect(() => {
        axios.get(`http://localhost:8080/api/pedidos/estatisticas/${idUsuario}`)
            .then(res => setEstatisticas(res.data))
            .catch(err => console.error("Erro ao buscar estatísticas:", err));
    }, [idUsuario]);

    // Efeito 2: Carrega a lista de pedidos
    useEffect(() => {
        let url = '';
        if (abaPrincipal === 'ativos') {
            url = `http://localhost:8080/api/pedidos/ativos/${idUsuario}`;
        } else {
            if (subAba === 'TODOS') url = `http://localhost:8080/api/pedidos/historico/${idUsuario}`;
            else url = `http://localhost:8080/api/pedidos/usuario/${idUsuario}/status/${subAba}`;
        }

        axios.get(url)
            .then(res => setPedidos(res.data))
            .catch(err => console.error("Erro ao buscar pedidos:", err));
    }, [abaPrincipal, subAba, idUsuario]);

    const formatarData = (dataIso) => {
        const dataObj = new Date(dataIso);
        const dia = String(dataObj.getDate()).padStart(2, '0');
        const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
        const mes = meses[dataObj.getMonth()];
        const horas = String(dataObj.getHours()).padStart(2, '0');
        const minutos = String(dataObj.getMinutes()).padStart(2, '0');
        return `${dia} ${mes}, ${horas}:${minutos}`;
    };

    const formatarMoeda = (valor) => {
        return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    return (
        <div className="pedidos-container">

            <div className="cabecalho-abas">
                <h2>{abaPrincipal === 'ativos' ? 'Meus Pedidos' : 'Histórico de pedidos'}</h2>
                <div className="botoes-principais">
                    <button
                        className={`btn-aba ${abaPrincipal === 'ativos' ? 'ativo' : 'inativo'}`}
                        onClick={() => setAbaPrincipal('ativos')}
                    >
                        Ativos
                    </button>
                    <button
                        className={`btn-aba ${abaPrincipal === 'historico' ? 'ativo' : 'inativo'}`}
                        onClick={() => setAbaPrincipal('historico')}
                    >
                        Histórico
                    </button>
                </div>
            </div>

            {abaPrincipal === 'historico' && (
                <div className="sub-abas">
                    <button className={`btn-sub-aba ${subAba === 'TODOS' ? 'ativo-todos' : ''}`} onClick={() => setSubAba('TODOS')}>Todos</button>
                    <button className={`btn-sub-aba ${subAba === 'CONCLUIDO' ? 'ativo-concluido' : ''}`} onClick={() => setSubAba('CONCLUIDO')}>Concluídos</button>
                    <button className={`btn-sub-aba ${subAba === 'CANCELADO' ? 'ativo-cancelado' : ''}`} onClick={() => setSubAba('CANCELADO')}>Cancelados</button>
                </div>
            )}

            <div className="estatisticas-container">
                <div className="card-stat">
                    <FileText className="icone" size={24} color="#1d448b" />
                    <h3>{estatisticas.totalPedidos}</h3>
                    <p>Pedidos</p>
                </div>
                <div className="card-stat">
                    <File className="icone" size={24} color="#378C26" />
                    <h3>{estatisticas.totalPaginas}</h3>
                    <p>Páginas</p>
                </div>
                <div className="card-stat">
                    <DollarSign className="icone" size={24} color="#a71d1d" />
                    <h3>{estatisticas.totalGasto.toFixed(2).replace('.', ',')}</h3>
                    <p>Gasto</p>
                </div>
            </div>

            <div className="lista-pedidos-box">
                <div className="lista-header">
                    Número de pedidos {abaPrincipal === 'ativos' ? 'solicitados' : 'encontrados'}: {pedidos.length} pedidos
                </div>

                <div className="lista-conteudo">
                    {pedidos.length === 0 ? (
                        <p style={{ textAlign: 'center', color: '#666' }}>Nenhum pedido encontrado.</p>
                    ) : (
                        pedidos.map((pedido) => (
                            <div className="pedido-card" key={pedido.idPedido}>

                                {/* 👉 A única mudança foi criar este container para empilhar os ícones na direita */}
                                <div className="card-acoes-status">
                                    {/* Mantive sua lógica original de ícones de status */}
                                    {pedido.statusFila === 'CONCLUIDO' && <div className="icone-status-grande bg-verde"><Check size={20} /></div>}
                                    {pedido.statusFila === 'CANCELADO' && <div className="icone-status-grande bg-vermelho"><X size={20} /></div>}
                                    {pedido.statusFila !== 'CONCLUIDO' && pedido.statusFila !== 'CANCELADO' && (
                                        <div className="icone-status-grande bg-azul"><Hourglass size={20} /></div>
                                    )}

                                    {/* O botão X de cancelar fica logo abaixo da ampulheta */}
                                    {abaPrincipal === 'ativos' && (
                                        <button
                                            className="btn-cancelar-card-novo"
                                            onClick={() => navigate('/cancelar-pedido', {
                                                state: { idPedido: pedido.idPedido, nomeArquivo: pedido.nomeArquivoOriginal }
                                            })}
                                        >
                                            <X size={16} />
                                        </button>
                                    )}
                                </div>

                                <div className="pedido-topo">
                                    <div className="pedido-info-base">
                                        <div className="data-hora">
                                            <Hourglass size={14} /> {formatarData(pedido.dataHora)}
                                        </div>
                                        <p>Pedido #{pedido.idPedido}</p>
                                    </div>
                                    {/* O ícone de status saiu daqui e foi para o container ali em cima */}
                                </div>

                                <div className="pedido-arquivo">{pedido.nomeArquivoOriginal}</div>

                                {/* TODO O RESTANTE (TAGS E RODAPÉ) CONTINUA IGUALZINHO AO SEU */}
                                <div className="pedido-tags">
                                    {pedido.detalhesImpressao && pedido.detalhesImpressao !== "Configurações não informadas" ? (
                                        <span className="tag">{pedido.detalhesImpressao}</span>
                                    ) : pedido.itens && pedido.itens.length > 0 ? (
                                        <span className="tag">
                                            {pedido.itens[0].tamanhoPapel} • {pedido.itens[0].tipoCor === 'PRETO_BRANCO' ? 'P&B' : 'Colorido'}
                                        </span>
                                    ) : (
                                        <span className="tag" style={{ color: 'orange' }}>Aguardando detalhes...</span>
                                    )}
                                    <span className="tag">{pedido.totalPaginasArquivo} páginas</span>
                                </div>

                                <div className="pedido-rodape">
                                    <div className={`status-badge ${pedido.statusFila === 'CONCLUIDO' ? 'status-concluido' :
                                        pedido.statusFila === 'CANCELADO' ? 'status-cancelado' : 'status-ativo'
                                        }`}>
                                        <div className="bolinha" style={{ backgroundColor: 'currentColor' }}></div>
                                        {pedido.statusFila === 'NA_FILA' ? 'Na Fila' :
                                            pedido.statusFila === 'IMPRIMINDO' ? 'Imprimindo' :
                                                pedido.statusFila === 'CONCLUIDO' ? 'Concluído' :
                                                    pedido.statusFila === 'CANCELADO' ? 'Cancelado' : 'Pendente'}
                                    </div>
                                    <div className="valor-pago">
                                        Valor pago: {formatarMoeda(pedido.valorTotal)}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <nav className="navegacao-inferior">
                <div className="icone-nav" onClick={() => navigate('/estudante')} style={{ cursor: 'pointer' }}>
                    <Home size={28} />
                </div>
                <div className="icone-nav" onClick={() => navigate('/novo-pedido')}>
                    <Printer size={28} />
                </div>
                <div className="icone-nav ativo" style={{ cursor: 'pointer' }}>
                    <FileText size={28} color="#1d448b" />
                </div>
                <div className="icone-nav" style={{ cursor: 'pointer' }}>
                    <Lightbulb size={28} />
                </div>
            </nav>
        </div>
    );
}