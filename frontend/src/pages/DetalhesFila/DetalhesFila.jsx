import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Clock, FileText, User } from 'lucide-react';
import './DetalhesFila.css';

export default function DetalhesFila() {
    const navigate = useNavigate();
    const [fila, setFila] = useState([]);
    const [statusGeral, setStatusGeral] = useState({ tempo: '--', quantidade: 0, posicao: '--' });
    
    const idUsuarioLogado = parseInt(localStorage.getItem('usuarioId') || 1);

    useEffect(() => {
        axios.get(`https://api-impressoes-kayque-99.onrender.com/api/pedidos/admin/fila`)
            .then(res => {
                setFila(res.data);
                
                const index = res.data.findIndex(p => p.idUsuario === idUsuarioLogado);
                const pos = index !== -1 ? `${index + 1}º` : 'Fora da fila';

                axios.get(`https://api-impressoes-kayque-99.onrender.com/api/pedidos/fila/status-geral`)
                    .then(s => {
                        setStatusGeral({
                            tempo: s.data.tempoEstimado,
                            quantidade: s.data.quantidadePessoas,
                            posicao: pos
                        });
                    });
            })
            .catch(err => console.error("Erro ao carregar detalhes da fila:", err));
    }, [idUsuarioLogado]);

    return (
        <div className="detalhes-fila-container">
            <header className="header-detalhes">
                <button className="btn-voltar-fila" onClick={() => navigate(-1)}>
                    <ArrowLeft size={24} color="#1d448b" />
                </button>
                <h1>Detalhes da fila</h1>
            </header>

            <div className="card-sua-posicao">
                <div className="posicao-circulo">
                    <User size={28} color="#fff" />
                    <div className="posicao-texto">
                        <span>Sua Posição</span>
                        <h3>{statusGeral.posicao}</h3>
                    </div>
                </div>
                
                <div className="resumo-inferior">
                    <div className="item-resumo">
                        <Clock size={16} />
                        <span>Tempo Estimado: <strong>{statusGeral.tempo}</strong></span>
                    </div>
                    <div className="item-resumo">
                        <FileText size={16} />
                        <span>Total na Fila: <strong>{statusGeral.quantidade} pedidos</strong></span>
                    </div>
                </div>
            </div>

            <section className="secao-pedidos-fila">
                <div className="titulo-secao">Pedidos na fila</div>
                
                <div className="lista-scroll-fila">
                    {fila.map((pedido, index) => {
                        const ehMeuPedido = pedido.idUsuario === idUsuarioLogado;
                        
                        const nomeServico = pedido.tipoServico === 'ENCADERNACAO' 
                            ? 'Serviço de Encadernação' 
                            : 'Impressão';

                        return (
                            <div key={pedido.idPedido} className={`card-item-fila ${ehMeuPedido ? 'meu-item' : ''}`}>
                                <div className={`bolinha-posicao ${index === 0 ? 'imprimindo' : ''}`}>
                                    {index + 1}º
                                </div>
                                
                                <div className="info-item-fila">
                                    <div className="user-line">
                                        <User size={14} />
                                        <span>{ehMeuPedido ? 'Você' : 'Usuário Acadêmico'}</span>
                                    </div>
                                    <p className="id-pedido-text">Pedido #{pedido.idPedido}</p>
                                    
                                    <p className="servico-label-text">
                                        {nomeServico}
                                    </p>

                                    <div className="tags-fila">
                                        <span className="tag-fila-info">
                                            {ehMeuPedido ? pedido.totalPaginasArquivo + ' páginas' : '-- páginas'}
                                        </span>
                                        <span className="tag-fila-info">
                                            {ehMeuPedido ? (pedido.detalhesImpressao ? pedido.detalhesImpressao.split(' • ')[0] : 'A4') : 'A4'} • P&B
                                        </span>
                                    </div>

                                    <div className="status-tempo-linha">
                                        <span className={`status-text ${index === 0 ? 'text-green' : ''}`}>
                                            {index === 0 ? '● Imprimindo agora' : 'Aguardando'}
                                        </span>
                                        <span className="tempo-card"><Clock size={12} /> {index * 3 + 2} min</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}