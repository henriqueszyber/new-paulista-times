import React, { useId } from 'react';
import useMercado from './useMercado.js';
import StatusMercado from './StatusMercado.jsx';
import VariacaoMercado from './VariacaoMercado.jsx';
import FonteMercado from './FonteMercado.jsx';
import { brl, dateTime } from './formatters.js';

export default function CotacaoDolar({ className = '' }) {
  const titleId = useId();
  const dollar = useMercado('/economy/dolar');

  return <section className={`market-card ${className}`} aria-labelledby={titleId} aria-busy={dollar.loading}>
        <h3 id={titleId}>Dólar comercial</h3><p className="market-muted">Compra · USD/BRL</p><StatusMercado state={dollar} />
        {dollar.data && <><p className="market-dollar"><span>US$ 1 =</span><strong>{brl(dollar.data.bid)}</strong></p><VariacaoMercado value={dollar.data.changePercent} suffix=" no dia" /><p className="market-muted">Cotação de {dateTime(dollar.data.updatedAt)}</p><p className="market-muted">Referência comercial, sem tarifas de conversão.</p></>}
        <FonteMercado href="https://docs.awesomeapi.com.br/api-de-moedas" fetchedAt={dollar.data?.fetchedAt}>Fonte: AwesomeAPI</FonteMercado>
      </section>;
}
