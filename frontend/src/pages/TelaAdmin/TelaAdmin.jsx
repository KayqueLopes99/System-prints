import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard, ListOrdered, Users, Settings,
    BarChart3, LogOut, Clock, Printer, CheckCircle, XCircle,
    Bell, HelpCircle, Power, User
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './TelaAdmin.css';

export default function TelaAdmin() {
    const navigate = useNavigate();

    const [dataAtual, setDataAtual] = useState(new Date());
    const [setorAberto, setSetorAberto] = useState(true);
    const [ocupacao, setOcupacao] = useState('Moderada');

    // Estados para os cards de estatísticas reais
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
        // Status do Setor[cite: 9]
        fetch('http://localhost:8080/api/admin/status-setor')
            .then(res => res.json())
            .then(data => {
                setSetorAberto(data.setorAberto);
            })
            .catch(err => console.error("Erro ao carregar status:", err));

        // Busca estatísticas reais do banco
        fetch('http://localhost:8080/api/admin/estatisticas-gerais')
            .then(res => res.json())
            .then(data => setStats(data))
            .catch(err => console.error("Erro ao carregar estatísticas:", err));
    }, []);

    const toggleSetor = () => {
        const novoStatus = !setorAberto;
        const novaMensagem = novoStatus ? "Funcionamento normal." : "Setor fechado.";

        fetch(`http://localhost:8080/api/admin/status-setor?status=${novoStatus}&mensagem=${novaMensagem}`, {
            method: 'PUT'
        }).then(() => {
            setSetorAberto(novoStatus);
        });
    };

    const formatarData = (data) => {
        const opcoes = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
        const dataStr = data.toLocaleDateString('pt-BR', opcoes);
        const horaStr = data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        return `${dataStr} - ${horaStr}`;
    };

    return (
        <div className="admin-container">
            <aside className="admin-sidebar">
                <div className="sidebar-logo">
                    {/* Substituído o bloco branco pelo ícone de Usuário[cite: 17] */}
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
                    {/* Alinhamento corrigido: Título e Data lado a lado */}
                    <div className="header-left">
                        <div className="title-row">
                            <h1>Painel Administrativo</h1>
                            <p className="data-header"><Clock size={16} /> {formatarData(dataAtual)}</p>
                        </div>
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
                            <span className="badge-ocupacao">{ocupacao}</span>
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
                <div className="help-fab"><HelpCircle size={24} /></div>
            </main>
        </div>
    );
}