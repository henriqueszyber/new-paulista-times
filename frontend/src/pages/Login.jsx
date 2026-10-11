import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import { api } from '../api.js';
import { sessao } from '../session.js';

export default function Login() {
  const [email, setEmail] = useState('super@jynx.local');
  const [senha, setSenha] = useState('demo123');
  const [usuario, setUsuario] = useState(sessao.user);
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function entrar(evento) {
    evento.preventDefault();
    setErro('');
    setEnviando(true);

    try {
      const dados = await api('/auth/login', {
        method: 'POST',
        body: { email: email, password: senha },
      });

      sessao.token = dados.token;
      sessao.user = dados.user;
      setUsuario(dados.user);
    } catch (erro) {
      setErro(erro.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Layout>
      <section className="panel narrow">
        <p className="eyebrow">ÁREA EDITORIAL</p>
        <h1>A próxima história<br />começa aqui.</h1>
        {usuario ? (
          <div className="login-success" role="status">
            <p>Olá, {usuario.name}. Seu acesso foi confirmado.</p>
            <Link className="button" to="/admin">Abrir painel →</Link>
          </div>
        ) : (
          <form onSubmit={entrar}>
            <label htmlFor="email">E-mail</label>
            <input id="email" type="email" required autoComplete="username"
              value={email} onChange={(evento) => setEmail(evento.target.value)} />

            <label htmlFor="senha">Senha</label>
            <input id="senha" type="password" required autoComplete="current-password"
              value={senha} onChange={(evento) => setSenha(evento.target.value)} />

            {erro && <p className="notice" role="alert">{erro}</p>}
            <button className="button" disabled={enviando}>
              {enviando ? 'Verificando…' : 'Entrar →'}
            </button>
          </form>
        )}

        <aside className="demo">
          <h2>Contas de demonstração</h2>
          <p>Senha para todas: <code>demo123</code></p>
          <p>SUPER_ADMIN: super@jynx.local<br />
            ADMIN: admin@jynx.local<br />
            WRITER: writer@jynx.local</p>
          <p>Ao recarregar a página, faça login novamente.</p>
        </aside>
      </section>
    </Layout>
  );
}