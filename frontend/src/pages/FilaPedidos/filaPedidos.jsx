import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard, ListOrdered, Users, Settings,
    Clock, Bell, LogOut, Eye, BarChart3, Search, Filter
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './filaPedidos.css';

export default function FilaPedidos() {
    const navigate = useNavigate();
    const [pedidos, setPedidos] = useState([]);
    const [dataAtual, setDataAtual] = useState(new Date());

    const [filtroTexto, setFiltroTexto] = useState('');
    const [filtroStatus, setFiltroStatus] = useState('TODOS');

    useEffect(() => {
        const timer = setInterval(() => setDataAtual(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const carregarFila = () => {
        axios.get('http://localhost:8080/api/pedidos/admin/fila', {
            params: {
                termo: filtroTexto,
                status: filtroStatus
            }
        })
            .then(res => setPedidos(Array.isArray(res.data) ? res.data : []))
            .catch(err => console.error("Erro ao carregar fila:", err));
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            carregarFila();
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [filtroTexto, filtroStatus]);

    const formatarDataHeader = (data) => {
        const opcoes = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
        return `${data.toLocaleDateString('pt-BR', opcoes)} - ${data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    };

    return (
        <div className="admin-container">
            <aside className="admin-sidebar">
                <div className="sidebar-logo">
                    <div className="logo-icon-circle"><Settings size={24} color="#1a3a6d" /></div>
                    <div className="logo-text">
                        <span className="ufersa-txt">Xerox</span>
                        <span className="admin-txt">Administrador</span>
                    </div>
                </div>
                <nav className="sidebar-nav">
                    <div className="nav-item" onClick={() => navigate('/admin')}>
                        <LayoutDashboard size={20} /> <span>Dashboard</span>
                    </div>
                    <div className="nav-item active">
                        <ListOrdered size={20} /> <span>Fila de Pedidos</span>
                    </div>
                    <div className="nav-item" onClick={() => navigate('/admin/gerenciar-usuarios')}>
                        <Users size={20} /> <span>Gerenciar Usuários</span>
                    </div>
                    <div className="nav-item" onClick={() => navigate('/admin/configuracoes')}>
                        <Settings size={20} /> <span>Configurações</span>
                    </div>
                    <div className="nav-item" onClick={() => navigate('/admin/relatorios')}><BarChart3 size={20} /> <span>Relatórios</span></div>
                </nav>
                <div className="sidebar-footer">
                    <span>Sistema de Impressão v1.0</span>
                </div>
            </aside>

            <main className="admin-main">
                <header className="admin-header">
                    <div className="header-left">
                        <h1>Fila de Pedidos</h1>
                        <p className="data-header"><Clock size={16} /> {formatarDataHeader(dataAtual)}</p>
                    </div>
                    <div className="header-actions">
                        <button className="icon-btn" onClick={() => navigate('/admin/notificar')} title="Enviar Notificação Geral"><Bell size={20} /></button>
                        <button className="logout-btn" onClick={() => navigate('/')}>
                            <LogOut size={18} /> Sair
                        </button>
                    </div>
                </header>

                <section className="pedidos-full-section">
                    <div className="filtros-fila-wrapper">
                        <div className="search-box-admin">
                            <Search size={18} className="search-icon-svg" />
                            <input
                                type="text"
                                placeholder="Buscar por ID, nome ou arquivo..."
                                value={filtroTexto}
                                onChange={(e) => setFiltroTexto(e.target.value)}
                            />
                        </div>
                        <div className="select-status-wrapper">
                            <Filter size={16} className="filter-icon-svg" />
                            <select
                                value={filtroStatus}
                                onChange={(e) => setFiltroStatus(e.target.value)}
                            >
                                <option value="TODOS">Todos Status</option>
                                <option value="PENDENTE">Pendente</option>
                                <option value="PRONTO">Pronto para Retirada</option>
                                <option value="CONCLUIDO">Concluído</option>
                                <option value="CANCELADO">Cancelado</option>
                            </select>
                        </div>
                    </div>

                    <div className="table-container">
                        <table className="pedidos-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Estudante</th>
                                    <th>Arquivo</th>
                                    <th>Serviço</th>
                                    <th>Data / Hora</th>
                                    <th>Status</th>
                                    <th style={{ textAlign: 'center' }}>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pedidos.length > 0 ? (
                                    pedidos.map((p) => (
                                        <tr key={p.idPedido}>
                                            <td className="id-cell"># {p.idPedido}</td>
                                            <td className="student-name">{p.nomeEstudante || 'Usuário'}</td>
                                            <td className="file-name">{p.nomeArquivo || 'Sem nome'}</td>
                                            <td>{p.tipoServico || 'Impressão'}</td>
                                            <td className="time-cell">
                                                {p.dataHora ? (
                                                    new Date(p.dataHora).toLocaleString('pt-BR', {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })
                                                ) : '--/-- --:--'}
                                            </td>
                                            <td>
                                                <span className={`status-badge ${(p.status || 'PENDENTE').toLowerCase()}`}>
                                                    {p.status || 'PENDENTE'}
                                                </span>
                                            </td>

                                            <td className="actions-cell">
                                                <button
                                                    className="action-btn view"
                                                    title="Visualizar Detalhes"
                                                    onClick={() => navigate(`/pedidos-detalhe/${p.idPedido}`)}
                                                >
                                                    <Eye size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                                            Nenhum pedido encontrado.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>
        </div>
    );
}