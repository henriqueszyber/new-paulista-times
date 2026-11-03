import React, { useId, useState } from 'react';
import useMercado from './useMercado.js';
import StatusMercado from './StatusMercado.jsx';
import FonteMercado from './FonteMercado.jsx';
import GraficoDolar from './GraficoDolar.jsx';

export default function HistoricoDolar({ className = '' }) {
  const titleId = useId();
  const [days, setDays] = useState(30);
  const history = useMercado(`/economy/dolar/historico?days=${days}`);

  return <section className={`market-history ${className}`} aria-labelledby={titleId} aria-busy={history.loading}>
      <div className="section-heading"><h3 id={titleId}>O dólar ao longo do tempo</h3><div className="market-periods" role="group" aria-label="Período do histórico">{[30, 90, 180].map((period) => <button key={period} aria-pressed={days === period} onClick={() => setDays(period)}>{period} dias</button>)}</div></div>
      <StatusMercado state={history} />
      {history.data && <GraficoDolar key={`${days}-${history.data.fetchedAt}`} points={history.data.points} />}
      <p className="market-muted">Dólar comercial — compra. Amostras diárias disponíveis; a mais recente pode ser parcial. Dias sem cotação não são preenchidos.</p>
      <FonteMercado href="https://docs.awesomeapi.com.br/api-de-moedas" fetchedAt={history.data?.fetchedAt}>Fonte: AwesomeAPI</FonteMercado>
    </section>;
}
