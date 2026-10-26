import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import TextView from '../components/TextView.jsx';
import { api } from '../api.js';

export default function Noticia() {
  const id = window.location.pathname.split('/').pop();
  const [noticia, setNoticia] = useState(null);
  const [erro, setErro] = useState('');

  useEffect(() => {
    async function carregarNoticia() {
      setNoticia(null);
      setErro('');
      try {
        const dados = await api('/news/' + encodeURIComponent(id));
        setNoticia(dados);
      } catch (erro) {
        setErro(erro.message);
      }
    }

    carregarNoticia();
  }, [id]);

  return (
    <Layout>
      <article className="article">
        <Link className="back-link" to="/">← Todas as notícias</Link>
        {erro && <p className="notice" role="alert">{erro}</p>}
        {!noticia && !erro && <p role="status">Carregando notícia…</p>}
        {noticia && (
          <>
            <p className="eyebrow">{noticia.category}</p>
            <h1>{noticia.title}</h1>
            <p className="article-summary">{noticia.summary}</p>
            <p className="byline">
              Por <strong>{noticia.author}</strong> · {new Date(noticia.createdAt).toLocaleDateString('pt-BR')}
            </p>
            {noticia.imageUrl && (
              <figure className="article-cover">
                <img src={noticia.imageUrl} alt={noticia.imageAlt || noticia.title} />
                {noticia.imageCredit && <figcaption>Foto: {noticia.imageCredit}</figcaption>}
              </figure>
            )}
            <TextView content={noticia.content} />
          </>
        )}
      </article>
    </Layout>
  );
}
