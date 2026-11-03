import React, { useId } from 'react';
import useMercado from './useMercado.js';
import StatusMercado from './StatusMercado.jsx';
import VariacaoMercado from './VariacaoMercado.jsx';
import FonteMercado from './FonteMercado.jsx';
import { brl } from './formatters.js';

export default function MaioresAltas({ className = '' }) {
  const titleId = useId();
  const stocks = useMercado('/economy/altas');

  return <section className={`market-card ${className}`} aria-labelledby={titleId} aria-busy={stocks.loading}>
        <h3 id={titleId}>Maiores altas da B3</h3><p className="market-muted">Top 3 · Última variação disponível</p>
        <StatusMercado state={stocks} />
        {stocks.data && <>
          {!stocks.data.items.length && <p>Nenhuma alta com negociação registrada foi encontrada.</p>}
          <ol className="market-stocks">{stocks.data.items.map((item) => <li key={item.symbol}><div><strong>{item.symbol}</strong><span className="market-stock-name">{item.name}</span></div><div className="market-values"><VariacaoMercado value={item.changePercent} /><span>{brl(item.price)}</span></div></li>)}</ol>
        </>}
        <p className="market-muted">Mercado padrão, sem fracionário. A fonte não informa o horário individual de cada cotação; os dados podem ter atraso.</p>
        <FonteMercado href="https://brapi.dev/" fetchedAt={stocks.data?.fetchedAt}>Fonte: brapi</FonteMercado>
      </section>;
}
