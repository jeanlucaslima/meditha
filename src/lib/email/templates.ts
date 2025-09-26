// Email templates in PT-BR
export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export const getAccessEmailTemplate = (nome: string, magicLink: string): EmailTemplate => {
  const firstName = nome.split(' ')[0] || 'Olá';
  
  const subject = 'Seu acesso ao Desafio 7 Dias (Dormir Natural)';
  
  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; margin-bottom: 30px; }
    .logo { font-size: 24px; font-weight: bold; color: #2c5aa0; }
    .button { display: inline-block; padding: 15px 30px; background-color: #2c5aa0; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
    .button:hover { background-color: #1e3f73; }
    .benefits { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .benefits ul { margin: 0; padding-left: 20px; }
    .benefits li { margin-bottom: 8px; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #666; }
    .warning { background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">🌙 Dormir Natural</div>
  </div>
  
  <h1>Olá, ${firstName}!</h1>
  
  <p>Obrigado por adquirir o <strong>Desafio 7 Dias — Dormir Natural</strong>.</p>
  
  <div style="text-align: center;">
    <a href="${magicLink}" class="button">👉 Acessar minha área (clique aqui)</a>
  </div>
  
  <div class="warning">
    <strong>⏰ Importante:</strong> Este link é válido por 24 horas e só pode ser usado uma vez.
  </div>
  
  <div class="benefits">
    <h3>🎯 Dentro do programa, você vai encontrar:</h3>
    <ul>
      <li><strong>7 áudios guiados</strong> (5–10 min/noite)</li>
      <li><strong>Checklist diário</strong> para acompanhar seu progresso</li>
      <li><strong>Técnicas naturais anti-ansiedade</strong></li>
      <li><strong>Videoaulas curtas</strong> (opcional)</li>
    </ul>
  </div>
  
  <p>Se precisar de ajuda, basta responder este e-mail.</p>
  
  <p><strong>Bons sonhos! 🌙</strong></p>
  
  <p>Equipe Dormir Natural</p>
  
  <div class="footer">
    <p>Este e-mail foi enviado para ${nome} porque você adquiriu o Desafio 7 Dias.</p>
    <p>Se você não fez esta compra, entre em contato conosco imediatamente.</p>
  </div>
</body>
</html>
  `.trim();
  
  const text = `
Olá, ${firstName}!

Obrigado por adquirir o Desafio 7 Dias — Dormir Natural.

👉 ACESSE SUA ÁREA: ${magicLink}
(Válido por 24h - uso único)

🎯 Dentro do programa, você vai encontrar:
• 7 áudios guiados (5–10 min/noite)
• Checklist diário
• Técnicas naturais anti-ansiedade
• Videoaulas curtas (opcional)

Se precisar de ajuda, responda este e-mail.

Bons sonhos! 🌙
Equipe Dormir Natural

---
Este link é válido por 24 horas e só pode ser usado uma vez.
  `.trim();
  
  return { subject, html, text };
};
