export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

// Não confiamos apenas na extensão: conferimos também o começo do arquivo.
// Depois, o Cloudinary verifica se consegue ler a imagem completa.
export function imageMime(buffer) {
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return 'image/png';
  if (buffer.length >= 3 && buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255) return 'image/jpeg';
  if (buffer.length >= 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') return 'image/webp';
  return null;
}

// Ausência de campos em uma edição mantém a capa anterior.
// URL vazia significa remover a associação da capa, sem apagar o arquivo remoto.
export function readImageValues(body, previous = {}) {
  const values = {};
  const limits = { imageUrl: 2048, imagePublicId: 200, imageAlt: 300, imageCredit: 200 };
  for (const field in limits) {
    const value = body?.[field] === undefined ? (previous[field] || '') : body[field];
    if (typeof value !== 'string' || value.length > limits[field]) return { error: 'Os dados da capa são inválidos ou muito longos.' };
    values[field] = value.trim();
  }
  if (!values.imageUrl) return { values: { imageUrl: '', imagePublicId: '', imageAlt: '', imageCredit: '' } };
  if (!/^new-paulista-times\/[a-f0-9-]{36}$/.test(values.imagePublicId)) return { error: 'Selecione uma imagem enviada pelo portal.' };
  try {
    const url = new URL(values.imageUrl);
    const path = '/' + process.env.CLOUDINARY_CLOUD_NAME + '/image/upload/';
    const suffix = '/' + values.imagePublicId;
    if (url.protocol !== 'https:' || url.hostname !== 'res.cloudinary.com' || url.username || url.password || url.port || url.search || url.hash || !url.pathname.startsWith(path)) throw new Error();
    const imagePath = url.pathname.slice(path.length);
    if (!/^v\d+\//.test(imagePath) || !['jpg', 'png', 'webp'].some(format => imagePath.endsWith(suffix + '.' + format))) throw new Error();
  } catch {
    return { error: 'O endereço da capa não pertence ao Cloudinary configurado.' };
  }
  return { values };
}
