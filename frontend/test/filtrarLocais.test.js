import { test } from 'node:test';
import assert from 'node:assert/strict';
import { filtrarLocais } from '../src/components/sao-paulo/filtrarLocais.js';

const locais = [
  { id: '1', name: 'Café São Paulo', description: 'Café e doces', address: 'Avenida Paulista', category: 'Bares e cafés' },
  { id: '2', name: 'Museu', description: 'Arte brasileira', address: 'Avenida Paulista', category: 'Cultura' },
  { id: '3', name: 'Local antigo', address: 'Centro' },
];
test('busca ignora acentos e combina termos com a categoria', () => {
  assert.deepEqual(filtrarLocais(locais, 'CAFE paulista', 'Bares e cafés').map(item => item.id), ['1']);
  assert.deepEqual(filtrarLocais(locais, 'paulista', 'Cultura').map(item => item.id), ['2']);
  assert.deepEqual(filtrarLocais(locais, 'doces', 'Cultura'), []);
  assert.equal(filtrarLocais(locais, '   ', '').length, 3);
  assert.deepEqual(filtrarLocais(locais, '', 'Outros').map(item => item.id), ['3']);
});
