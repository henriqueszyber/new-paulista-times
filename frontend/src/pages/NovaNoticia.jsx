import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import { api } from '../api.js';
import { sessao } from '../session.js';

export default function NovaNoticia() {
  const [titulo, setTitulo] = useState('');
  const [resumo, setResumo] = useState('');
  const [categoria, setCategoria] = useState('Cidade');
  const [conteudo, setConteudo] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [publicada, setPublicada] = useState(null);

  async function publicar(evento) {
    evento.preventDefault();
    setErro('');
    setEnviando(true);

    const noticia = {
      title: titulo,
      summary: resumo,
      category: categoria,
      content: conteudo,
    };

    try {
      const dados = await api('/news', {
        method: 'POST',
        token: sessao.token,
        body: noticia,
      });
      setPublicada(dados);
    } catch (erro) {
      setErro(erro.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Layout editorial>
      <section className="panel editor">
        <p className="eyebrow">NOVA PUBLICAÇÃO</p>
        <h1>Conte uma nova história.</h1>
        <p>Depois de publicar, a notícia aparece na página inicial.</p>

        {publicada ? (
          <div className="success" role="status">
            <h2>Notícia publicada!</h2>
            <p>{publicada.title}</p>
            <div className="form-actions">
              <Link className="button" to={'/noticia/' + publicada.id}>Ler notícia →</Link>
              <Link to="/admin">Voltar ao painel</Link>
            </div>
          </div>
        ) : (
          <form onSubmit={publicar}>
            <label htmlFor="titulo">Título</label>
            <input id="titulo" required maxLength={160} placeholder="O que aconteceu?"
              value={titulo} onChange={(evento) => setTitulo(evento.target.value)} />

            <label htmlFor="resumo">Resumo</label>
            <textarea id="resumo" required maxLength={300} rows={3} placeholder="O essencial em poucas palavras."
              value={resumo} onChange={(evento) => setResumo(evento.target.value)} />

            <label htmlFor="categoria">Categoria</label>
            <select id="categoria" value={categoria} onChange={(evento) => setCategoria(evento.target.value)}>
              <option>Cidade</option>
              <option>Tecnologia</option>
              <option>Cultura</option>
              <option>Educação</option>
              <option>Esportes</option>
            </select>

            <label htmlFor="conteudo">Conteúdo</label>
            <textarea id="conteudo" required maxLength={20000} rows={12} placeholder="Escreva sua notícia aqui."
              value={conteudo} onChange={(evento) => setConteudo(evento.target.value)} />
            <small>Texto simples. As quebras de linha serão mantidas.</small>

            {erro && <p className="notice" role="alert">{erro}</p>}
            <div className="form-actions">
              <button className="button" disabled={enviando}>
                {enviando ? 'Publicando…' : 'Publicar notícia →'}
              </button>
              <Link to="/admin">Cancelar</Link>
            </div>
          </form>
        )}
      </section>
    </Layout>
  );
}