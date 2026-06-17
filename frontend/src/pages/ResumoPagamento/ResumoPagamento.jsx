import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, QrCode, Banknote, CreditCard, Printer, CheckCircle2 } from 'lucide-react';
import './ResumoPagamento.css';

export default function ResumoPagamento() {
    const location = useLocation();
    const navigate = useNavigate();
    const dadosPedido = location.state; 

    const [metodoSelecionado, setMetodoSelecionado] = useState(null);
    const [carregando, setCarregando] = useState(false);


    const [modalSucesso, setModalSucesso] = useState(false);


    if (!dadosPedido) {
        return (
            <div className="erro-dados-container">
                <h2>Ops! Dados não encontrados.</h2>
                <button onClick={() => navigate('/novo-pedido')}>Voltar para o início</button>
            </div>
        );
    }

    const confirmarPedidoFinal = async () => {
        if (!metodoSelecionado) {
            alert("Por favor, selecione um método de pagamento.");
            return;
        }

        setCarregando(true);


        const payload = {
            idUsuario: parseInt(dadosPedido.idUsuario),
            nomeArquivo: dadosPedido.nomeArquivo,
            totalPaginas: dadosPedido.totalPaginas,
            tamanhoMb: dadosPedido.tamanhoMb,
            quantidade: dadosPedido.quantidade,
            tamanhoPapel: dadosPedido.tamanhoPapel,
            orientacao: dadosPedido.orientacao,
            frenteVerso: dadosPedido.frenteVerso,
            tipoCor: dadosPedido.tipoCor,
            tipoServico: "IMPRESSAO",
            metodoPagamento: metodoSelecionado
        };


        const formData = new FormData();


        formData.append("pedido", new Blob([JSON.stringify(payload)], {
            type: 'application/json'
        }));


        formData.append("file", dadosPedido.arquivoBruto);

        try {
            const response = await fetch("https://backend-impressoes-ufersa.onrender.com/api/pedidos/criar", {
                method: "POST",

                
                body: formData
            });

            if (response.ok) {
                setModalSucesso(true);
            } else {
                const erroTexto = await response.text();
                alert(`Erro no servidor: ${erroTexto}`);
            }
        } catch (error) {
            console.error("Erro na conexão:", error);
            alert("Não foi possível conectar ao servidor.");
        } finally {
            setCarregando(false);
        }
    };

    return (
        <div className="resumo-container">

            <header className="config-header">
                <button className="btn-voltar-topo" onClick={() => navigate(-1)}>
                    <ChevronLeft size={24} />
                </button>
                <h1>Resumo e Pagamento</h1>
            </header>


            <main className="resumo-content">

                <section className="card-resumo-detalhes">
                    <div className="resumo-header">
                        <Printer size={20} color="#1d448b" />
                        <span>Detalhes da Impressão</span>
                    </div>

                    <div className="resumo-item">
                        <span>Arquivo:</span>
                        <strong>{dadosPedido.nomeArquivo}</strong>
                    </div>
                    <div className="resumo-item">
                        <span>Configuração:</span>
                        <strong>{dadosPedido.totalPaginas} págs • {dadosPedido.tipoCor === 'COLORIDO' ? 'Colorido' : 'P&B'}</strong>
                    </div>
                    <div className="resumo-item">
                        <span>Frente e Verso:</span>
                        <strong>{dadosPedido.frenteVerso ? 'Sim' : 'Apenas Frente'}</strong>
                    </div>
                    <div className="resumo-item">
                        <span>Cópias:</span>
                        <strong>{dadosPedido.quantidade}x</strong>
                    </div>

                    <div className="resumo-total-caixa">
                        <span>Total a pagar:</span>
                        <span className="valor-destaque">
                            {(dadosPedido.valorTotal || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                    </div>
                </section>

                <h2 className="titulo-pagamento">Como deseja pagar no balcão?</h2>


                <div className="grade-pagamento">
                    <button
                        className={`btn-metodo ${metodoSelecionado === 'PIX' ? 'selecionado' : ''}`}
                        onClick={() => setMetodoSelecionado('PIX')}
                    >
                        <QrCode size={32} />
                        <span>PIX</span>
                    </button>

                    <button
                        className={`btn-metodo ${metodoSelecionado === 'DINHEIRO' ? 'selecionado' : ''}`}
                        onClick={() => setMetodoSelecionado('DINHEIRO')}
                    >
                        <Banknote size={32} />
                        <span>Dinheiro</span>
                    </button>

                    <button
                        className={`btn-metodo ${metodoSelecionado === 'CARTAO' ? 'selecionado' : ''}`}
                        onClick={() => setMetodoSelecionado('CARTAO')}
                    >
                        <CreditCard size={32} />
                        <span>Cartão</span>
                    </button>
                </div>

                <p className="aviso-balcao">
                    O pagamento será validado presencialmente no momento da retirada.
                </p>
            </main>


            <footer className="footer-resumo-botoes">

                <button className="btn-outline-voltar" onClick={() => navigate(-1)} disabled={carregando}>
                    Voltar e editar
                </button>

                <button
                    className="btn-confirmar-final"
                    disabled={!metodoSelecionado || carregando}
                    onClick={confirmarPedidoFinal}
                >
                    {carregando ? "Processando..." : "Confirmar e Enviar"}
                </button>
            </footer>



            {modalSucesso && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-icon-success">

                            <CheckCircle2 size={70} color="#26d451" strokeWidth={1.5} />
                        </div>
                        <h2>Tudo pronto!</h2>
                        <p>
                            Seu pedido foi enviado para a fila.<br />
                            Dirija-se ao balcão para pagamento e retirada.
                        </p>

                        <button className="btn-modal-final" onClick={() => navigate('/pedidos')}>
                            Ver meus pedidos
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}