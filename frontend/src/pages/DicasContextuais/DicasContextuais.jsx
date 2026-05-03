import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Printer, FileText, Lightbulb, ArrowLeft, Info, HelpCircle } from 'lucide-react';
import './DicasContextuais.css';

export default function DicasContextuais() {
    const navigate = useNavigate();
    const [cardAtivo, setCardAtivo] = useState(null);

    const dicas = [
        { id: 1, titulo: "Pagamento no local", texto: "O pagamento é realizado presencialmente no setor de impressões, no momento da retirada do material." },
        { id: 2, titulo: "Prefira arquivos em PDF", texto: "Para evitar problemas de formatação, recomendamos o envio de arquivos em PDF. Assim, seu documento será impresso exatamente como você visualizou." },
        { id: 3, titulo: "Revise antes de confirmar", texto: "Confira com atenção o arquivo, quantidade de páginas, tipo de impressão e demais configurações antes de finalizar o pedido." },
        { id: 4, titulo: "Prazo para cancelamento", texto: "Após a confirmação, você terá um curto período (cerca de 5 minutos) para cancelar o pedido, caso necessário. Após esse tempo, o arquivo pode ser enviado para impressão normalmente." },
        { id: 5, titulo: "Nomeie bem seu arquivo", texto: "Utilize nomes claros e organizados (ex: “Trabalho_Matematica.pdf”) para facilitar a identificação." },
        { id: 6, titulo: "Verifique a quantidade de páginas", texto: "Certifique-se de que o número de páginas está correto para evitar custos inesperados." },
        { id: 7, titulo: "Atenção ao tipo de impressão", texto: "Escolha corretamente entre preto e branco ou colorido, pois isso influencia no valor final." },
        { id: 8, titulo: "Acompanhe o status do pedido", texto: "Fique atento às atualizações do sistema para saber quando seu material estará pronto para retirada." }
    ];

    const toggleZoom = (id) => {
        setCardAtivo(cardAtivo === id ? null : id);
    };

    return (
        <div className="dicas-container">
            {/* 👉 OVERLAY: Aparece quando tem card ativo para fechar ao clicar fora */}
            {cardAtivo && (
                <div className="overlay-escuro" onClick={() => setCardAtivo(null)} />
            )}

            <header className="header-dicas">
                <button className="btn-voltar" onClick={() => navigate(-1)}>
                    <ArrowLeft size={24} color="#1d448b" /> Voltar
                </button>
                <h1>Dicas e Orientações</h1>
                <HelpCircle size={24} color="#1d448b" />
            </header>

            <main className="lista-dicas">
                {dicas.map((dica, index) => (
                    <div 
                        key={dica.id}
                        className={`card-dica ${index % 2 === 0 ? 'borda-azul' : 'borda-verde'} ${cardAtivo === dica.id ? 'zoom-ativo' : ''}`}
                        onClick={() => toggleZoom(dica.id)}
                    >
                        <div className="card-dica-topo">
                            <Info size={20} className="icone-info" />
                            <h3>{dica.titulo}</h3>
                        </div>
                        <p>{dica.texto}</p>
                    </div>
                ))}
            </main>

            <nav className="navegacao-inferior">
                <div className="icone-nav" onClick={() => navigate('/estudante')}>
                    <Home size={28} />
                </div>
                <div className="icone-nav" onClick={() => navigate('/novo-pedido')}>
                    <Printer size={28} />
                </div>
                <div className="icone-nav" onClick={() => navigate('/pedidos')}>
                    <FileText size={28} />
                </div>
                <div className="icone-nav ativo">
                    <Lightbulb size={28} color="#1d448b" />
                </div>
            </nav>
        </div>
    );
}