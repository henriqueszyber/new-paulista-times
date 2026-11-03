import React from 'react';
import NoticiasPrincipais from '../noticias-principais.jsx';
import useNoticiasEconomia from './useNoticiasEconomia.js';
import StatusNoticias from './StatusNoticias.jsx';

export default function NoticiasPrincipaisEconomia({ className = '' }) {
  const estado = useNoticiasEconomia();
  return <div className={`economy-news-highlights ${className}`} aria-busy={estado.carregando}>
    <StatusNoticias {...estado} />
    {!estado.carregando && !estado.erro && (
      estado.noticias.length
        ? <NoticiasPrincipais noticias={estado.noticias} />
        : <p>Ainda não há notícias de economia em destaque.</p>
    )}
  </div>;
}
