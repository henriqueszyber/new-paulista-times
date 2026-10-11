import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { sessao } from '../session.js';

export default function Layout({ children, editorial = false }) {
  const [usuario, setUsuario] = useState(sessao.user);
  const [mensagem, setMensagem] = useState('');

  async function sair() {
    try {
      await api('/auth/logout', { method: 'POST', token: sessao.token });
    } catch {
      // Mesmo sem conexão, o acesso local é encerrado.
    }

    sessao.token = '';
    sessao.user = null;
    setUsuario(null);
    setMensagem('Você saiu da área editorial.');
  }

  return (
    <>
      <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
      <header className="site-header">
        <div className="topline">
          <span>JYNX · JORNAL DO PROJETO</span>
          <span>EDIÇÃO EXPERIMENTAL</span>
        </div>
        <Link className="brand" to="/" aria-label="New Paulista Times — página inicial">
          <img src="/logo-new-paulista-times.png" alt="New Paulista Times" />
        </Link>
        <nav className="main-nav" aria-label="Navegação principal">
          <Link to="/">Início</Link>
          <span>Um olhar próximo. Novas histórias.</span>
          <Link to="/login">Área editorial <span aria-hidden="true">↗</span></Link>
        </nav>
      </header>

      <main id="conteudo">
        {editorial && usuario && (
          <div className="admin-nav">
            <nav aria-label="Menu editorial">
              <Link to="/admin">Painel</Link>
              <Link to="/admin/nova">Nova notícia</Link>
              {usuario.role !== 'WRITER' && <Link to="/admin/usuarios">Usuários</Link>}
            </nav>
            <div className="session-info">
              <span>{usuario.name} · {usuario.role}</span>
              <button className="text-button" onClick={sair}>Sair</button>
            </div>
          </div>
        )}

        {editorial && !usuario ? (
          <section className="panel narrow">
            <p className="eyebrow">ÁREA EDITORIAL</p>
            <h1>Entre para continuar.</h1>
            {mensagem && <p role="status">{mensagem}</p>}
            <p>Faça login para acessar o painel. Ao recarregar a página, será preciso entrar novamente.</p>
            <Link className="button" to="/login">Ir para o login</Link>
          </section>
        ) : children}
      </main>

      <footer className="site-footer">
        <p><strong>New <span>Paulista</span> Times</strong></p>
        <p>Projeto de curso Jynx · Notícias fictícias · Edição experimental</p>
      </footer>
    </>
  );
}