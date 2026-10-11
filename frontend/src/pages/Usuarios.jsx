import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout.jsx';
import { api } from '../api.js';
import { sessao } from '../session.js';

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregarUsuarios() {
      if (!sessao.user) {
        setCarregando(false);
        return;
      }

      try {
        const dados = await api('/users', { token: sessao.token });
        setUsuarios(dados);
      } catch (erro) {
        setErro(erro.message);
      } finally {
        setCarregando(false);
      }
    }

    carregarUsuarios();
  }, []);

  const linhas = [];
  for (let i = 0; i < usuarios.length; i++) {
    const usuario = usuarios[i];
    linhas[linhas.length] = (
      <tr key={usuario.id}>
        <td>{usuario.name}{sessao.user && usuario.id === sessao.user.id && ' (você)'}</td>
        <td>{usuario.email}</td>
        <td><span className="badge">{usuario.role}</span></td>
      </tr>
    );
  }

  return (
    <Layout editorial>
      <section className="panel">
        <p className="eyebrow">QUEM FAZ O JORNAL</p>
        <h1>Equipe editorial</h1>
        <p>SUPER_ADMIN e ADMIN consultam a equipe. Os três papéis podem publicar neste protótipo.</p>
        {erro && <p className="notice" role="alert">{erro}</p>}
        {carregando && <p role="status">Carregando equipe…</p>}
        {!carregando && !erro && usuarios.length === 0 && <p>Nenhum usuário encontrado.</p>}
        {usuarios.length > 0 && (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Nome</th><th>E-mail</th><th>Papel</th></tr></thead>
              <tbody>{linhas}</tbody>
            </table>
          </div>
        )}
      </section>
    </Layout>
  );
}