import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Download, User, FileText,
    CreditCard, CheckCircle, XCircle, AlertCircle, Clock
} from 'lucide-react';
import axios from 'axios';
import './PedidoDetalhes.css';

export default function PedidoDetalhes() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [pedido, setPedido] = useState(null);
    const [modal, setModal] = useState({ aberto: false, status: '' });
    const [feedback, setFeedback] = useState(null);

    useEffect(() => {
        carregarDetalhes();
    }, [id]);

    const carregarDetalhes = () => {
        axios.get(`http://localhost:8080/api/pedidos/${id}`)
            .then(res => setPedido(res.data))
            .catch(err => console.error("Erro ao carregar detalhes:", err));
    };

    const confirmarMudancaStatus = () => {
        const novoStatus = modal.status;
        axios.put(`http://localhost:8080/api/pedidos/${id}/status?novoStatus=${novoStatus}`)
            .then(() => {
                carregarDetalhes();
                setModal({ aberto: false, status: '' });
                setFeedback("Status atualizado e estudante notificado!");
                setTimeout(() => setFeedback(null), 4000);
            })
            .catch(() => {
                setModal({ aberto: false, status: '' });
                setFeedback("Erro ao atualizar status.");
            });
    };

    const fazerDownload = () => {
        window.open(`http://localhost:8080/api/pedidos/${id}/download`, '_blank');
    };

    if (!pedido) return <div className="loading-container">Carregando detalhes...</div>;

    return (
        <div className="detalhes-container">
            {feedback && <div className="toast-feedback">{feedback}</div>}

            
            {modal.aberto && (
                <div className="modal-overlay">
                    <div className="modal-confirmacao">
                        <AlertCircle size={40} color="#f59e0b" />
                        <h2>Confirmar Alteração</h2>
                        <p>Deseja mudar o status para <strong>{modal.status}</strong>?</p>
                        <p className="sub-modal">O estudante será notificado automaticamente.</p>
                        <div className="modal-actions">
                            <button className="btn-cancelar" onClick={() => setModal({ aberto: false, status: '' })}>Cancelar</button>
                            <button className="btn-confirmar" onClick={confirmarMudancaStatus}>Confirmar</button>
                        </div>
                    </div>
                </div>
            )}

            <header className="detalhes-header">
                <button className="btn-voltar" onClick={() => navigate(-1)}>
                    <ArrowLeft size={20} /> Voltar para Fila
                </button>
                <h1>Pedido #{pedido.idPedido}</h1>
            </header>

            <div className="detalhes-grid">
                <div className="info-column">
                    <section className="detalhes-card">
                        <h3><User size={18} /> Informações do Estudante</h3>
                        <div className="info-group">
                            <p><strong>Nome:</strong> {pedido.nomeEstudante || "Usuário"}</p>
                            <p><strong>Data:</strong> {new Date(pedido.dataHora).toLocaleDateString('pt-BR')}</p>
                            <p><strong>Horário:</strong> {new Date(pedido.dataHora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                    </section>

                    <section className="detalhes-card">
                        <h3><FileText size={18} /> Detalhes do Arquivo</h3>
                        <div className="info-group">
                            <p><strong>Arquivo:</strong> {pedido.nomeArquivoOriginal}</p>
                            <p><strong>Serviço:</strong> {pedido.tipoServico}</p>
                            <p><strong>Configuração:</strong> {pedido.detalhesImpressao}</p>
                            <p><strong>Páginas:</strong> {pedido.totalPaginasArquivo}</p>
                        </div>
                    </section>
                </div>

                <div className="actions-column">
                    <section className="detalhes-card price-card">
                        <h3><CreditCard size={18} /> Financeiro</h3>
                        <div className="price-box">
                            <span className="price-label">Total:</span>
                            <span className="price-value">R$ {pedido.valorTotal?.toFixed(2)}</span>
                        </div>
                        <button className="btn-download-full" onClick={fazerDownload}>
                            <Download size={18} /> Baixar Arquivo
                        </button>
                    </section>

                    <section className="detalhes-card status-box">
                        <h3>Ações de Status</h3>
                        <div className="status-grid-btns">
                            <button className="st-btn pronto" onClick={() => setModal({ aberto: true, status: 'PRONTO' })}>
                                <AlertCircle size={16} /> Pronto
                            </button>
                            <button className="st-btn concluido" onClick={() => setModal({ aberto: true, status: 'CONCLUIDO' })}>
                                <CheckCircle size={16} /> Concluir
                            </button>
                            <button className="st-btn cancelado" onClick={() => setModal({ aberto: true, status: 'CANCELADO' })}>
                                <XCircle size={16} /> Cancelar
                            </button>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}