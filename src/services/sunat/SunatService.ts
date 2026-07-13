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

  /**
   * Genera una Boleta o Factura Electrónica (Entorno Sandbox API v3)
   */
  static async generateDocument(order: any) {
    const token = process.env.APISUNAT_TOKEN;
    if (!token) {
      throw new Error("API Token de ApiSunat no configurado (APISUNAT_TOKEN)");
    }

    try {
      const isFactura = order.receiptType === "FACTURA";
      const docType = isFactura ? "factura" : "boleta";
      const serie = isFactura ? "F001" : "B001";
      // Usamos el timestamp como número correlativo (simplificación para pruebas)
      const numero = Math.floor(Date.now() / 1000) % 100000;
      
      const payload = {
        documento: docType,
        serie,
        numero,
        fecha_de_emision: new Date().toISOString().split("T")[0],
        moneda: "PEN",
        tipo_operacion: "0101",
        cliente_tipo_de_documento: isFactura ? "6" : "1",
        cliente_numero_de_documento: order.documentNumber,
        cliente_denominacion: order.customerName,
        cliente_direccion: order.shippingMethod === "DELIVERY" ? "LIMA, LIMA" : "TIENDA",
        items: order.items.map((item: any) => ({
          unidad_de_medida: "NIU",
          descripcion: item.productName,
          cantidad: String(item.quantity),
          valor_unitario: Number(item.unitPrice).toFixed(6), // Precio sin IGV teórico, o con IGV si es exonerado. Para simplificar mandamos el precio base.
          porcentaje_igv: "18",
          codigo_tipo_afectacion_igv: "10",
          nombre_tributo: "IGV",
        })),
        total: Number(order.total).toFixed(2),
      };

      const response = await fetch("https://sandbox.apisunat.pe/api/v3/documents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || "Error al emitir comprobante en SUNAT");
      }

      return {
        success: true,
        pdf: data.payload?.pdf?.ticket || null,
        xml: data.payload?.xml || null,
      };
    } catch (error: any) {
      console.error("[SunatService.generateDocument]", error.message);
      return { success: false, error: error.message };
    }
  }
}
