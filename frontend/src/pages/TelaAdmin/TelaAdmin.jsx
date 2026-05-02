import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard, ListOrdered, Users, Settings,
    BarChart3, LogOut, Clock, Printer, CheckCircle, XCircle,
    Bell, Power
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; 
import './TelaAdmin.css';

export default function TelaAdmin() {
    const navigate = useNavigate();

    const [dataAtual, setDataAtual] = useState(new Date());
    const [setorAberto, setSetorAberto] = useState(true);

    // 👉 LÓGICA DO ESTUDANTE: Informações da fila global[cite: 15]
    const [infoFila, setInfoFila] = useState({
        tempo: 'Calculando...',
        nivel: 'Carregando...',
        quantidade: 0
    });

    const [stats, setStats] = useState({
        pendentes: 0,
        processando: 0,
        concluidos: 0,
        cancelados: 0
    });

    useEffect(() => {
        const timer = setInterval(() => setDataAtual(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        // 1. Status do Setor[cite: 9, 17]
        axios.get('http://localhost:8080/api/admin/status-setor')
            .then(res => setSetorAberto(res.data.setorAberto))
            .catch(err => console.error("Erro status:", err));

        // 2. Estatísticas Gerais[cite: 10, 17]
        axios.get('http://localhost:8080/api/admin/estatisticas-gerais')
            .then(res => setStats(res.data))
            .catch(err => console.error("Erro estatísticas:", err));

        // 3. 👉 INJEÇÃO DA FILA (ESTUDANTE)[cite: 15]
        axios.get(`http://localhost:8080/api/pedidos/fila/status-geral`)
            .then(res => {
                const nivelTraduzido = res.data.nivelOcupacao === 'BAIXA' ? 'Fila Baixa' :
                    res.data.nivelOcupacao === 'MODERADA' ? 'Fila Moderada' : 'Fila Cheia';

                setInfoFila({
                    tempo: res.data.tempoEstimado,
                    nivel: nivelTraduzido,
                    quantidade: res.data.quantidadePessoas
                });
            })
            .catch(err => console.error("Erro ao buscar status da fila:", err));
    }, []);

    const toggleSetor = () => {
        const novoStatus = !setorAberto;
        axios.put(`http://localhost:8080/api/admin/status-setor?status=${novoStatus}&mensagem=${novoStatus ? "Aberto" : "Fechado"}`)
            .then(() => setSetorAberto(novoStatus));
    };

    const formatarData = (data) => {
        const opcoes = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
        return `${data.toLocaleDateString('pt-BR', opcoes)} - ${data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    };

    return (
        <div className="admin-container">
            <aside className="admin-sidebar">
                <div className="sidebar-logo">
                    <div className="logo-icon-circle">
                        <Settings size={24} color="#1a3a6d" />
                    </div>
                    <div className="logo-text">
                        <span className="ufersa-txt">UFERSA</span>
                        
                        <span className="admin-txt">Administrador</span> 
                        
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <div className="nav-item active" onClick={() => navigate('/admin')}>
                        <LayoutDashboard size={20} /> <span>Dashboard</span>
                    </div>
                    <div className="nav-item" onClick={() => navigate('/admin/pedidos')}>
                        <ListOrdered size={20} /> <span>Fila de Pedidos</span>
                    </div>
                    <div className="nav-item" onClick={() => navigate('/admin/gerenciar-usuarios')}>
                        <Users size={20} /> <span>Gerenciar Usuários</span>
                    </div>
                    <div className="nav-item" onClick={() => navigate('/admin/configuracoes')}>
                        <Settings size={20} /> <span>Configurações</span>
                    </div>
                    <div className="nav-item" onClick={() => navigate('/admin/relatorios')}>
                        <BarChart3 size={20} /> <span>Relatórios</span>
                    </div>
                </nav>

                <div className="sidebar-footer">
                    <span>Sistema de Impressão v1.0</span>
                </div>
            </aside>

            <main className="admin-main">
                <header className="admin-header">
                    <div className="header-left">
                        {/* Data agora posicionada abaixo do título[cite: 17] */}
                        <h1>Painel Administrativo</h1>
                        <p className="data-header"><Clock size={16} /> {formatarData(dataAtual)}</p>
                    </div>

                    <div className="header-right">
                        <div className="status-monitor">
                            <span>Status:</span>
                            <button className={`btn-status ${setorAberto ? 'aberto' : 'fechado'}`} onClick={toggleSetor}>
                                <Power size={14} /> {setorAberto ? 'Aberto' : 'Fechado'}
                            </button>
                        </div>
                        <div className="status-monitor">
                            <span>Ocupação:</span>
                            {/* Badge dinâmico com a lógica traduzida[cite: 15, 17] */}
                            <span className={`badge-ocupacao ${infoFila.nivel.replace(' ', '-').toLowerCase()}`}>
                                {infoFila.nivel} ({infoFila.quantidade} pedidos)
                            </span>
                        </div>
                        <div className="header-actions">
                            <button className="icon-btn"><Bell size={20} /></button>
                            <button className="logout-btn" onClick={() => navigate('/')}>
                                <LogOut size={18} /> Sair
                            </button>
                        </div>
                    </div>
                </header>

                <section className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon yellow"><Clock size={24} /></div>
                        <div className="stat-info">
                            <span className="stat-value">{stats.pendentes}</span>
                            <span className="stat-label">Pedidos Pendentes</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon blue"><Printer size={24} /></div>
                        <div className="stat-info">
                            <span className="stat-value">{stats.processando}</span>
                            <span className="stat-label">Em Processamento</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon green"><CheckCircle size={24} /></div>
                        <div className="stat-info">
                            <span className="stat-value">{stats.concluidos}</span>
                            <span className="stat-label">Concluídos Hoje</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon red"><XCircle size={24} /></div>
                        <div className="stat-info">
                            <span className="stat-value">{stats.cancelados}</span>
                            <span className="stat-label">Cancelados Hoje</span>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}