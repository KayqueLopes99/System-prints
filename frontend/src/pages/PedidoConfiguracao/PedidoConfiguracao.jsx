import React, { useState, useEffect } from 'react';
import {
    ChevronLeft, Upload, FileText, Check, X,
    Minus, Plus, ChevronDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './PedidoConfiguracao.css';
import * as pdfjsLib from 'pdfjs-dist';

// Link do worker para o pdfjs-dist
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.mjs',
    import.meta.url
).toString();

export default function PedidoConfiguracao() {
    const navigate = useNavigate();

    // --- ESTADOS DE DADOS DO BACKEND ---
    const [servicos, setServicos] = useState([]); // Armazena preços dinâmicos[cite: 8]
    const [setorAberto, setSetorAberto] = useState(true); // Status da gráfica[cite: 9]
    const [mensagemSetor, setMensagemSetor] = useState('');

    // Estados do Arquivo
    const [arquivo, setArquivo] = useState(null);
    const [arquivoUrl, setArquivoUrl] = useState(null);
    const [isPdf, setIsPdf] = useState(false);

    // Configurações do Pedido
    const [paginasAImprimir, setPaginasAImprimir] = useState(1);
    const [tamanhoPapel, setTamanhoPapel] = useState('A4');
    const [tipoCor, setTipoCor] = useState('PRETO_BRANCO');
    const [orientacao, setOrientacao] = useState('RETRATO');
    const [frenteVerso, setFrenteVerso] = useState(false);
    const [quantidade, setQuantidade] = useState(1);
    const [erroAviso, setErroAviso] = useState('');
    const [valorTotal, setValorTotal] = useState(0.00);

    const sugestoesFormato = ['A4', 'A3'];

    // --- BUSCA DADOS INICIAIS (PREÇOS E STATUS) ---
    useEffect(() => {
        // Busca os preços configurados pelo Admin[cite: 8]
        fetch('http://localhost:8080/api/admin/servicos')
            .then(res => res.json())
            .then(data => setServicos(data))
            .catch(err => console.error("Erro ao buscar preços:", err));

        // Busca o status atual da gráfica[cite: 9]
        fetch('http://localhost:8080/api/admin/status-setor')
            .then(res => res.json())
            .then(data => {
                setSetorAberto(data.setorAberto);
                setMensagemSetor(data.mensagemAviso);
            })
            .catch(err => console.error("Erro ao buscar status do setor:", err));
    }, []);

    // --- LÓGICA DE CÁLCULO DINÂMICA ATUALIZADA PARA NÃO ZERAR ---
    useEffect(() => {
        // 1. Define preços padrão (fallback) caso o banco ainda não tenha respondido
        let precoBase = tipoCor === 'PRETO_BRANCO' ? 0.15 : 1.00;

        // 2. Se o banco já carregou, busca o preço oficial pelo ID[cite: 11]
        if (servicos.length > 0) {
            // Nota: usamos id_servico para bater com a imagem do banco de dados
            const servicoAtual = servicos.find(s => 
                (s.id_servico || s.idServico) === (tipoCor === 'PRETO_BRANCO' ? 1 : 2)
            );

            if (servicoAtual) {
                precoBase = servicoAtual.preco_unitario || servicoAtual.precoUnitario;
            }
        }

        const paginasValidas = Number(paginasAImprimir) || 1;
        const calculo = (precoBase * paginasValidas) * quantidade;
        
        setValorTotal(calculo);
    }, [tipoCor, quantidade, paginasAImprimir, servicos]);

    const processarArquivo = async (file) => {
        if (!file) return;
        setErroAviso('');

        const isFilePdf = file.type === 'application/pdf';
        setIsPdf(isFilePdf);

        if (isFilePdf) {
            try {
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

                if (pdf.numPages > 120) {
                    setErroAviso(`O arquivo excede o limite de 120 páginas! (${pdf.numPages} páginas)`);
                    removerArquivo();
                    return;
                }
                setPaginasAImprimir(pdf.numPages);
            } catch (error) {
                setErroAviso("Erro ao ler o arquivo PDF.");
                return;
            }
        }

        setArquivo({
            nome: file.name,
            tamanhoMb: (file.size / (1024 * 1024)).toFixed(2)
        });
        setArquivoUrl(URL.createObjectURL(file));
    };

    const handleFileUpload = (event) => processarArquivo(event.target.files[0]);
    const handleDragOver = (e) => e.preventDefault();
    const handleDrop = (e) => {
        e.preventDefault();
        processarArquivo(e.dataTransfer.files[0]);
    };

    const removerArquivo = () => {
        setArquivo(null);
        setArquivoUrl(null);
        setIsPdf(false);
        setPaginasAImprimir(1);
        setQuantidade(1);
    };

    const prepararPedidoDTO = () => {
        const idLogado = parseInt(localStorage.getItem('usuarioId'));
        const dadosParaResumo = {
            idUsuario: idLogado,
            nomeArquivo: arquivo.nome,
            totalPaginas: Number(paginasAImprimir),
            tamanhoMb: parseFloat(arquivo.tamanhoMb),
            quantidade: quantidade,
            tamanhoPapel: tamanhoPapel,
            orientacao: orientacao,
            frenteVerso: frenteVerso,
            tipoCor: tipoCor,
            valorTotal: valorTotal
        };
        navigate('/resumo-pagamento', { state: dadosParaResumo });
    };

    const handleMudancaPaginas = (e) => {
        const valorDigitado = e.target.value;
        if (valorDigitado === '') { setPaginasAImprimir(''); return; }
        let valor = parseInt(valorDigitado) || 1;
        if (valor < 1) valor = 1;
        setPaginasAImprimir(valor);
    };

    const handleBlurPaginas = () => {
        if (paginasAImprimir === '' || paginasAImprimir < 1) setPaginasAImprimir(1);
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
                {!setorAberto && (
                    <div className="aviso-setor-fechado" style={{
                        backgroundColor: '#ffebee', color: '#c62828', padding: '15px',
                        borderRadius: '8px', marginBottom: '20px', border: '1px solid #ef9a9a',
                        fontWeight: 'bold', textAlign: 'center'
                    }}>
                        ⚠️ {mensagemSetor || "O setor de impressão está fechado no momento."}
                    </div>
                )}

                {erroAviso && <div className="erro-pdf">{erroAviso}</div>}

                {!arquivo ? (
                    <section className="secao-upload">
                        <p className="subtitulo-config">Selecione o arquivo que deseja</p>
                        <div className="caixa-upload" onDragOver={handleDragOver} onDrop={handleDrop}>
                            <Upload size={48} color="#1d448b" strokeWidth={1.5} />
                            <p>Arraste e solte seu arquivo aqui ou</p>
                            <label htmlFor="input-file" className="btn-selecionar">Selecionar Arquivo</label>
                            <input type="file" id="input-file" hidden accept=".pdf,.doc,.docx" onChange={handleFileUpload} />
                            <span className="info-formatos">Formatos aceitos: PDF, DOC ou DOCX até 50MB</span>
                        </div>
                    </section>
                ) : (
                    <>
                        <section className="secao-visualizacao">
                            <h2 className="titulo-secao-interna">Visualização</h2>
                            <div className="card-arquivo">
                                <div className="faixa-sucesso">
                                    <div className="status-ok"><Check size={16} /> Arquivo Carregado</div>
                                    <button className="btn-remover" onClick={removerArquivo}><X size={20} /></button>
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
                                    <iframe src={arquivoUrl} title="Visualização" className="iframe-preview"></iframe>
                                </div>
                            ) : (
                                <div className="preview-indisponivel">
                                    <FileText size={50} color="#ccc" />
                                    <p>A visualização direta está disponível apenas para PDF.</p>
                                </div>
                            )}
                        </section>

                        <section className="secao-configuracoes">
                            <div className="campo-input">
                                <label style={{ color: '#1d448b', fontWeight: 'bold' }}>Total de páginas:</label>
                                <input
                                    type="number" min="1" value={paginasAImprimir}
                                    onChange={handleMudancaPaginas} onBlur={handleBlurPaginas}
                                    readOnly={isPdf} className="input-paginas"
                                    style={{
                                        borderColor: '#1d448b', borderWidth: '2px',
                                        backgroundColor: isPdf ? '#3c3b3b' : '#3d3e3e',
                                        fontWeight: 'bold', cursor: isPdf ? 'not-allowed' : 'text'
                                    }}
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
                                <label>Quantidade de Cópias</label>
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
                    disabled={!arquivo || !setorAberto} 
                    onClick={prepararPedidoDTO}
                >
                    {setorAberto ? "Continuar" : "Indisponível"}
                </button>
            </footer>
        </div>
    );
}