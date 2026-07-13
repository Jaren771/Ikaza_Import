import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Política de Privacidad | ikaZa Import",
  description: "Política de Privacidad y manejo de datos de ikaZa Import.",
};

export default function PrivacyPage() {
  return (
    <div className="ikaza-container py-12 max-w-4xl">
      <Link href="/" className="inline-flex items-center text-sm font-medium mb-8 hover:underline" style={{ color: "#006065" }}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver al inicio
      </Link>

      <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-border">
        <h1 className="font-headline text-4xl font-bold mb-4">Política de Privacidad</h1>
        <p className="text-muted-foreground mb-8 pb-8 border-b">
          Última actualización: {new Date().toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <div className="space-y-8 text-sm leading-relaxed" style={{ color: "#3e4949" }}>
          <section>
            <h2 className="text-xl font-bold mb-3 text-foreground">1. Recopilación de Información</h2>
            <p>
              En ikaZa Import, respetamos su privacidad y estamos comprometidos a proteger sus datos personales. Recopilamos información personal cuando usted se registra, realiza una compra, se suscribe a nuestro boletín o interactúa con nuestro sitio. Esta información puede incluir su nombre, dirección de correo electrónico, número de teléfono, dirección de envío y detalles de pago.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-foreground">2. Uso de la Información</h2>
            <p className="mb-2">
              Utilizamos la información recopilada para los siguientes propósitos:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Procesar y gestionar sus pedidos y transacciones.</li>
              <li>Mejorar nuestro sitio web y la experiencia del cliente.</li>
              <li>Enviarle correos electrónicos periódicos sobre el estado de su pedido o promociones.</li>
              <li>Prevenir fraudes y garantizar la seguridad de su cuenta.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-foreground">3. Protección de Datos</h2>
            <p>
              Implementamos una variedad de medidas de seguridad para mantener la seguridad de su información personal. Sus datos sensibles, como información de tarjetas de crédito, se transmiten mediante tecnología SSL y se encriptan en las pasarelas de pago de nuestros proveedores (ej. Culqi, PayPal). Nosotros no almacenamos información de sus tarjetas en nuestros servidores.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-foreground">4. Cookies y Tecnologías Similares</h2>
            <p>
              Utilizamos cookies para entender y guardar sus preferencias para futuras visitas, además de compilar datos agregados sobre el tráfico y las interacciones en el sitio web con el fin de ofrecerle mejores experiencias y herramientas en el futuro. Puede configurar su navegador para que rechace todas las cookies, pero esto podría afectar el funcionamiento del sitio.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-foreground">5. Terceros</h2>
            <p>
              No vendemos, intercambiamos ni transferimos a terceros su información personal identificable. Esto no incluye a terceros de confianza que nos asisten en operar nuestro sitio web, dirigir nuestro negocio o brindarle servicio a usted, siempre y cuando estas partes acuerden mantener esta información confidencial.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-foreground">6. Derechos del Usuario (Ley de Protección de Datos - Perú)</h2>
            <p>
              De acuerdo con la Ley N° 29733 (Ley de Protección de Datos Personales del Perú), usted tiene derecho a acceder, rectificar, cancelar u oponerse al tratamiento de sus datos personales. Si desea ejercer alguno de estos derechos, puede comunicarse con nosotros a través de nuestro correo de soporte.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
