import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Términos de Servicio | ikaZa Import",
  description: "Términos y condiciones de uso de ikaZa Import.",
};

export default function TermsPage() {
  return (
    <div className="ikaza-container py-12 max-w-4xl">
      <Link href="/" className="inline-flex items-center text-sm font-medium mb-8 hover:underline" style={{ color: "#006065" }}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver al inicio
      </Link>

      <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-border">
        <h1 className="font-headline text-4xl font-bold mb-4">Términos de Servicio</h1>
        <p className="text-muted-foreground mb-8 pb-8 border-b">
          Última actualización: {new Date().toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <div className="space-y-8 text-sm leading-relaxed" style={{ color: "#3e4949" }}>
          <section>
            <h2 className="text-xl font-bold mb-3 text-foreground">1. Introducción</h2>
            <p>
              Bienvenido a ikaZa Import. Estos Términos de Servicio rigen el uso de nuestro sitio web y los servicios ofrecidos por nuestra plataforma. Al acceder o utilizar nuestro sitio web, usted acepta estar sujeto a estos términos en su totalidad. Si no está de acuerdo con alguna parte de estos términos, no debe utilizar nuestro sitio web.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-foreground">2. Uso de la Plataforma</h2>
            <p className="mb-2">
              Usted acepta utilizar ikaZa Import únicamente con fines legales y de una manera que no infrinja los derechos de terceros, ni restrinja o inhiba el uso y disfrute de esta plataforma por parte de otros usuarios.
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Debe proporcionar información precisa, actual y completa durante el registro.</li>
              <li>Usted es responsable de mantener la confidencialidad de su cuenta y contraseña.</li>
              <li>Debe notificarnos inmediatamente sobre cualquier uso no autorizado de su cuenta.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-foreground">3. Productos y Precios</h2>
            <p>
              Nos esforzamos por garantizar que los detalles, descripciones y precios de los productos aparezcan de manera precisa en nuestro sitio web. Sin embargo, pueden ocurrir errores. Nos reservamos el derecho de corregir cualquier error, inexactitud u omisión, y de cambiar o actualizar la información en cualquier momento sin previo aviso. Todos los precios están en Soles (PEN) e incluyen los impuestos aplicables.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-foreground">4. Envíos y Devoluciones</h2>
            <p>
              Las políticas de envío y devolución están sujetas a condiciones específicas dependiendo del producto y su ubicación. ikaZa Import se compromete a despachar los productos en los plazos establecidos, pero no se hace responsable por retrasos debidos a fuerza mayor o problemas logísticos de los transportistas. Las devoluciones se aceptarán dentro del marco legal peruano de protección al consumidor.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-foreground">5. Limitación de Responsabilidad</h2>
            <p>
              ikaZa Import no será responsable por ningún daño directo, indirecto, incidental, especial o consecuente que resulte del uso o la imposibilidad de usar nuestro sitio web o por el costo de adquisición de bienes y servicios sustitutos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-foreground">6. Cambios en los Términos</h2>
            <p>
              Nos reservamos el derecho de modificar estos Términos de Servicio en cualquier momento. Cualquier cambio será publicado en esta página y entrará en vigor inmediatamente tras su publicación.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
