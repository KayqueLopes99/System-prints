import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AlertTriangle, X, Package, Trash2, ArrowLeft, CheckCircle2, Clock } from 'lucide-react';
import './CancelarPedido.css';

export default function CancelarPedido() {
    const location = useLocation();
    const navigate = useNavigate();
    const { idPedido, nomeArquivo } = location.state || {};
    
    const [carregando, setCarregando] = useState(false);
    const [statusFeedback, setStatusFeedback] = useState({ tipo: null, mensagem: '' });

    const handleCancelar = async () => {
        setCarregando(true);
        try {
            await axios.put(`https://api-impressoes-kayque-99.onrender.com/api/pedidos/${idPedido}/cancelar`);
            
            setStatusFeedback({ 
                tipo: 'sucesso', 
                mensagem: 'Pedido cancelado com sucesso!' 
            });
        } catch (error) {
            const msgErro = error.response?.data?.message || "O prazo de 5 minutos para cancelamento expirou.";
            
            setStatusFeedback({ 
                tipo: 'erro', 
                mensagem: msgErro 
            });
        } finally {
            setCarregando(false);
        }
    };

    if (!idPedido) {
        return <div className="cancelar-container"><div className="modal-card">Pedido não encontrado.</div></div>;
    }

    if (statusFeedback.tipo) {
        return (
            <div className="cancelar-container">
                <div className="modal-card feedback-animacao">
                    <div className="feedback-conteudo">
                        {statusFeedback.tipo === 'sucesso' ? (
                            <CheckCircle2 size={80} color="#26d451" strokeWidth={1.5} />
                        ) : (
                            <Clock size={80} color="#d9534f" strokeWidth={1.5} />
                        )}
                        
                        <h2 className={`titulo-feedback ${statusFeedback.tipo}`}>
                            {statusFeedback.tipo === 'sucesso' ? 'Cancelado!' : 'Prazo Expirado'}
                        </h2>
                        
                        <p className="texto-feedback">{statusFeedback.mensagem}</p>
                        
                        <button className="btn-voltar-feedback" onClick={() => navigate('/pedidos')}>
                            Voltar para meus pedidos
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="cancelar-container">
            <div className="modal-card">
                <header className="modal-header">
                    <div className="header-left">
                        <AlertTriangle size={20} color="#fff" />
                        <span>Cancelar Pedido</span>
                    </div>
                    <button className="btn-close" onClick={() => navigate('/pedidos')}>
                        <X size={20} color="#fff" />
                    </button>
                </header>

                <div className="alerta-amarelo">
                    <AlertTriangle size={24} color="#856404" />
                    <div className="alerta-texto">
                        <strong>Atenção!</strong>
                        <p>Você está prestes a cancelar este pedido. Esta ação não poderá ser desfeita.</p>
                    </div>
                </div>

                <div className="info-pedido-card">
                    <div className="info-item">
                        <Package size={18} color="#1d448b" />
                        <strong>Pedido #{idPedido}</strong>
                    </div>
                    <p className="nome-arquivo-cancelar">{nomeArquivo}</p>
                </div>

                <div className="modal-acoes">
                    <button 
                        className="btn-confirmar-cancelar" 
                        onClick={handleCancelar}
                        disabled={carregando}
                    >
                        <Trash2 size={18} />
                        {carregando ? "Cancelando..." : "Sim, cancelar pedido"}
                    </button>
                    
                    <button 
                        className="btn-manter-pedido" 
                        onClick={() => navigate('/pedidos')}
                        disabled={carregando}
                    >
                        <ArrowLeft size={18} />
                        Não, manter pedido
                    </button>
                </div>
            </div>
        </div>
    );
}