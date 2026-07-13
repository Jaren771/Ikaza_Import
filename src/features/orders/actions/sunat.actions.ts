"use server";

import { SunatService } from "@/services/sunat/SunatService";
import type { ActionResult } from "@/types";

export async function queryDocumentAction(
  type: "DNI" | "RUC",
  documentNumber: string
): Promise<ActionResult<{ name: string; address?: string }>> {
  try {
    if (type === "DNI") {
      const data = await SunatService.getDni(documentNumber);
      return { 
        success: true, 
        data: { 
          name: `${data.nombres} ${data.apellido_paterno} ${data.apellido_materno}`.trim()
        } 
      };
    } else {
      const data = await SunatService.getRuc(documentNumber);
      return { 
        success: true, 
        data: { 
          name: data.razon_social,
          address: data.direccion_fiscal
        } 
      };
    }
  } catch (error: any) {
    return { success: false, error: error.message || "Error al consultar el documento" };
  }
}
