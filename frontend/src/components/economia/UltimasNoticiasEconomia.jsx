import React, { useId, useState } from 'react';
import CardNoticia from '../CardNoticia.jsx';
import useNoticiasEconomia from './useNoticiasEconomia.js';
import StatusNoticias from './StatusNoticias.jsx';

export default function UltimasNoticiasEconomia({ className = '' }) {
  const estado = useNoticiasEconomia();
  const [limite, setLimite] = useState(5);
  const tituloId = useId();
  const listaId = useId();

  return <section className={`economy-latest-news ${className}`} aria-labelledby={tituloId} aria-busy={estado.carregando}>
    <div className="section-heading">
      <h2 id={tituloId}>Últimas notícias</h2>
      <span>Da nossa redação para você</span>
    </div>
    <StatusNoticias {...estado} />
    {!estado.carregando && !estado.erro && <>
      <div className="news-list" id={listaId}>
        {estado.noticias.slice(0, limite).map((noticia) => <CardNoticia key={noticia.id} noticia={noticia} />)}
      </div>
      {!estado.noticias.length && <p>Ainda não há notícias publicadas nesta seção.</p>}
      {estado.noticias.length > limite && <div className="news-load-more">
        <button className="button" aria-controls={listaId} onClick={() => setLimite((valor) => valor + 5)}>Exibir mais</button>
      </div>}
    </>}
  </section>;
}
