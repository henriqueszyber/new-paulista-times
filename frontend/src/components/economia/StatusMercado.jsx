import React from 'react';

export default function StatusMercado({ state }) {
  if (state.loading) return <p className="market-loading" role="status">Consultando mercado…</p>;
  if (state.error) return <div className="notice" role="alert"><p>{state.error}</p><button className="secondary-button" onClick={state.retry}>Tentar novamente</button></div>;
  return null;
}
