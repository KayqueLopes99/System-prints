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
    const [pedidos, setPedidos] = useState([]);

    const [infoFila, setInfoFila] = useState({
        tempo: '...',
        nivel: 'Carregando...',
        quantidade: 0
    });

    const [stats, setStats] = useState({
        pendentes: 0,
        aguardandoRetirada: 0,
        concluidos: 0,
        cancelados: 0
    });

    useEffect(() => {
        const timer = setInterval(() => setDataAtual(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const carregarDados = () => {
        axios.get('http://localhost:8080/api/admin/estatisticas-gerais')
            .then(res => setStats({
                pendentes: res.data.pendentes || 0,
                aguardandoRetirada: res.data.processando || 0,
                concluidos: res.data.concluidos || 0,
                cancelados: res.data.cancelados || 0
            }))
            .catch(err => console.error("Erro estatísticas:", err));

        axios.get('http://localhost:8080/api/pedidos/admin/fila')
            .then(res => setPedidos(Array.isArray(res.data) ? res.data : []))
            .catch(err => console.error("Erro ao carregar fila:", err));

        axios.get(`http://localhost:8080/api/pedidos/fila/status-geral`)
            .then(res => {
                const nivel = res.data.nivelOcupacao === 'BAIXA' ? 'Fila Baixa' :
                    res.data.nivelOcupacao === 'MODERADA' ? 'Fila Moderada' : 'Fila Cheia';
                setInfoFila({
                    tempo: res.data.tempoEstimado,
                    nivel: nivel,
                    quantidade: res.data.quantidadePessoas
                });
            })
            .catch(err => console.error("Erro status fila:", err));
    };

    useEffect(() => {
        carregarDados();
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
                    <div className="logo-icon-circle"><Settings size={24} color="#1a3a6d" /></div>
                    <div className="logo-text">
                        <span className="ufersa-txt">UFERSA</span>
                        <span className="admin-txt">Administrador</span>
                    </div>
                </div>
                <nav className="sidebar-nav">
                    <div className="nav-item active" onClick={() => navigate('/admin')}><LayoutDashboard size={20} /> <span>Dashboard</span></div>
                    <div className="nav-item" onClick={() => navigate('/admin/pedidos')}><ListOrdered size={20} /> <span>Fila de Pedidos</span></div>
                    <div className="nav-item" onClick={() => navigate('/admin/gerenciar-usuarios')}><Users size={20} /> <span>Gerenciar Usuários</span></div>
                    <div className="nav-item" onClick={() => navigate('/admin/configuracoes')}>
                        <Settings size={20} /> <span>Configurações</span>
                    </div>
                    <div className="nav-item" onClick={() => navigate('/admin/relatorios')}><BarChart3 size={20} /> <span>Relatórios</span></div>
                </nav>
            </aside>

            <main className="admin-main">
                <header className="admin-header">
                    <div className="header-left">
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
                            <span className={`badge-ocupacao ${infoFila.nivel.replace(' ', '-').toLowerCase()}`}>
                                {infoFila.nivel} ({infoFila.quantidade} ped.)
                            </span>
                        </div>
                        <div className="header-actions">
                            <button className="icon-btn" onClick={() => navigate('/admin/notificar')} title="Enviar Notificação Geral"><Bell size={20} /></button>
                            <button className="logout-btn" onClick={() => navigate('/')}>
                                <LogOut size={18} /> Sair
                            </button>
                        </div>
                    </div>
                </header>

                <section className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon yellow"><Clock size={24} /></div>
                        <div className="stat-info"><span className="stat-value">{stats.pendentes}</span><span className="stat-label">Pendentes</span></div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon blue"><Printer size={24} /></div>
                        <div className="stat-info"><span className="stat-value">{stats.aguardandoRetirada}</span><span className="stat-label">Prontos</span></div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon green"><CheckCircle size={24} /></div>
                        <div className="stat-info"><span className="stat-value">{stats.concluidos}</span><span className="stat-label">Concluídos</span></div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon red"><XCircle size={24} /></div>
                        <div className="stat-info"><span className="stat-value">{stats.cancelados}</span><span className="stat-label">Cancelados</span></div>
                    </div>
                </section>

                <section className="pedidos-section">
                    <div className="section-header">
                        <h2>Fila de Pedidos</h2>
                    </div>

                    <div className="table-container">
                        <table className="pedidos-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Estudante</th>
                                    <th>Arquivo</th>
                                    <th>Serviço</th>
                                    <th>Horário</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pedidos.map((p) => (
                                    <tr key={p.idPedido}>
                                        <td className="id-cell"># {p.idPedido}</td>
                                        <td className="student-name">{p.nomeEstudante || 'Usuário'}</td>
                                        <td className="file-name">{p.nomeArquivo || 'Sem nome'}</td>
                                        <td>{p.tipoServico || 'Impressão'}</td>
                                        <td>{p.dataHora ? new Date(p.dataHora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '--:--'}</td>
                                        <td>
                                            <span className={`status-badge ${(p.status || 'PENDENTE').toLowerCase()}`}>
                                                {p.status || 'PENDENTE'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>
        </div>
    );
}