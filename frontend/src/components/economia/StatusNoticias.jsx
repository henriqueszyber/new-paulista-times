import React from 'react';

export default function StatusNoticias({ carregando, erro, tentarNovamente }) {
  if (carregando) return <p role="status">Carregando notícias de economia…</p>;
  if (erro) return <div className="notice" role="alert">
    <p>{erro}</p>
    <button className="secondary-button" onClick={tentarNovamente}>Tentar novamente</button>
  </div>;
  return null;
}
