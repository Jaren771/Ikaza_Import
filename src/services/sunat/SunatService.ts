export class SunatService {
  // Según documentación: Entorno de pruebas (sandbox)
  private static apiUrl = "https://dev.apisunat.pe/api/v1"; 

  /**
   * Consulta los datos de un DNI peruano
   * Asume el endpoint equivalente a RUC en ApiSunat para DNI
   */
  static async getDni(dni: string) {
    const token = process.env.APISUNAT_TOKEN;
    if (!token) {
      throw new Error("API Token de ApiSunat no configurado (APISUNAT_TOKEN)");
    }

    try {
      // Nota: Si dev.apisunat.pe/api/v1/business/dni/{DNI} es el oficial:
      const response = await fetch(`${this.apiUrl}/business/dni/${dni}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || "Documento no existe en SUNAT");
      }

      return data.payload;
    } catch (error: any) {
      console.error("[SunatService.getDni]", error.message);
      throw error;
    }
  }

  /**
   * Consulta los datos de un RUC (Empresa)
   * Exactamente como dicta la documentación de ApiSunat
   */
  static async getRuc(ruc: string) {
    const token = process.env.APISUNAT_TOKEN;
    if (!token) {
      throw new Error("API Token de ApiSunat no configurado (APISUNAT_TOKEN)");
    }

    try {
      const response = await fetch(`${this.apiUrl}/business/ruc/${ruc}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || "Documento no existe en SUNAT");
      }

      // Retorna el payload exacto de ApiSunat: ruc, razon_social, estado, condicion, direccion_fiscal...
      return data.payload;
    } catch (error: any) {
      console.error("[SunatService.getRuc]", error.message);
      throw error;
    }
  }
}
