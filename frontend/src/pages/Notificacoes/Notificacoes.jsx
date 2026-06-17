import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Bell } from 'lucide-react';
import './Notificacoes.css';

export default function Notificacoes() {
    const navigate = useNavigate();
    const [notificacoes, setNotificacoes] = useState([]);
    const idUsuario = localStorage.getItem('usuarioId') || 1;

    useEffect(() => {
        axios.get(`https://backend-impressoes-ufersa.onrender.com/api/notificacoes/usuario/${idUsuario}`)
            .then(res => setNotificacoes(res.data))
            .catch(err => console.error("Erro ao carregar notificações:", err));
    }, [idUsuario]);

    const marcarComoLida = (id) => {
        axios.patch(`https://backend-impressoes-ufersa.onrender.com/api/notificacoes/${id}/lida`)
            .then(() => {
                setNotificacoes(notificacoes.map(n =>
                    n.idNotificacao === id ? { ...n, lida: true } : n
                ));
            });
    };

    return (
        <div className="notificacoes-container">
            <header className="header-notificacoes">
                <button className="btn-voltar" onClick={() => navigate(-1)}>
                    
                    <ArrowLeft size={20} color="#1d448b" /> Voltar
                </button>
                <div className="titulo-notificacoes">
                    <Bell size={28} color="#1d448b" />
                    <h1>Notificações</h1>
                </div>
            </header>

            <div className="lista-notificacoes">
                {notificacoes.length === 0 ? (
                    <p className="msg-vazia">Nenhuma notificação por enquanto.</p>
                ) : (
                    notificacoes.map((n) => (
                        <div
                            key={n.idNotificacao}
                            className={`card-notificacao ${n.lida ? 'lida' : 'nao-lida'}`}
                            onClick={() => marcarComoLida(n.idNotificacao)}
                        >
                            <div className="faixa-lateral"></div>
                            <div className="conteudo-notificacao">
                                <h3>{n.titulo}</h3>
                                <p>{n.mensagem}</p>
                                <span className="data-notificacao">
                                    {new Date(n.dataHora).toLocaleString('pt-BR', {
                                        day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
                                    })}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}