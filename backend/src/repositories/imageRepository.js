import { v2 as cloudinary } from 'cloudinary';
import { randomUUID } from 'node:crypto';

const imageRepository = {
  isConfigured() {
    return Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
  },

  // Recebe os bytes da imagem e devolve apenas o endereço e o identificador.
  async upload(buffer) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });

    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream({
        resource_type: 'image',
        public_id: 'new-paulista-times/' + randomUUID(),
        allowed_formats: ['jpg', 'png', 'webp'],
        overwrite: false,
        timeout: 60000,
      }, (error, result) => {
        if (error) return reject(error);
        resolve({ imageUrl: result.secure_url, imagePublicId: result.public_id });
      });
      stream.on('error', reject);
      stream.end(buffer);
    });
  },
};

export default imageRepository;
