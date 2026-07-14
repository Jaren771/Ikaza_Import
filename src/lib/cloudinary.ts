import { v2 as cloudinary } from 'cloudinary';

// Configurar con variables de entorno
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Sube un buffer (archivo en memoria) a Cloudinary y retorna la URL segura.
 */
export const uploadImageBuffer = async (buffer: Buffer, folder: string = "ikaza-products"): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary Upload Error:", error);
          reject(new Error("Error al subir imagen a Cloudinary"));
        } else if (result) {
          resolve(result.secure_url);
        } else {
          reject(new Error("No se obtuvo resultado de Cloudinary"));
        }
      }
    );

    uploadStream.end(buffer);
  });
};

export default cloudinary;
