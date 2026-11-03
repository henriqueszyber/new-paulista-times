export const brl = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 4 }).format(value);
export const usd = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'USD' }).format(value);
export const dateTime = (value) => new Date(value).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'short', timeStyle: 'short' });
export const dayLabel = (value) => new Date(value + 'T12:00:00Z').toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit' });
