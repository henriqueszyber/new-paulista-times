import imageRepository from '../repositories/imageRepository.js';
import { imageMime, MAX_IMAGE_SIZE } from '../images.js';

const imageController = {
  async upload(req, reply) {
    if (!imageRepository.isConfigured()) {
      return reply.code(503).send({ message: 'Upload indisponível. Configure o Cloudinary no backend e reinicie o servidor.' });
    }
    if (!req.isMultipart()) return reply.code(415).send({ message: 'Envie a imagem pelo campo de arquivo.' });

    let image;
    try {
      // Só uma imagem, sem outros campos nesta rota. Os textos são salvos na notícia.
      for await (const part of req.parts({ limits: { files: 1, fields: 0, parts: 1, fileSize: MAX_IMAGE_SIZE } })) {
        if (part.type !== 'file' || part.fieldname !== 'image') {
          return reply.code(400).send({ message: 'Use o campo image para enviar a capa.' });
        }
        const buffer = await part.toBuffer();
        if (!imageMime(buffer) || imageMime(buffer) !== part.mimetype) {
          return reply.code(400).send({ message: 'Use uma imagem JPEG, PNG ou WebP válida.' });
        }
        image = buffer;
      }
    } catch (error) {
      if (error.code === 'FST_REQ_FILE_TOO_LARGE') return reply.code(413).send({ message: 'A imagem deve ter no máximo 5 MB.' });
      return reply.code(400).send({ message: 'Envie apenas uma imagem JPEG, PNG ou WebP.' });
    }
    if (!image) return reply.code(400).send({ message: 'Selecione uma imagem.' });

    try {
      return reply.code(201).send(await imageRepository.upload(image));
    } catch {
      // Não expor erros completos do serviço: eles podem conter dados da conta.
      return reply.code(502).send({ message: 'Não foi possível enviar a imagem ao Cloudinary. Confira a conexão e a configuração e tente novamente.' });
    }
  },
};
export default imageController;
