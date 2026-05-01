import React, { useState, useEffect } from 'react';
import { 
    LayoutDashboard, ListOrdered, Settings, Users, BarChart3,
    Search, UserPlus, X, Save, CheckCircle, XCircle 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './GerenciarUsuarios.css';

export default function GerenciarUsuarios() {
    const navigate = useNavigate();
    const [usuarios, setUsuarios] = useState([]);
    const [busca, setBusca] = useState('');
    const [mostrarModal, setMostrarModal] = useState(false);
    
    // Estado para o formulário de novo Administrador[cite: 17]
    const [novoAdmin, setNovoAdmin] = useState({
        nome: '',
        email: '',
        senha: '',
        cargo: ''
    });

    // Notificação (estilo Toast)
    const [notificacao, setNotificacao] = useState({ visivel: false, texto: '', tipo: '' });

    const avisar = (texto, tipo) => {
        setNotificacao({ visivel: true, texto, tipo });
        setTimeout(() => setNotificacao({ ...notificacao, visivel: false }), 4000);
    };

    // 🔄 Carregar usuários do banco
    const carregarUsuarios = (termo = '') => {
        const url = termo 
            ? `http://localhost:8080/api/admin/usuarios?nome=${termo}` 
            : 'http://localhost:8080/api/admin/usuarios';
            
        fetch(url)
            .then(res => res.json())
            .then(data => setUsuarios(data))
            .catch(err => console.error("Erro ao carregar usuários:", err));
    };

    useEffect(() => carregarUsuarios(), []);

    // 🔍 Busca dinâmica ao digitar
    useEffect(() => {
        const timer = setTimeout(() => carregarUsuarios(busca), 300);
        return () => clearTimeout(timer);
    }, [busca]);

    // ➕ Cadastrar Administrador Interno[cite: 18]
    const handleCadastrarAdmin = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:8080/api/admin/usuarios/admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(novoAdmin)
            });

            if (response.ok) {
                avisar("Administrador cadastrado com sucesso!", "sucesso");
                setMostrarModal(false);
                setNovoAdmin({ nome: '', email: '', senha: '', cargo: '' });
                carregarUsuarios();
            } else {
                avisar("Erro ao cadastrar. Verifique os dados.", "erro");
            }
        } catch (error) {
            avisar("Erro de conexão com o servidor.", "erro");
        }
    };

    return (
        <div className="admin-container">
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
                        <span className="ufersa-txt">UFERSA</span>
                        <span className="admin-txt">Administrador</span>
                    </div>
                </div>
                <nav className="sidebar-nav">
                    <div className="nav-item" onClick={() => navigate('/admin')}><LayoutDashboard size={20} /> <span>Dashboard</span></div>
                    <div className="nav-item" onClick={() => navigate('/admin/pedidos')}><ListOrdered size={20} /> <span>Fila de Pedidos</span></div>
                    <div className="nav-item active"><Users size={20} /> <span>Gerenciar Usuários</span></div>
                    <div className="nav-item" onClick={() => navigate('/admin/configuracoes')}><Settings size={20} /> <span>Configurações</span></div>
                    <div className="nav-item" onClick={() => navigate('/admin/relatorios')}><BarChart3 size={20} /> <span>Relatórios</span></div>
                </nav>
            </aside>

            <main className="admin-main">
                <header className="page-header-user">
                    <div className="header-info">
                        <h1>Gerenciar Usuários</h1>
                        <p>Administre estudantes e cadastre novos administradores internos</p>
                    </div>
                    <button className="btn-cadastrar-admin" onClick={() => setMostrarModal(true)}>
                        <UserPlus size={18} /> Cadastrar Administrador Interno
                    </button>
                </header>

                <section className="table-container-user">
                    <div className="search-bar-user">
                        <Search size={20} color="#888" />
                        <input 
                            type="text" 
                            placeholder="Buscar por nome ou email..." 
                            value={busca}
                            onChange={(e) => setBusca(e.target.value)}
                        />
                    </div>

                    <table className="user-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nome</th>
                                <th>Email</th>
                                <th>Tipo</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usuarios.map((u) => (
                                <tr key={u.idUsuario}>
                                    <td className="id-col">
                                        {u.tipo_usuario === 'ADMINISTRADOR' ? `ADM-${String(u.idUsuario).padStart(3, '0')}` : `USR-${String(u.idUsuario).padStart(3, '0')}`}
                                    </td>
                                    <td>{u.nomeCompleto}</td>
                                    <td>{u.email}</td>
                                    <td>
                                        <span className={`badge-tipo ${u.tipo_usuario.toLowerCase()}`}>
                                            {u.tipo_usuario === 'ADMINISTRADOR' ? 'Administrador' : 'Estudante'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
            </main>

            {/* MODAL DE CADASTRO */}
            {mostrarModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Novo Administrador</h3>
                            <button onClick={() => setMostrarModal(false)}><X size={24} /></button>
                        </div>
                        <form onSubmit={handleCadastrarAdmin}>
                            <div className="form-group">
                                <label>Nome Completo</label>
                                <input type="text" required value={novoAdmin.nome} onChange={e => setNovoAdmin({...novoAdmin, nome: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label>Email Institucional</label>
                                <input type="email" required value={novoAdmin.email} onChange={e => setNovoAdmin({...novoAdmin, email: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label>Cargo/Setor</label>
                                <input type="text" required value={novoAdmin.cargo} onChange={e => setNovoAdmin({...novoAdmin, cargo: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label>Senha Temporária</label>
                                <input type="password" required value={novoAdmin.senha} onChange={e => setNovoAdmin({...novoAdmin, senha: e.target.value})} />
                            </div>
                            <button type="submit" className="btn-save-modal">
                                <Save size={18} /> Salvar Administrador
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}