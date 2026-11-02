import React from 'react';
import CardNoticia from './CardNoticia.jsx';

export default function NoticiasPrincipais({ noticias = [] }) {
  const [principal, ...secundarias] = noticias.slice(0, 4);

  if (!principal) return null;

  return (
    <section className="noticias-principais" aria-labelledby="noticias-principais-titulo">
      <div className="section-heading">
        <h2 id="noticias-principais-titulo">Notícias principais</h2>
        <span>Em destaque na redação</span>
      </div>
      <div className="noticias-principais-grid">
        <div className="noticia-principal">
          <CardNoticia noticia={principal} destaque />
        </div>
        {secundarias.length > 0 && (
          <div className="noticias-principais-lateral">
            {secundarias.map((noticia) => (
              <CardNoticia key={noticia.id} noticia={noticia} destaque />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
