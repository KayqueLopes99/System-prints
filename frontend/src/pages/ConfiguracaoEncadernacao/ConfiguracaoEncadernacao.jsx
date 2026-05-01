import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, Notebook, Plus, Minus, Upload, Check, X } from 'lucide-react'; //
import { useNavigate } from 'react-router-dom';
import './ConfiguracaoEncadernacao.css';

export default function ConfiguracaoEncadernacao() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    // Estados
    const [unidades, setUnidades] = useState(1);
    const [folhas, setFolhas] = useState(100);
    const [arquivo, setArquivo] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [total, setTotal] = useState(20.00);

    // 💰 Lógica de Cálculo
    useEffect(() => {
        const precoBaseEncadernacao = 5.00;
        const precoPorFolha = 0.15;
        const resultado = (precoBaseEncadernacao + (folhas * precoPorFolha)) * unidades;
        setTotal(resultado);
    }, [unidades, folhas]);

    // 👉 FUNÇÃO DE ROTEAMENTO ADICIONADA
    const avancarParaPagamento = () => {
        const idLogado = parseInt(localStorage.getItem('usuarioId'));
        const dadosParaEnvio = {      
            idUsuario: idLogado,
           
            nomeArquivo: arquivo ? arquivo.name : "Encadernação Manual",
            totalPaginas: folhas,
            tamanhoMb: arquivo ? parseFloat((arquivo.size / (1024 * 1024)).toFixed(2)) : 0,
            quantidade: unidades,
            valorTotal: total,
            tipoServico: "ENCADERNACAO",
            // Campos padrão para compatibilidade com o DTO do Java
            tamanhoPapel: "A4",
            orientacao: "RETRATO",
            frenteVerso: false,
            tipoCor: "PRETO_BRANCO"
        };

        // Navega enviando o estado para a tela de pagamento específica
        navigate('/pagamento-encadernacao', { state: dadosParaEnvio });
    };

    const alterarUnidades = (valor) => setUnidades(prev => Math.max(1, prev + valor));
    const alterarFolhas = (valor) => setFolhas(prev => Math.max(1, prev + valor));

    // Handlers de Drag and Drop
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && (file.type === "application/pdf" || file.name.endsWith(".doc") || file.name.endsWith(".docx"))) {
            setArquivo(file);
        } else {
            alert("Por favor, envie apenas arquivos PDF ou DOCX.");
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files[0]) setArquivo(e.target.files[0]);
    };

    return (
        <div className="encadernacao-page">
            <header className="header-encadernacao">
                <button className="btn-voltar-circulo" onClick={() => navigate(-1)}>
                    <ChevronLeft size={24} />
                </button>
                <div className="header-titulos">
                    <h1 className="titulo-principal">Serviço de Encadernação</h1>
                    <span className="subtitulo-principal">organize seu pedido</span>
                </div>
                <button className="btn-save-header">
                    <Notebook size={35} strokeWidth={1.5} /> {/* */}
                </button>
            </header>

            <main className="content-encadernacao">
                <section className="secao-controle">
                    <h2 className="label-secao">Unidades a encadernar</h2>
                    <div className="stepper-container">
                        <button className="step-btn step-minus" onClick={() => alterarUnidades(-1)}><Minus size={24} /></button>
                        <span className="step-value">{unidades}</span>
                        <button className="step-btn step-plus" onClick={() => alterarUnidades(1)}><Plus size={24} /></button>
                    </div>
                </section>

                <section className="secao-controle">
                    <h2 className="label-secao">Quantidade de folhas</h2>
                    <div className="stepper-container">
                        <button className="step-btn step-minus" onClick={() => alterarFolhas(-10)}><Minus size={24} /></button>
                        <span className="step-value">{folhas}</span>
                        <button className="step-btn step-plus" onClick={() => alterarFolhas(10)}><Plus size={24} /></button>
                    </div>
                </section>

                <section className="secao-upload-vincular">
                    <h2 className="label-secao">Arquivo para vincular (Opcional)</h2>
                    <div
                        className={`dropzone-encadernacao ${isDragging ? 'dragging' : ''}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current.click()}
                    >
                        <Upload size={40} className="icon-upload-blue" strokeWidth={1.5} />
                        <p className="text-drop">Arraste e solte seu arquivo aqui</p>
                        <span className="text-ou">ou</span>
                        <button className="btn-selecionar-file">Selecionar Arquivo</button>
                        <p className="text-small">PDF, DOC ou DOCX até 50MB</p>

                        {arquivo && (
                            <div className="arquivo-selecionado-card">
                                <div className="arquivo-info-detalhes">
                                    <div className="badge-sucesso">
                                        <Check size={14} strokeWidth={3} />
                                    </div>
                                    <span className="nome-arquivo-texto" title={arquivo.name}>
                                        {arquivo.name}
                                    </span>
                                </div>
                                <button
                                    className="btn-remover-arquivo-minimal"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setArquivo(null);
                                    }}
                                    title="Remover arquivo"
                                >
                                    <X size={16} strokeWidth={2.5} />
                                </button>
                            </div>
                        )}

                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                            accept=".pdf,.doc,.docx"
                        />
                    </div>
                </section>

                <div className="container-total-estimado">
                    <div className="caixa-total-azul">
                        <span className="label-total">Total Estimado:</span>
                        <span className="valor-total">
                            {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                    </div>
                </div>

                {/* 👉 BOTÃO ATUALIZADO COM ONCLICK */}
                <button className="btn-continuar-encadernacao" onClick={avancarParaPagamento}>
                    continuar
                </button>
            </main>
        </div>
    );
}