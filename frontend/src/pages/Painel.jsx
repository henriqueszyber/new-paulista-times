import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import { api } from '../api.js';
import { sessao } from '../session.js';

export default function Painel() {
  const usuario = sessao.user;
  const [noticias, setNoticias] = useState([]);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregarNoticias() {
      if (!sessao.user) {
        setCarregando(false);
        return;
      }

      try {
        const dados = await api('/news/manage', { token: sessao.token });
        setNoticias(dados);
      } catch (erro) {
        setErro(erro.message);
      } finally {
        setCarregando(false);
      }
    }

    carregarNoticias();
  }, []);

  const linhas = [];
  let minhasNoticias = 0;
  let publicadas = 0;
  for (let i = 0; i < noticias.length; i++) {
    const noticia = noticias[i];
    if (usuario && noticia.authorId === usuario.id) {
      minhasNoticias++;
    }
    if (noticia.status === 'published') publicadas++;

    const podeEditar = usuario && (usuario.id === noticia.authorId || usuario.role !== 'WRITER');

    linhas[linhas.length] = (
      <tr key={noticia.id}>
        <td><Link to={podeEditar ? '/admin/editar/' + noticia.id : '/noticia/' + noticia.id}>{noticia.title}</Link></td>
        <td>{noticia.author}</td>
        <td>{noticia.category}</td>
        <td><span className="badge">{noticia.status === 'draft' ? 'Rascunho' : 'Publicada'}</span></td>
        <td>{podeEditar && <Link to={'/admin/editar/' + noticia.id}>Editar</Link>}</td>
      </tr>
    );
  }

  return (
    <Layout editorial>
      {usuario && (
        <>
          <div className="section-heading">
            <div>
              <p className="eyebrow">REDAÇÃO NEW PAULISTA TIMES</p>
              <h1>Olá, {usuario.name}.</h1>
              <p>Organize as histórias da nossa redação.</p>
            </div>
            <Link className="button" to="/admin/nova">+ Criar notícia</Link>
          </div>

          <div className="stats">
            <div><strong>{publicadas}</strong><span>Notícias publicadas</span></div>
            <div><strong>{noticias.length - publicadas}</strong><span>Rascunhos</span></div>
            <div><strong>{minhasNoticias}</strong><span>Notícias criadas por você</span></div>
          </div>

          <section className="panel">
            <h2>Publicações</h2>
            {erro && <p className="notice" role="alert">{erro}</p>}
            {carregando && <p role="status">Carregando publicações…</p>}
            {!carregando && !erro && noticias.length === 0 && <p>Nenhuma publicação ainda.</p>}
            {noticias.length > 0 && (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Título</th><th>Autor</th><th>Categoria</th><th>Status</th><th>Ação</th></tr></thead>
                  <tbody>{linhas}</tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </Layout>
  );
}
