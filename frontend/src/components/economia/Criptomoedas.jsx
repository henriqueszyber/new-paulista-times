import React, { useId } from 'react';
import useMercado from './useMercado.js';
import StatusMercado from './StatusMercado.jsx';
import VariacaoMercado from './VariacaoMercado.jsx';
import FonteMercado from './FonteMercado.jsx';
import { usd, dateTime } from './formatters.js';

export default function Criptomoedas({ className = '' }) {
  const titleId = useId();
  const crypto = useMercado('/economy/criptos');

  return <section className={`market-card ${className}`} aria-labelledby={titleId} aria-busy={crypto.loading}>
        <h3 id={titleId}>Criptomoedas</h3><p className="market-muted">Preços em dólar · Variação em 24h</p><StatusMercado state={crypto} />
        {crypto.data && <ul className="market-crypto">{crypto.data.items.map((item) => <li key={item.id}><div className="market-crypto-row"><div><strong>{item.name}</strong><span className="market-muted"> {item.symbol}</span></div><div className="market-values"><strong>{usd(item.price)}</strong><VariacaoMercado value={item.changePercent} /></div></div><small>Cotação de {dateTime(item.updatedAt)}</small></li>)}</ul>}
        <FonteMercado href="https://www.coingecko.com/en/api" fetchedAt={crypto.data?.fetchedAt}>Data provided by CoinGecko</FonteMercado>
      </section>;
}
