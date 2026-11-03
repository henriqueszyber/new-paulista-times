import React from 'react';

export default function VariacaoMercado({ value, suffix = '' }) {
  if (value == null) return <span className="market-muted">Variação indisponível</span>;
  return <span className={`market-change ${value > 0 ? 'market-up' : value < 0 ? 'market-down' : ''}`}>
    {new Intl.NumberFormat('pt-BR', { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2, signDisplay: 'exceptZero' }).format(value / 100)}{suffix}
  </span>;
}
