import React from 'react';
import { Link } from 'react-router-dom';

export default function CardNoticia({ noticia, destaque = false }) {
  if (!destaque) {
    return (
      <article className="news-list-card">
        <Link className="news-list-link" to={'/noticia/' + noticia.id} aria-label={'Ler: ' + noticia.title}>
          {noticia.imageUrl && (
            <img className="news-list-cover" src={noticia.imageUrl} alt={noticia.imageAlt || noticia.title} loading="lazy" />
          )}
          <div className="news-list-content">
            <p className="eyebrow">{noticia.category}</p>
            <h3>{noticia.title}</h3>
            <p className="card-summary">{noticia.summary}</p>
            <div className="card-bottom">
              <span>Por {noticia.author}</span>
              <span className="news-list-read">Ler notícia <span aria-hidden="true">↗</span></span>
            </div>
          </div>
        </Link>
      </article>
    );
  }

  return (
    <article className="news-card">
      {noticia.imageUrl && <img className="card-cover" src={noticia.imageUrl} alt={noticia.imageAlt || noticia.title} loading="lazy" />}
      <h3><Link to={'/noticia/' + noticia.id}>{noticia.title}</Link></h3>
      <p className="card-summary">{noticia.summary}</p>
    </article>
  );
}
