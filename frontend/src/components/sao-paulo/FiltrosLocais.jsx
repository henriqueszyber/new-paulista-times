import React, { useEffect, useRef, useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';

export default function FiltrosLocais({ busca, categoria, categorias, onBusca, onCategoria, onLimpar }) {
  const [buscaAberta, setBuscaAberta] = useState(false);
  const [filtroAberto, setFiltroAberto] = useState(false);
  const input = useRef(null);
  const lupa = useRef(null);
  const filtro = useRef(null);
  const dropdown = useRef(null);
  const grupoFiltro = useRef(null);

  useEffect(() => { if (buscaAberta) input.current?.focus(); }, [buscaAberta]);
  useEffect(() => {
    if (!filtroAberto) return;
    dropdown.current?.querySelector('input:checked')?.focus();
    const fora = event => {
      if (!grupoFiltro.current?.contains(event.target)) setFiltroAberto(false);
    };
    document.addEventListener('pointerdown', fora);
    return () => document.removeEventListener('pointerdown', fora);
  }, [filtroAberto]);

  function fecharFiltro() { setFiltroAberto(false); filtro.current?.focus(); }
  return <div className="sp-place-filters" role="search" aria-label="Filtrar locais cadastrados">
    <div className="sp-filter-toolbar">
      <h3>Locais de interesse</h3>
      <button ref={lupa} className="sp-icon-button" type="button" aria-label={buscaAberta ? 'Recolher busca' : 'Buscar locais'} title="Buscar locais" aria-expanded={buscaAberta} aria-controls="sp-place-search-panel" data-active={!!busca || buscaAberta}
        onClick={() => setBuscaAberta(value => !value)}><Search size={18} aria-hidden="true" /></button>
      <div ref={grupoFiltro} className="sp-filter-control" onBlur={event => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFiltroAberto(false);
      }} onKeyDown={event => { if (event.key === 'Escape') { event.preventDefault(); fecharFiltro(); } }}>
        <button ref={filtro} className="sp-icon-button" type="button" aria-label={categoria ? `Filtrar por categoria: ${categoria}` : 'Filtrar por categoria'} title="Filtrar por categoria" aria-expanded={filtroAberto} aria-controls="sp-place-category-panel" data-active={!!categoria || filtroAberto}
          onClick={() => setFiltroAberto(value => !value)}><SlidersHorizontal size={18} aria-hidden="true" /></button>
        {filtroAberto && <fieldset ref={dropdown} id="sp-place-category-panel" className="sp-filter-dropdown">
          <legend>Categoria</legend>
          {['', ...categorias].map(item => <label key={item}>
            <input type="radio" name="sp-category-filter" value={item} checked={categoria === item} onChange={() => onCategoria(item)} />
            <span>{item || 'Todas as categorias'}</span>
          </label>)}
          <button type="button" className="text-button" onClick={fecharFiltro}>Concluir</button>
        </fieldset>}
      </div>
      {(busca || categoria) && <button type="button" className="sp-icon-button" aria-label="Limpar busca e filtro" title="Limpar busca e filtro" onClick={onLimpar}><X size={16} aria-hidden="true" /></button>}
    </div>
    {categoria && <p className="sp-filter-summary">Categoria: {categoria}</p>}
    {buscaAberta && <div id="sp-place-search-panel">
      <input ref={input} id="sp-place-query" type="search" aria-label="Buscar nos locais por nome, descrição ou endereço" value={busca} placeholder="Nome, descrição ou endereço" onChange={event => onBusca(event.target.value)}
        onKeyDown={event => { if (event.key === 'Escape') { setBuscaAberta(false); lupa.current?.focus(); } }} />
    </div>}
    {!buscaAberta && busca && <p className="sp-filter-summary">Busca: {busca}</p>}
  </div>;
}
