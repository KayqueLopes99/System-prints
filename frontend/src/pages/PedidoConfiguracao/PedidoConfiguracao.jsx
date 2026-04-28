import React, { useState, useEffect } from 'react';
import {
    ChevronLeft, Upload, FileText, Check, X,
    Minus, Plus, ChevronDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './PedidoConfiguracao.css';

export default function PedidoConfiguracao() {
    const navigate = useNavigate();

    // Estados do Arquivo
    const [arquivo, setArquivo] = useState(null);
    const [arquivoUrl, setArquivoUrl] = useState(null);
    const [isPdf, setIsPdf] = useState(false); // Para mostrar o preview ou não

    // O usuário vai digitar manualmente quantas páginas tem o arquivo
    const [paginasAImprimir, setPaginasAImprimir] = useState(1);

    // Estados de Configuração
    const [tamanhoPapel, setTamanhoPapel] = useState('A4');
    const [tipoCor, setTipoCor] = useState('PRETO_BRANCO');
    const [orientacao, setOrientacao] = useState('RETRATO');
    const [frenteVerso, setFrenteVerso] = useState(false);
    const [quantidade, setQuantidade] = useState(1);

    const [valorTotal, setValorTotal] = useState(0.00);
    const sugestoesFormato = ['A4', 'A3'];

    // Lógica de cálculo de valor
    useEffect(() => {
        const precoBase = tipoCor === 'PRETO_BRANCO' ? 0.15 : 1.00;
        const paginasValidas = Number(paginasAImprimir) || 1;
        const calculo = (precoBase * paginasValidas) * quantidade;
        setValorTotal(calculo);
    }, [tipoCor, quantidade, paginasAImprimir, frenteVerso]);

    const processarArquivo = (file) => {
        if (!file) return;

        const isFilePdf = file.type === 'application/pdf';
        setIsPdf(isFilePdf);

        setArquivo({
            nome: file.name,
            tamanhoMb: (file.size / (1024 * 1024)).toFixed(2)
        });

        // Gera a URL para o Iframe renderizar o PDF
        setArquivoUrl(URL.createObjectURL(file));

        // Reseta as páginas para 1 sempre que um arquivo novo entra
        setPaginasAImprimir(1);
    };

    const handleFileUpload = (event) => {
        processarArquivo(event.target.files[0]);
    };

    const handleDragOver = (event) => {
        event.preventDefault();
    };

    const handleDrop = (event) => {
        event.preventDefault();
        processarArquivo(event.dataTransfer.files[0]);
    };

    const removerArquivo = () => {
        setArquivo(null);
        setArquivoUrl(null);
        setIsPdf(false);
        setPaginasAImprimir(1);
        setQuantidade(1);
    };

    const prepararPedidoDTO = () => {
        // Monta os dados capturados
        const dadosParaResumo = {
            idUsuario: 1,
            nomeArquivo: arquivo.nome,
            totalPaginas: Number(paginasAImprimir),
            tamanhoMb: parseFloat(arquivo.tamanhoMb),
            quantidade: quantidade,
            tamanhoPapel: tamanhoPapel,
            orientacao: orientacao,
            frenteVerso: frenteVerso,
            tipoCor: tipoCor,
            valorTotal: valorTotal // Passa o valor calculado
        };

        // 👉 NAVEGA PARA A TELA DE PAGAMENTO
        navigate('/resumo-pagamento', { state: dadosParaResumo });
    };

    const handleMudancaPaginas = (e) => {
        const valorDigitado = e.target.value;

        if (valorDigitado === '') {
            setPaginasAImprimir('');
            return;
        }

        let valor = parseInt(valorDigitado) || 1;

        if (valor < 1) {
            valor = 1;
        }

        setPaginasAImprimir(valor);
    };

    const handleBlurPaginas = () => {
        if (paginasAImprimir === '' || paginasAImprimir < 1) {
            setPaginasAImprimir(1);
        }
    };

    return (
        <div className="config-pedido-container">
            <header className="config-header">
                <button className="btn-voltar-topo" onClick={() => navigate(-1)}>
                    <ChevronLeft size={24} />
                </button>
                <h1>Nova Impressão</h1>
            </header>

            <main className="config-content">
                {!arquivo ? (
                    <section className="secao-upload">
                        <p className="subtitulo-config">Selecione o arquivo que deseja</p>

                        <div
                            className="caixa-upload"
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                        >
                            <Upload size={48} color="#1d448b" strokeWidth={1.5} />
                            <p>Arraste e solte seu arquivo aqui ou</p>
                            <label htmlFor="input-file" className="btn-selecionar">
                                Selecionar Arquivo
                            </label>
                            <input
                                type="file"
                                id="input-file"
                                hidden
                                accept=".pdf,.doc,.docx"
                                onChange={handleFileUpload}
                            />
                            <span className="info-formatos">Formatos aceitos: PDF, DOC ou DOCX até 50MB</span>
                        </div>
                    </section>
                ) : (
                    <>
                        <section className="secao-visualizacao">
                            <h2 className="titulo-secao-interna">Visualização</h2>

                            <div className="card-arquivo">
                                <div className="faixa-sucesso">
                                    <div className="status-ok">
                                        <Check size={16} /> Arquivo Carregado
                                    </div>
                                    <button className="btn-remover" onClick={removerArquivo}>
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="info-doc-carregado">
                                    <FileText size={40} color="#1d448b" />
                                    <div className="detalhes-texto">
                                        <strong>{arquivo.nome}</strong>
                                        <div className="meta-info">
                                            <span><Upload size={14} /> {arquivo.tamanhoMb} MB</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {isPdf ? (
                                <div className="preview-documento-real">
                                    <iframe src={arquivoUrl} title="Visualização do Documento" className="iframe-preview"></iframe>
                                </div>
                            ) : (
                                <div className="preview-indisponivel">
                                    <FileText size={50} color="#ccc" />
                                    <p style={{ marginTop: '15px', fontWeight: 'bold' }}>A visualização direta está disponível apenas para PDF.</p>
                                    <p style={{ fontSize: '14px', marginTop: '5px' }}>Seu arquivo foi carregado com sucesso. Configure os detalhes abaixo.</p>
                                </div>
                            )}
                        </section>

                        <section className="secao-configuracoes">

                            {/* Campo manual e obrigatório para as páginas */}
                            <div className="campo-input">
                                <label style={{ color: '#1d448b', fontWeight: 'bold' }}>
                                    Total de páginas do documento:
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={paginasAImprimir}
                                    onChange={handleMudancaPaginas}
                                    onBlur={handleBlurPaginas}
                                    className="input-paginas"
                                    style={{ borderColor: '#1d448b', borderWidth: '2px' }}
                                />
                            </div>

                            <div className="campo-dropdown">
                                <label>Formato da Folha</label>
                                <div className="select-wrapper">
                                    <select value={tamanhoPapel} onChange={(e) => setTamanhoPapel(e.target.value)}>
                                        {sugestoesFormato.map(f => <option key={f} value={f}>{f}</option>)}
                                    </select>
                                    <ChevronDown className="seta-dropdown" size={20} />
                                </div>
                            </div>

                            <div className="campo-dropdown">
                                <label>Cor</label>
                                <div className="select-wrapper">
                                    <select value={tipoCor} onChange={(e) => setTipoCor(e.target.value)}>
                                        <option value="PRETO_BRANCO">Preto e Branco</option>
                                        <option value="COLORIDO">Colorido</option>
                                    </select>
                                    <ChevronDown className="seta-dropdown" size={20} />
                                </div>
                            </div>

                            <div className="campo-dropdown">
                                <label>Orientação</label>
                                <div className="select-wrapper">
                                    <select value={orientacao} onChange={(e) => setOrientacao(e.target.value)}>
                                        <option value="RETRATO">Retrato</option>
                                        <option value="PAISAGEM">Paisagem</option>
                                    </select>
                                    <ChevronDown className="seta-dropdown" size={20} />
                                </div>
                            </div>

                            <div className="campo-dropdown">
                                <label>Frente e Verso</label>
                                <div className="select-wrapper">
                                    <select value={frenteVerso} onChange={(e) => setFrenteVerso(e.target.value === 'true')}>
                                        <option value="false">Apenas Frente</option>
                                        <option value="true">Frente e Verso</option>
                                    </select>
                                    <ChevronDown className="seta-dropdown" size={20} />
                                </div>
                            </div>

                            <div className="controle-quantidade">
                                <label>Quantidade de Cópias (Quantas vezes imprimir tudo isso)</label>
                                <div className="stepper">
                                    <button onClick={() => setQuantidade(q => Math.max(1, q - 1))}><Minus size={20} /></button>
                                    <span>{quantidade}</span>
                                    <button onClick={() => setQuantidade(q => q + 1)}><Plus size={20} /></button>
                                </div>
                            </div>

                            <div className="caixa-total">
                                <span>Total Estimado</span>
                                <span className="preco-total">
                                    {valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </span>
                            </div>
                        </section>
                    </>
                )}
            </main>

            <footer className="footer-acoes">
                <button className="btn-outline" onClick={() => navigate(-1)}>Voltar</button>
                <button
                    className="btn-filled"
                    disabled={!arquivo}
                    onClick={prepararPedidoDTO}
                >
                    Continuar
                </button>
            </footer>
        </div>
    );
}