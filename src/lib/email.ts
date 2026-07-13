import nodemailer from "nodemailer";

// =============================================================================
// Servicio de Correo SMTP — ikaZa Import
// Basado en Patrón 14: Subdominio aislado y Branding Premium
// =============================================================================

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 465,
  secure: Number(process.env.SMTP_PORT) === 465, 
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER || "noreply@ikaza.com";
// Error Real #15 AGENTS.md: ADMIN_EMAIL tiene prioridad sobre SMTP_USER para correos al admin

/**
 * Plantilla HTML de Alta Gama para el código de verificación (OTP)
 */
const getVerificationEmailHtml = (code: string) => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verifica tu cuenta - ikaZa Import</title>
  <style>
    body {
      font-family: 'Syne', 'Inter', -apple-system, sans-serif;
      background-color: #fbf9f8;
      color: #1a1a1a;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
    }
    .header {
      background-color: #006065;
      padding: 32px 40px;
      text-align: center;
    }
    .header h1 {
      color: #ffffff;
      margin: 0;
      font-size: 24px;
      font-weight: 700;
      letter-spacing: -0.5px;
    }
    .content {
      padding: 40px;
      text-align: center;
    }
    .content p {
      font-size: 16px;
      line-height: 1.6;
      color: #555555;
      margin-bottom: 24px;
    }
    .otp-box {
      background-color: #f4f6f6;
      border: 1px solid #e0e6e6;
      border-radius: 12px;
      padding: 24px;
      margin: 32px 0;
    }
    .otp-code {
      font-size: 36px;
      font-weight: 800;
      letter-spacing: 8px;
      color: #006065;
      margin: 0;
    }
    .footer {
      background-color: #fbf9f8;
      padding: 24px 40px;
      text-align: center;
      font-size: 13px;
      color: #888888;
      border-top: 1px solid #f0f0f0;
    }
    .brand {
      color: #006065;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>ikaZa Import</h1>
    </div>
    <div class="content">
      <h2>¡Bienvenido a la red de importadores!</h2>
      <p>Estás a un paso de acceder a nuestro catálogo exclusivo de tecnología y hogar. Utiliza el siguiente código para verificar tu correo electrónico y activar tu cuenta.</p>
      
      <div class="otp-box">
        <p class="otp-code">${code}</p>
      </div>
      
      <p>Este código expira en 15 minutos. Si no solicitaste esta cuenta, puedes ignorar este mensaje.</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} <span class="brand">ikaZa Import</span>. Todos los derechos reservados.</p>
      <p>Este es un correo automático generado por nuestra plataforma segura.</p>
    </div>
  </div>
</body>
</html>
`;

export async function sendVerificationEmail(to: string, code: string) {
  try {
    const info = await transporter.sendMail({
      from: `"ikaZa Import" <${adminEmail}>`,
      to,
      subject: "Verifica tu cuenta - ikaZa Import",
      html: getVerificationEmailHtml(code),
    });

    console.log("Correo de verificación enviado:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error al enviar correo SMTP:", error);
    return false;
  }
}

/**
 * Plantilla HTML para Restablecer Contraseña (Código)
 */
const getPasswordResetHtml = (code: string) => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Recupera tu contraseña - ikaZa Import</title>
  <style>
    body { font-family: 'Syne', sans-serif; background-color: #fbf9f8; color: #1a1a1a; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.04); }
    .header { background-color: #006065; padding: 32px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
    .content { padding: 40px; text-align: center; }
    .code-box { display: inline-block; background-color: #f4f6f6; color: #006065; font-size: 32px; letter-spacing: 4px; padding: 16px 32px; border-radius: 8px; font-weight: bold; margin: 24px 0; }
    .footer { background-color: #fbf9f8; padding: 24px; text-align: center; font-size: 13px; color: #888888; border-top: 1px solid #f0f0f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>ikaZa Import</h1></div>
    <div class="content">
      <h2>Código de Seguridad</h2>
      <p>Ingresa el siguiente código de 6 dígitos para restablecer tu contraseña:</p>
      <div class="code-box">${code}</div>
      <p style="font-size:14px; color:#777;">Si no solicitaste esto, ignora este correo. El código expira en 1 hora.</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} ikaZa Import. Todos los derechos reservados.</p>
    </div>
  </div>
</body>
</html>
`;

export async function sendPasswordResetEmail(to: string, resetToken: string) {
  try {
    const info = await transporter.sendMail({
      from: `"ikaZa Import" <${adminEmail}>`,
      to,
      subject: "Código de Seguridad - ikaZa Import",
      html: getPasswordResetHtml(resetToken),
    });

    console.log("Correo de recuperación enviado:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error SMTP Recuperación:", error);
    return false;
  }
}

/**
 * Plantilla HTML para Recibo de Compra
 */
const getOrderReceiptHtml = (orderId: string, total: number, items: any[]) => {
  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.productName} (x${item.quantity})</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">S/ ${item.totalPrice.toFixed(2)}</td>
    </tr>
  `).join('');

  return `
  <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8">
    <title>Recibo de Compra - ikaZa Import</title>
    <style>
      body { font-family: 'Syne', sans-serif; background-color: #fbf9f8; color: #1a1a1a; margin: 0; padding: 0; }
      .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.04); }
      .header { background-color: #006065; padding: 32px; text-align: center; }
      .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
      .content { padding: 40px; }
      .total-box { background-color: #f4f6f6; border-radius: 8px; padding: 16px; text-align: center; margin-top: 24px; }
      .footer { background-color: #fbf9f8; padding: 24px; text-align: center; font-size: 13px; color: #888888; border-top: 1px solid #f0f0f0; }
      table { width: 100%; border-collapse: collapse; margin-top: 24px; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header"><h1>ikaZa Import</h1></div>
      <div class="content">
        <h2 style="text-align: center;">¡Gracias por tu compra!</h2>
        <p>Tu orden <strong>#${orderId}</strong> ha sido recibida y está siendo procesada.</p>
        
        <table>
          <thead>
            <tr>
              <th style="text-align: left; padding: 12px; background: #fafafa; border-bottom: 2px solid #ddd;">Producto</th>
              <th style="text-align: right; padding: 12px; background: #fafafa; border-bottom: 2px solid #ddd;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="total-box">
          <h3 style="margin: 0; color: #006065;">TOTAL PAGADO: S/ ${total.toFixed(2)}</h3>
        </div>
      </div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} ikaZa Import. Todos los derechos reservados.</p>
      </div>
    </div>
  </body>
  </html>
  `;
};

export async function sendOrderReceiptEmail(to: string, orderId: string, total: number, items: any[]) {
  try {
    const info = await transporter.sendMail({
      from: `"ikaZa Import" <${adminEmail}>`,
      to,
      subject: `Confirmación de Pedido #${orderId}`,
      html: getOrderReceiptHtml(orderId, total, items),
    });

    console.log("Recibo enviado:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error SMTP Recibo:", error);
    return false;
  }
}

/**
 * Plantilla HTML para Correo de Bienvenida
 */
const getWelcomeEmailHtml = (name: string) => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>¡Bienvenido a ikaZa Import!</title>
  <style>
    body { font-family: 'Syne', sans-serif; background-color: #fbf9f8; color: #1a1a1a; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.04); }
    .header { background-color: #006065; padding: 32px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
    .content { padding: 40px; text-align: center; }
    .footer { background-color: #fbf9f8; padding: 24px; text-align: center; font-size: 13px; color: #888888; border-top: 1px solid #f0f0f0; }
    .btn { display: inline-block; background-color: #fca311; color: #1a1a1a; padding: 12px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 24px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>ikaZa Import</h1></div>
    <div class="content">
      <h2>¡Hola ${name || 'Importador'}!</h2>
      <p>Nos emociona darte la bienvenida a la plataforma líder en tecnología y hogar. Tu cuenta ha sido creada exitosamente y ya está lista para usarse.</p>
      <p>Explora nuestro catálogo y descubre los mejores precios del mercado.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/catalog" class="btn">Ir al catálogo</a>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} ikaZa Import. Todos los derechos reservados.</p>
    </div>
  </div>
</body>
</html>
`;

export async function sendWelcomeEmail(to: string, name: string) {
  try {
    const info = await transporter.sendMail({
      from: '"ikaZa Import" <' + adminEmail + '>',
      to,
      subject: "¡Bienvenido a ikaZa Import!",
      html: getWelcomeEmailHtml(name),
    });

    console.log("Correo de bienvenida enviado:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error SMTP Bienvenida:", error);
    return false;
  }
}
