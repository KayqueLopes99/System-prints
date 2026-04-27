import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Importando as telas que acabamos de criar!
import Login from './pages/Login/Login';
import Cadastro from './pages/Cadastro/Cadastro';
import RecuperarSenha from './pages/RecuperarSenha/RecuperarSenha';
import AtualizarSenha from './pages/AtualizarSenha/AtualizarSenha';
import TelaEstudante from "./pages/TelaEstudante/TelaEstudante"; 
import Perfil from './pages/Perfil/Perfil'; 
import MeusPedidos from './pages/MeusPedidos/MeusPedidos'; // 👈 NOVO: Importando a tela de Pedidos!
import NovoPedidoInicio from './pages/NovoPedidoInicio/NovoPedidoInicio';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Rota principal: Quando o site abrir ( / ), mostra o Login */}
        <Route path="/" element={<Login />} />

        {/* Rota de Cadastro: Quando for /cadastro, mostra a tela de Cadastro */}
        <Route path="/cadastro" element={<Cadastro />} />

        {/* Rota de Recuperar Senha: Quando for /recuperar-senha, mostra a tela */}
        <Route path="/recuperar-senha" element={<RecuperarSenha />} />

        <Route path="/AtualizarSenha" element={<AtualizarSenha />} />

        {/* Rota da Tela Principal do Estudante */}
        <Route path="/estudante" element={<TelaEstudante />} />

        {/* ROTA DO PERFIL */}
        <Route path="/perfil" element={<Perfil />} />

        {/* 👇 NOVA ROTA: Rota da Tela de Meus Pedidos */}
        <Route path="/pedidos" element={<MeusPedidos />} />

        {/* Rota para a tela que acabamos de criar */}
        <Route path="/novo-pedido" element={<NovoPedidoInicio />} />

      </Routes>
    </Router>
  );
}