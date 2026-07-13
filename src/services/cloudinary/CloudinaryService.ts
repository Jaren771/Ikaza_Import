/**
 * CloudinaryService.ts
 * 
 * Plantilla de integración lista para Cloudinary.
 * Para funcionar, requiere instalar `cloudinary` via npm (`npm install cloudinary`).
 */

// import { v2 as cloudinary } from "cloudinary";

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

export class CloudinaryService {
  /**
   * Sube una imagen en base64 a Cloudinary
   */
  static async uploadImageBase64(base64Image: string, folder: string = "ikaza/products") {
    if (!process.env.CLOUDINARY_API_SECRET) {
      console.warn("Cloudinary keys missing. Simulando subida de imagen...");
      return { url: "https://via.placeholder.com/500", public_id: "mock_id" };
    }

    // Descomentar cuando la librería esté instalada y configurada
    /*
    try {
      const result = await cloudinary.uploader.upload(base64Image, {
        folder,
        resource_type: "image",
      });
      return {
        url: result.secure_url,
        public_id: result.public_id,
      };
    } catch (error) {
      console.error("[CloudinaryService.uploadImage]", error);
      throw new Error("Error al subir imagen a Cloudinary");
    }
    */
    return { url: "https://via.placeholder.com/500", public_id: "mock_id" };
  }

  /**
   * Elimina una imagen de Cloudinary
   */
  static async deleteImage(publicId: string) {
    if (!process.env.CLOUDINARY_API_SECRET) return true;

    // Descomentar cuando la librería esté instalada
    /*
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result.result === "ok";
    } catch (error) {
      console.error("[CloudinaryService.deleteImage]", error);
      return false;
    }
    */
    return true;
  }
}
