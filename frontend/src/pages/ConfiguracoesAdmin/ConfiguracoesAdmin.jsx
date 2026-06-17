import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard, ListOrdered, Settings,
    Clock, DollarSign, Save, BarChart3, Users,
    CheckCircle, XCircle // Novos ícones para as mensagens
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './ConfiguracoesAdmin.css';

export default function ConfiguracoesAdmin() {
    const navigate = useNavigate();

    // Estado para os Preços (IDs 1, 2, 3 e 4)
    const [precos, setPrecos] = useState({
        pb: '',
        colorido: '',
        encBase: '',
        encFolha: ''
    });

    // Estado para os Horários (7 dias com turnos M, T, N)
    const [horarios, setHorarios] = useState([]);

    // --- NOVO ESTADO PARA NOTIFICAÇÕES ---
    const [notificacao, setNotificacao] = useState({
        visivel: false,
        texto: '',
        tipo: '' // 'sucesso' ou 'erro'
    });

    // Função auxiliar para disparar a mensagem
    const avisar = (texto, tipo) => {
        setNotificacao({ visivel: true, texto, tipo });
        // Esconde a mensagem automaticamente após 4 segundos
        setTimeout(() => setNotificacao({ ...notificacao, visivel: false }), 4000);
    };

    useEffect(() => {
        // Busca Preços
        fetch('https://api-impressoes-kayque-99.onrender.com/api/admin/servicos')
            .then(res => res.json())
            .then(data => {
                setPrecos({
                    pb: data.find(s => s.idServico === 1)?.precoUnitario || 0,
                    colorido: data.find(s => s.idServico === 2)?.precoUnitario || 0,
                    encBase: data.find(s => s.idServico === 3)?.precoUnitario || 0,
                    encFolha: data.find(s => s.idServico === 4)?.precoUnitario || 0
                });
            })
            .catch(err => console.error("Erro ao buscar preços:", err));

        // Busca Horários[cite: 15]
        fetch('https://api-impressoes-kayque-99.onrender.com/api/horarios')
            .then(res => res.json())
            .then(data => setHorarios(data))
            .catch(err => console.error("Erro ao buscar horários:", err));
    }, []);

    // Função para salvar preços (Alert substituído)[cite: 15]
    const salvarAlteracoesPreco = async () => {
        try {
            await Promise.all([
                fetch(`https://api-impressoes-kayque-99.onrender.com/api/admin/servicos/1/preco?novoPreco=${precos.pb}`, { method: 'PATCH' }),
                fetch(`https://api-impressoes-kayque-99.onrender.com/api/admin/servicos/2/preco?novoPreco=${precos.colorido}`, { method: 'PATCH' }),
                fetch(`https://api-impressoes-kayque-99.onrender.com/api/admin/servicos/3/preco?novoPreco=${precos.encBase}`, { method: 'PATCH' }),
                fetch(`https://api-impressoes-kayque-99.onrender.com/api/admin/servicos/4/preco?novoPreco=${precos.encFolha}`, { method: 'PATCH' })
            ]);
            avisar("Preços atualizados com sucesso!", "sucesso");
        } catch (error) {
            avisar("Erro ao salvar preços. Verifique a conexão.", "erro");
        }
    };

    const handleHorarioChange = (id, turno, valor) => {
        setHorarios(prev => prev.map(h =>
            h.idHorario === id ? { ...h, [turno]: valor } : h
        ));
    };

    // Função para salvar horários (Alert substituído)[cite: 15]
    const salvarTodosHorarios = async () => {
        try {
            await Promise.all(horarios.map(h =>
                fetch(`https://api-impressoes-kayque-99.onrender.com/api/horarios/${h.idHorario}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(h)
                })
            ));
            avisar("Horários atualizados com sucesso!", "sucesso");
        } catch (error) {
            avisar("Erro ao salvar horários. Tente novamente.", "erro");
        }
    };

    return (
        <div className="admin-container">
            {/* --- COMPONENTE DE NOTIFICAÇÃO --- */}
            {notificacao.visivel && (
                <div className={`toast-notificacao ${notificacao.tipo}`}>
                    {notificacao.tipo === 'sucesso' ? <CheckCircle size={20} /> : <XCircle size={20} />}
                    <span>{notificacao.texto}</span>
                </div>
            )}

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
                    <div className="nav-item" onClick={() => navigate('/admin/fila-pedidos')}>
                        <ListOrdered size={20} /> <span>Fila de Pedidos</span>
                    </div>
                    <div className="nav-item" onClick={() => navigate('/admin/gerenciar-usuarios')}>
                        <Users size={20} /> <span>Gerenciar Usuários</span>
                    </div>
                    <div className="nav-item active">
                        <Settings size={20} /> <span>Configurações</span>
                    </div>
                    <div className="nav-item" onClick={() => navigate('/admin/relatorios')}>
                        <BarChart3 size={20} /> <span>Relatórios</span>
                    </div>
                </nav>
            </aside>

            <main className="admin-main">
                <header className="config-page-header">
                    <h1>Configurações do Sistema</h1>
                    <p>Gerencie os valores e horários salvos no banco de dados</p>
                </header>

                <div className="config-grid">
                    <section className="config-card">
                        <div className="card-header">
                            <div className="icon-box blue"><DollarSign size={20} /></div>
                            <h3 className="titulo-card-config">Tabela de Preços</h3>
                        </div>

                        <div className="input-group-config">
                            <label>Impressão P&B (ID 1)</label>
                            <input type="number" value={precos.pb} onChange={e => setPrecos({ ...precos, pb: e.target.value })} />
                        </div>
                        <div className="input-group-config">
                            <label>Impressão Colorida (ID 2)</label>
                            <input type="number" value={precos.colorido} onChange={e => setPrecos({ ...precos, colorido: e.target.value })} />
                        </div>
                        <div className="input-group-config">
                            <label>Encadernação - Valor Base (ID 3)</label>
                            <input type="number" value={precos.encBase} onChange={e => setPrecos({ ...precos, encBase: e.target.value })} />
                        </div>
                        <div className="input-group-config">
                            <label>Encadernação - Adicional Folha (ID 4)</label>
                            <input type="number" value={precos.encFolha} onChange={e => setPrecos({ ...precos, encFolha: e.target.value })} />
                        </div>

                        <button className="btn-salvar-config" onClick={salvarAlteracoesPreco}>
                            <Save size={18} /> Salvar Alterações de Preço
                        </button>
                    </section>

                    <section className="config-card">
                        <div className="card-header">
                            <div className="icon-box dark-blue"><Clock size={20} /></div>
                            <h3 className="titulo-card-config">Gerenciar Horários</h3>
                        </div>

                        <div className="lista-edicao-horarios">
                            {horarios.map((h) => (
                                <div className="dia-edicao-item" key={h.idHorario}>
                                    <span className="dia-nome-edicao">{h.diaSemana}</span>
                                    <div className="turnos-input-row">
                                        <div className="input-turno">
                                            <span>M:</span>
                                            <input type="text" value={h.manha} onChange={e => handleHorarioChange(h.idHorario, 'manha', e.target.value)} />
                                        </div>
                                        <div className="input-turno">
                                            <span>T:</span>
                                            <input type="text" value={h.tarde} onChange={e => handleHorarioChange(h.idHorario, 'tarde', e.target.value)} />
                                        </div>
                                        <div className="input-turno">
                                            <span>N:</span>
                                            <input type="text" value={h.noite} onChange={e => handleHorarioChange(h.idHorario, 'noite', e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button className="btn-salvar-config" onClick={salvarTodosHorarios}>
                            <Save size={18} /> Salvar Horários
                        </button>
                    </section>
                </div>
            </main>
        </div>
    );
}