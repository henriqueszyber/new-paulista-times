import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buscarFotoLocal } from '../src/components/sao-paulo/fotoLocal.js';

test('foto usa primeiro resultado, tamanho limitado e preserva os créditos', async () => {
  const maps = { async importLibrary(library) {
    assert.equal(library, 'places');
    return { Place: class {
      constructor({ id }) { assert.equal(id, 'place-test'); }
      async fetchFields(options) {
        assert.deepEqual(options.fields, ['photos']);
        this.photos = [{ getURI(size) { assert.deepEqual(size, { maxWidth: 600, maxHeight: 400 }); return 'https://example.com/photo'; }, authorAttributions: [{ displayName: 'Autor', uri: 'https://example.com/autor' }] }];
      }
    } };
  } };
  assert.deepEqual(await buscarFotoLocal(maps, 'place-test'), { url: 'https://example.com/photo', autores: [{ nome: 'Autor', url: 'https://example.com/autor' }] });
  assert.equal(await buscarFotoLocal(null, ''), null);
});
test('local sem fotos retorna vazio; erro de permissão pode ser tratado pela interface', async () => {
  const maps = { async importLibrary() { return { Place: class { async fetchFields() { this.photos = []; } } }; } };
  assert.equal(await buscarFotoLocal(maps, 'sem-fotos'), null);
  await assert.rejects(buscarFotoLocal({ importLibrary: async () => { throw new Error('Sem permissão'); } }, 'demo'));
});
