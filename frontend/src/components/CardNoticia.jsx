import React from 'react';
import { Link } from 'react-router-dom';

export default function CardNoticia({ noticia }) {
  return (
    <article className="news-card">
      <p className="eyebrow">{noticia.category}</p>
      <h3><Link to={'/noticia/' + noticia.id}>{noticia.title}</Link></h3>
      <p className="card-summary">{noticia.summary}</p>
      <div className="card-bottom">
        <span>Por {noticia.author}</span>
        <Link to={'/noticia/' + noticia.id} aria-label={'Ler: ' + noticia.title}>
          Ler notícia <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </article>
  );
}