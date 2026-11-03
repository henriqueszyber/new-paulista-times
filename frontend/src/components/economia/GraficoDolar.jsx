import React, { useId, useState } from 'react';
import { brl, dayLabel } from './formatters.js';

export default function GraficoDolar({ points }) {
  const [selected, setSelected] = useState(points.length - 1);
  const titleId = useId();
  const selectedIndex = Math.min(selected, points.length - 1);
  const point = points[selectedIndex];
  if (!points.length) return <p>Nenhuma cotação disponível neste período.</p>;
  const min = Math.min(...points.map((item) => item.value));
  const max = Math.max(...points.map((item) => item.value));
  const padding = Math.max((max - min) * 0.15, 0.01);
  const lower = min - padding;
  const upper = max + padding;
  const x = (index) => 80 + (points.length === 1 ? 310 : index / (points.length - 1) * 620);
  const y = (value) => 22 + (upper - value) / (upper - lower) * 166;
  const path = points.map((item, index) => `${index === 0 ? 'M' : 'L'}${x(index)},${y(item.value)}`).join(' ');
  return <>
    <div className="market-chart-readout" aria-live="polite"><strong>{brl(point.value)}</strong><span>{dayLabel(point.date)}/{point.date.slice(0, 4)} · Compra</span></div>
    <svg className="market-chart" viewBox="0 0 740 230" role="img" aria-labelledby={titleId}>
      <title id={titleId}>Histórico do dólar comercial em reais, de {dayLabel(points[0].date)} a {dayLabel(points.at(-1).date)}. Menor valor {brl(min)} e maior valor {brl(max)}.</title>
      {[lower, (lower + upper) / 2, upper].map((value) => <g key={value}>
        <line x1="80" x2="700" y1={y(value)} y2={y(value)} className="market-chart-grid" />
        <text x="68" y={y(value) + 4} textAnchor="end">{value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</text>
      </g>)}
      <path d={path} fill="none" className="market-chart-line" />
      <line x1={x(selectedIndex)} x2={x(selectedIndex)} y1="22" y2="188" className="market-chart-cursor" />
      <circle cx={x(selectedIndex)} cy={y(point.value)} r="5" className="market-chart-point" />
      <text x="80" y="217">{dayLabel(points[0].date)}</text><text x="700" y="217" textAnchor="end">{dayLabel(points.at(-1).date)}</text>
    </svg>
    {points.length > 1 && <label className="market-chart-slider">Explorar datas
      <input type="range" min="0" max={points.length - 1} value={selectedIndex} onChange={(event) => setSelected(Number(event.target.value))} aria-valuetext={`${dayLabel(point.date)}: ${brl(point.value)}`} />
    </label>}
    <details className="market-chart-table"><summary>Ver cotações em tabela</summary><div className="table-wrap"><table>
      <caption>Dólar comercial — compra, em reais</caption><thead><tr><th scope="col">Data</th><th scope="col">Valor</th></tr></thead>
      <tbody>{points.map((item) => <tr key={item.date}><th scope="row">{dayLabel(item.date)}/{item.date.slice(0, 4)}</th><td>{brl(item.value)}</td></tr>)}</tbody>
    </table></div></details>
  </>;
}
