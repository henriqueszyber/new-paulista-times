export const categoriasLocais = ['Cultura', 'Parques e lazer', 'Restaurantes', 'Bares e cafés', 'Compras', 'Eventos', 'Outros'];
const normalizar = texto => String(texto || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');

export function filtrarLocais(locais, busca, categoria) {
  const termos = normalizar(busca).trim().split(/\s+/).filter(Boolean);
  return locais.filter(local => {
    if (categoria && (local.category || 'Outros') !== categoria) return false;
    const texto = normalizar([local.name, local.description, local.address, local.category].join(' '));
    return termos.every(termo => texto.includes(termo));
  });
}
