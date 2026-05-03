import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Send, ChevronLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import './NotificacaoGeral.css';

export default function NotificacaoGeral() {
    const navigate = useNavigate();
    const [titulo, setTitulo] = useState('');
    const [mensagem, setMensagem] = useState('');
    const [status, setStatus] = useState({ tipo: '', texto: '' });
    const [enviando, setEnviando] = useState(false);

    const handleEnviar = async (e) => {
        e.preventDefault();
        
        // Validação básica local antes do envio
        if (!titulo.trim() || !mensagem.trim()) {
            setStatus({ tipo: 'erro', texto: 'Preencha todos os campos antes de disparar o aviso.' });
            return;
        }

        setEnviando(true);
        setStatus({ tipo: '', texto: '' });

        try {
            // Chamada ao endpoint que utiliza o NotificacaoService.cadastrarNotificacaoGeral
            await axios.post('http://localhost:8080/api/notificacoes/enviar-geral', {
                titulo,
                mensagem
            });
            
            setStatus({ tipo: 'sucesso', texto: 'Notificação disparada com sucesso para todos os usuários!' });
            setTitulo('');
            setMensagem('');
        } catch (error) {
            console.error("Erro ao enviar:", error);
            setStatus({ tipo: 'erro', texto: 'Falha na conexão com o servidor. Tente novamente.' });
        } finally {
            setEnviando(false);
        }
    };

    return (
        <div className="notificacao-wrapper">
            <div className="notificacao-container">
                <header className="notificacao-header">
                    <button className="btn-voltar-circle" onClick={() => navigate(-1)} title="Voltar ao Painel">
                        <ChevronLeft size={24} />
                    </button>
                    <h1>Notificação Geral</h1>
                </header>

                <main className="notificacao-card">
                    <div className="info-banner">
                        <Bell size={20} />
                        <p>Atenção: Esta mensagem será enviada para <strong>todos</strong> os usuários cadastrados no sistema.</p>
                    </div>

                    {status.texto && (
                        <div className={`status-alert ${status.tipo}`}>
                            {status.tipo === 'sucesso' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                            <span>{status.texto}</span>
                        </div>
                    )}

                    <form onSubmit={handleEnviar} className="notificacao-form">
                        <div className="input-block">
                            <label htmlFor="titulo">Título do Aviso</label>
                            <input 
                                id="titulo"
                                type="text" 
                                value={titulo} 
                                onChange={(e) => setTitulo(e.target.value)}
                                placeholder="Ex: Manutenção agendada para amanhã..."
                                autoFocus
                            />
                        </div>

                        <div className="input-block">
                            <label htmlFor="mensagem">Corpo da Mensagem</label>
                            <textarea 
                                id="mensagem"
                                rows="6"
                                value={mensagem}
                                onChange={(e) => setMensagem(e.target.value)}
                                placeholder="Escreva aqui o comunicado oficial detalhadamente..."
                            ></textarea>
                        </div>

                        <div className="form-footer">
                            <button type="button" className="btn-cancel" onClick={() => navigate(-1)}>
                                Cancelar
                            </button>
                            <button type="submit" className="btn-send" disabled={enviando}>
                                {enviando ? "Processando..." : (
                                    <>
                                        <Send size={18} /> 
                                        <span>Disparar Notificação</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </main>
            </div>
        </div>
    );
}