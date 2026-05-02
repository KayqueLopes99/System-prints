import React, { useState, useEffect } from 'react';
import { LayoutDashboard, ListOrdered, Settings, Users, BarChart3, Download, FileText, DollarSign, UserCheck, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import './Relatorios.css';

export default function Relatorios() {
    const navigate = useNavigate();
    const [dados, setDados] = useState(null);

    useEffect(() => {
        // Busca os dados do AdminController[cite: 4]
        fetch('http://localhost:8080/api/admin/relatorios')
            .then(res => res.json())
            .then(data => {
                // Conversão de MAP para ARRAY (O que o Recharts entende)
                const pizzaArray = Object.entries(data.distribuicaoServicos).map(([name, value]) => ({ name, value }));
                const linhaArray = Object.entries(data.evolucaoReceitaMensal).map(([month, value]) => ({ month, value }));
                
                setDados({ ...data, pizzaArray, linhaArray });
            })
            .catch(err => console.error("Erro ao carregar relatórios:", err));
    }, []);

    const COLORS = ['#1a3a6d', '#2e7d32', '#fbc02d'];

    if (!dados) return <div className="loading-admin">Carregando gráficos do banco...</div>;

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
                    <div className="nav-item" onClick={() => navigate('/admin')}><LayoutDashboard size={20} /> <span>Dashboard</span></div>
                    <div className="nav-item" onClick={() => navigate('/admin/pedidos')}><ListOrdered size={20} /> <span>Fila de Pedidos</span></div>
                    <div className="nav-item" onClick={() => navigate('/admin/gerenciar-usuarios')}><Users size={20} /> <span>Gerenciar Usuários</span></div>
                    <div className="nav-item" onClick={() => navigate('/admin/configuracoes')}>
                                            <Settings size={20} /> <span>Configurações</span>
                                        </div>
                    <div className="nav-item active"><BarChart3 size={20} /> <span>Relatórios</span></div>
                </nav>
            </aside>

            <main className="admin-main">
                <header className="report-header">
                    <div className="header-info">
                        <h1>Relatórios</h1>
                        <p>Análise de desempenho UFERSA</p>
                    </div>
                   
                </header>

                {/* CARDS COM DADOS REAIS DO BACKEND[cite: 3] */}
                <div className="stats-grid">
                    <div className="stat-card-mini">
                        <div className="card-top"><div className="icon-wrap blue"><FileText size={20} /></div></div>
                        <h2>{dados.totalImpressoesMes}</h2>
                        <span>Impressões (Mês)</span>
                    </div>
                    <div className="stat-card-mini">
                        <div className="card-top"><div className="icon-wrap green"><DollarSign size={20} /></div></div>
                        <h2>R$ {dados.receitaTotalMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h2>
                        <span>Receita Total Mensal</span>
                    </div>
                    <div className="stat-card-mini">
                        <div className="card-top"><div className="icon-wrap yellow"><UserCheck size={20} /></div></div>
                        <h2>{dados.usuariosAtivosMes}</h2>
                        <span>Usuários Ativos</span>
                    </div>
                    <div className="stat-card-mini">
                        <div className="card-top"><div className="icon-wrap blue"><TrendingUp size={20} /></div></div>
                        <h2>R$ {dados.ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h2>
                        <span>Ticket Médio Mensal</span>
                    </div>
                </div>

                <div className="charts-main-grid">
                    {/* GRÁFICO DE PIZZA (Distribuição)[cite: 3] */}
                    <section className="chart-card">
                        <h3>Distribuição por Tipo de Serviço</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={dados.pizzaArray} innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                                    {dados.pizzaArray.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </section>

                    {/* GRÁFICO DE LINHA (Evolução Mensal)[cite: 3] */}
                    <section className="chart-card">
                        <h3>Evolução da Receita Mensal</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={dados.linhaArray}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="value" stroke="#2e7d32" strokeWidth={3} name="Receita" />
                            </LineChart>
                        </ResponsiveContainer>
                    </section>
                </div>
            </main>
        </div>
    );
}