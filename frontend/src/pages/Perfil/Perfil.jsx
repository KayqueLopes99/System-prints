import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, BookOpen, GraduationCap, Lock, Trash2, Edit2, Save, LogOut } from 'lucide-react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import axios from 'axios';
import './Perfil.css';

export default function Perfil() {
    const navigate = useNavigate();
    const [editando, setEditando] = useState(false);
    const [mostrarSenha, setMostrarSenha] = useState(false);

    const [feedback, setFeedback] = useState(null);

    const [perfil, setPerfil] = useState({
        nomeCompleto: '',
        email: '',
        matricula: '',
        curso: '',
        senha: ''
    });

    const idUsuarioLogado = localStorage.getItem('usuarioId') || 1;

    useEffect(() => {
        if (feedback) {
            const timer = setTimeout(() => setFeedback(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [feedback]);

    useEffect(() => {
        axios.get(`https://backend-impressoes-ufersa.onrender.com/api/usuarios/${idUsuarioLogado}`)
            .then(response => {
                setPerfil({
                    nomeCompleto: response.data.nomeCompleto || '',
                    email: response.data.email || '',
                    matricula: response.data.matricula || '',
                    curso: response.data.curso || '',
                    senha: ''
                });
            })
            .catch(error => {
                console.error("Erro ao carregar perfil:", error);
                setPerfil({ nomeCompleto: 'Erro ao carregar', email: '', matricula: '', curso: '', senha: '' });
            });
    }, [idUsuarioLogado]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPerfil(prev => ({ ...prev, [name]: value }));
    };

    const salvarPerfil = async () => {
        try {
            const dadosParaEnviar = { ...perfil };
            if (!dadosParaEnviar.senha || dadosParaEnviar.senha.trim() === "") {
                delete dadosParaEnviar.senha;
            }

            await axios.put(`https://backend-impressoes-ufersa.onrender.com/api/usuarios/${idUsuarioLogado}`, dadosParaEnviar);

            setFeedback({ texto: "Perfil atualizado com sucesso!", tipo: "sucesso" });
            setEditando(false);
        } catch (error) {
            const msgErro = error.response?.data?.message || "Erro desconhecido";
            setFeedback({ texto: "Erro ao salvar: " + msgErro, tipo: "erro" });
        }
    };

    const limparCache = () => {
        localStorage.clear();
        sessionStorage.clear();

        setFeedback({ texto: "Cache limpo! Redirecionando...", tipo: "sucesso" });
        setTimeout(() => navigate('/'), 1500);
    };

    const sairDaConta = () => {
        localStorage.clear();
        sessionStorage.clear();
        navigate('/');
    };

    return (
        <div className="perfil-container">

            {feedback && (
                <div className={`feedback-perfil feedback-${feedback.tipo}`}>
                    {feedback.texto}
                </div>
            )}

            <header className="perfil-header">
                <ArrowLeft size={28} color="#1d448b" onClick={() => navigate('/estudante')} style={{ cursor: 'pointer' }} />
                <h2>Meu Perfil</h2>
                <div style={{ width: 28 }}></div>
            </header>

            <main className="perfil-conteudo">
                <div className="card-dados">
                    <div className="cabecalho-card">
                        <h3>Dados Pessoais</h3>
                        {editando ? (
                            <button className="btn-acao btn-salvar" onClick={salvarPerfil}>
                                <Save size={18} /> Salvar
                            </button>
                        ) : (
                            <button className="btn-acao btn-editar" onClick={() => setEditando(true)}>
                                <Edit2 size={18} /> Editar
                            </button>
                        )}
                    </div>

                    <div className="campo-grupo">
                        <label><User size={16} /> Nome Completo</label>
                        <input
                            type="text"
                            name="nomeCompleto"
                            value={perfil.nomeCompleto}
                            onChange={handleInputChange}
                            disabled={!editando}
                        />
                    </div>

                    <div className="campo-grupo">
                        <label><Mail size={16} /> E-mail</label>
                        <input
                            type="email"
                            name="email"
                            value={perfil.email}
                            onChange={handleInputChange}
                            disabled={!editando}
                        />
                    </div>

                    <div className="campo-grupo">
                        <label><GraduationCap size={18} /> Matrícula</label>
                        <input
                            type="text"
                            name="matricula"
                            value={perfil.matricula}
                            onChange={handleInputChange}
                            disabled={!editando}
                        />
                    </div>

                    <div className="campo-grupo">
                        <label><BookOpen size={16} /> Curso</label>
                        <input
                            type="text"
                            name="curso"
                            value={perfil.curso}
                            onChange={handleInputChange}
                            disabled={!editando}
                        />
                    </div>

                    {editando && (
                        <div className="campo-grupo destaque-senha">
                            <label><Lock size={16} /> Nova Senha (Opcional)</label>
                            <div className="input-wrapper-senha">
                                <input
                                    type={mostrarSenha ? "text" : "password"}
                                    name="senha"
                                    placeholder="Digite para alterar sua senha"
                                    value={perfil.senha}
                                    onChange={handleInputChange}
                                    style={{ paddingRight: '40px' }}
                                />
                                <button
                                    type="button"
                                    className="btn-mostrar-senha-perfil"
                                    onClick={() => setMostrarSenha(!mostrarSenha)}
                                >
                                    {mostrarSenha ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="area-perigo" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '12px' }}>
                    <h3>Configurações Adicionais</h3>

                    <button className="btn-limpar-cache" onClick={limparCache} style={{ width: '100%', maxWidth: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                        <Trash2 size={20} />
                        Limpar Cache do Aplicativo
                    </button>

                    <button className="btn-sair" onClick={sairDaConta} style={{ width: '100%', maxWidth: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                        <LogOut size={20} />
                        Sair da Conta
                    </button>
                </div>
            </main>
        </div>
    );
}