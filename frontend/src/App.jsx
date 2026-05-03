import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

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
import CancelarPedido from './pages/CancelarPedido/CancelarPedido';
import DicasContextuais from './pages/DicasContextuais/DicasContextuais';
import DetalhesFila from './pages/DetalhesFila/DetalhesFila';
import Notificacoes from './pages/Notificacoes/Notificacoes';
import TelaAdmin from './pages/TelaAdmin/TelaAdmin';
import ConfiguracoesAdmin from './pages/ConfiguracoesAdmin/ConfiguracoesAdmin';
import GerenciarUsuarios from './pages/GerenciarUsuarios/GerenciarUsuarios';
import Relatorios from './pages/Relatorios/Relatorios';
import NotificacaoGeral from './pages/NotificacaoGeral/NotificacaoGeral';
import FilaPedidos  from './pages/FilaPedidos/filaPedidos';
import PedidoConfiguracao from './pages/PedidoConfiguracao/PedidoConfiguracao'; 
import PedidoDetalhes from './pages/PedidoDetalhes/PedidoDetalhes';

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

        {/* Rota de perfil */}
        <Route path="/perfil" element={<Perfil />} />

        {/* Rota da Tela de Meus Pedidos */}
        <Route path="/pedidos" element={<MeusPedidos />} />

        {/* Rota para a tela inicial de escolher o serviço */}
        <Route path="/novo-pedido" element={<NovoPedidoInicio />} />

        {/* Rota da Tela de Configuração e Upload */}
        <Route path="/configuracao-pedido" element={<PedidoConfiguracao />} />

        {/* Rota para a tela de Resumo e Pagamento */}
        <Route path="/resumo-pagamento" element={<ResumoPagamento />} />


          {/* Rota para a tela de Configuração de Encadernação */}
          <Route path="/configuracao-encadernacao" element={<ConfiguracaoEncadernacao />} />

          {/* Rota para a tela de Pagamento de Encadernação */}
          <Route path="/pagamento-encadernacao" element={<PagamentoEncadernacao />} />

        {/* Rota para a tela de Cancelar Pedido */}
        <Route path="/cancelar-pedido" element={<CancelarPedido />} />

        {/* Rota para a tela de Dicas Contextuais */}
        <Route path="/dicas-contextuais" element={<DicasContextuais />} />

        {/* Rota para a tela de Detalhes da Fila */}
        <Route path="/detalhes-fila" element={<DetalhesFila />} />

        {/* Rota para a tela de Notificações */}
        <Route path="/notificacoes" element={<Notificacoes />} />

        {/* Rota para a tela de Administração */}
        <Route path="/admin" element={<TelaAdmin />} />

        {/* Rota para a tela de Configurações do Admin */}
        <Route path="/admin/configuracoes" element={<ConfiguracoesAdmin />} />

        {/* Rota para a tela de Gerenciamento de Usuários */}
        <Route path="/admin/gerenciar-usuarios" element={<GerenciarUsuarios />} />

        {/* Rota para a tela de Relatórios */}
        <Route path="/admin/relatorios" element={<Relatorios />} />

        {/* Rota para a tela de Notificação Geral */}
        <Route path="/admin/notificar" element={<NotificacaoGeral />} />

        {/* Rota para a tela de Fila de Pedidos */}
        <Route path="/admin/fila-pedidos" element={<FilaPedidos />} />

        {/* Rota para a tela de Detalhes do Pedido */}
        <Route path="/pedidos-detalhe/:id" element={<PedidoDetalhes />} />
      </Routes>
    </Router>
  );
}