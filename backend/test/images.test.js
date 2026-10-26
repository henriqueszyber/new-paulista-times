import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';
import imageRepository from '../src/repositories/imageRepository.js';
import { imageMime, MAX_IMAGE_SIZE } from '../src/images.js';

const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aB9kAAAAASUVORK5CYII=', 'base64');
const publicId = 'new-paulista-times/12345678-1234-1234-1234-123456789abc';
const uploaded = { imageUrl: 'https://res.cloudinary.com/test-cloud/image/upload/v1/' + publicId + '.png', imagePublicId: publicId };

function multipart(files) {
  const boundary = 'paulista-upload-test';
  const chunks = [];
  for (const file of files) {
    chunks.push(Buffer.from('--' + boundary + '\r\nContent-Disposition: form-data; name="image"; filename="capa.png"\r\nContent-Type: ' + file.type + '\r\n\r\n'));
    chunks.push(file.buffer, Buffer.from('\r\n'));
  }
  chunks.push(Buffer.from('--' + boundary + '--\r\n'));
  return { headers: { 'content-type': 'multipart/form-data; boundary=' + boundary }, payload: Buffer.concat(chunks) };
}

test('upload: login, tamanho, formato, falha externa e dados da capa no banco', async () => {
  process.env.NEWS_DB_PATH = ':memory:';
  process.env.CLOUDINARY_CLOUD_NAME = 'test-cloud';
  const originalUpload = imageRepository.upload;
  const originalConfigured = imageRepository.isConfigured;
  let calls = 0;
  imageRepository.isConfigured = () => true;
  imageRepository.upload = async () => { calls++; return uploaded; };
  const app = createApp();
  const upload = async (files, token) => {
    const body = multipart(files);
    if (token) body.headers.authorization = 'Bearer ' + token;
    return app.inject({ method: 'POST', url: '/api/images', ...body });
  };
  try {
    assert.equal(imageMime(png), 'image/png');
    const file = { type: 'image/png', buffer: png };
    assert.equal((await upload([file])).statusCode, 401);
    const login = await app.inject({ method: 'POST', url: '/api/auth/login', payload: { email: 'writer@jynx.local', password: 'demo123' } });
    const headers = { authorization: 'Bearer ' + login.json().token };
    const token = login.json().token;
    imageRepository.isConfigured = () => false;
    assert.equal((await upload([file], token)).statusCode, 503);
    imageRepository.isConfigured = () => true;
    assert.equal((await upload([{ type: 'image/png', buffer: Buffer.from('<script>teste</script>') }], token)).statusCode, 400);
    assert.equal((await upload([{ type: 'image/jpeg', buffer: png }], token)).statusCode, 400);
    assert.equal((await upload([{ type: 'image/png', buffer: Buffer.alloc(MAX_IMAGE_SIZE + 1) }], token)).statusCode, 413);
    assert.equal((await upload([file, file], token)).statusCode, 400);
    assert.equal(calls, 0);
    const response = await upload([file], token);
    assert.equal(response.statusCode, 201);
    assert.deepEqual(response.json(), uploaded);
    assert.equal(calls, 1);
    imageRepository.upload = async () => { throw new Error('Detalhes privados do serviço'); };
    const failed = await upload([file], token);
    assert.equal(failed.statusCode, 502);
    assert.equal(failed.body.includes('privados'), false);

    const news = { title: 'Com capa', summary: 'Resumo', category: 'Cidade', status: 'published', content: { type: 'doc', blocks: [{ type: 'paragraph', spans: [{ text: 'Texto formatado', bold: true }] }] }, ...uploaded, imageAlt: 'Descrição da capa', imageCredit: 'Equipe' };
    const bad = await app.inject({ method: 'POST', url: '/api/news', headers, payload: { ...news, imageUrl: 'https://outro-site.example/capa.png' } });
    assert.equal(bad.statusCode, 400);
    const created = await app.inject({ method: 'POST', url: '/api/news', headers, payload: news });
    assert.equal(created.statusCode, 201, created.body);
    const id = created.json().id;
    const read = (await app.inject('/api/news/' + id)).json();
    assert.equal(read.imageUrl, uploaded.imageUrl);
    assert.equal(read.imageAlt, news.imageAlt);
    assert.deepEqual(read.content, news.content);
    assert.equal((await app.inject({ method: 'PUT', url: '/api/news/' + id, payload: news })).statusCode, 401);
    const withoutFields = { title: 'Capa mantida', summary: news.summary, category: news.category, status: news.status, content: news.content };
    const kept = await app.inject({ method: 'PUT', url: '/api/news/' + id, headers, payload: withoutFields });
    assert.equal(kept.json().imagePublicId, publicId);
    const removed = await app.inject({ method: 'PUT', url: '/api/news/' + id, headers, payload: { ...withoutFields, imageUrl: '' } });
    assert.equal(removed.json().imageUrl, '');
    assert.equal(removed.json().imagePublicId, '');
  } finally {
    await app.close();
    imageRepository.upload = originalUpload;
    imageRepository.isConfigured = originalConfigured;
    delete process.env.NEWS_DB_PATH;
    delete process.env.CLOUDINARY_CLOUD_NAME;
  }
});
