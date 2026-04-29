import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Importando as telas
import Login from './pages/Login/Login';
import Cadastro from './pages/Cadastro/Cadastro';
import RecuperarSenha from './pages/RecuperarSenha/RecuperarSenha';
import AtualizarSenha from './pages/AtualizarSenha/AtualizarSenha';
import TelaEstudante from "./pages/TelaEstudante/TelaEstudante"; 
import Perfil from './pages/Perfil/Perfil'; 
import MeusPedidos from './pages/MeusPedidos/MeusPedidos';
import NovoPedidoInicio from './pages/NovoPedidoInicio/NovoPedidoInicio';
import ResumoPagamento from './pages/ResumoPagamento/ResumoPagamento';
import ConfiguracaoEncadernacao from './pages/ConfiguracaoEncadernacao/ConfiguracaoEncadernacao';
import  PagamentoEncadernacao from './pages/PagamentoEncadernacao/PagamentoEncadernacao';

// 👇 NOVO: Importando a tela de Configuração do Pedido!
import PedidoConfiguracao from './pages/PedidoConfiguracao/PedidoConfiguracao'; 

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Rota principal: Quando o site abrir ( / ), mostra o Login */}
        <Route path="/" element={<Login />} />

        {/* Rota de Cadastro */}
        <Route path="/cadastro" element={<Cadastro />} />

        {/* Rota de Recuperar Senha */}
        <Route path="/recuperar-senha" element={<RecuperarSenha />} />
        <Route path="/AtualizarSenha" element={<AtualizarSenha />} />

        {/* Rota da Tela Principal do Estudante */}
        <Route path="/estudante" element={<TelaEstudante />} />

        {/* ROTA DO PERFIL */}
        <Route path="/perfil" element={<Perfil />} />

        {/* Rota da Tela de Meus Pedidos */}
        <Route path="/pedidos" element={<MeusPedidos />} />

        {/* Rota para a tela inicial de escolher o serviço */}
        <Route path="/novo-pedido" element={<NovoPedidoInicio />} />

        {/* 👇 NOVA ROTA: Rota da Tela de Configuração e Upload */}
        <Route path="/configuracao-pedido" element={<PedidoConfiguracao />} />

        {/* Rota para a tela de Resumo e Pagamento */}
        <Route path="/resumo-pagamento" element={<ResumoPagamento />} />


          {/* Rota para a tela de Configuração de Encadernação */}
          <Route path="/configuracao-encadernacao" element={<ConfiguracaoEncadernacao />} />

          {/* Rota para a tela de Pagamento de Encadernação */}
          <Route path="/pagamento-encadernacao" element={<PagamentoEncadernacao />} />

      </Routes>
    </Router>
  );
}