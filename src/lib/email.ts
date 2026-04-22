import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendLeadNotification(lead: any, analysis: any) {
  const from = process.env.RESEND_FROM || "noreply@madinevent.com";
  const to = process.env.NOTIFY_EMAIL || "contact@madinevent.com";

  const html = `
    <h2>Nouveau Lead: ${lead.firstname} ${lead.lastname}</h2>
    <p><strong>Référence:</strong> ${lead.ref}</p>
    <p><strong>Email:</strong> ${lead.email}</p>
    <p><strong>Téléphone:</strong> ${lead.phone}</p>
    <p><strong>Organisation:</strong> ${lead.org || "-"}</p>
    <p><strong>Score:</strong> ${lead.score}/100</p>
    <p><strong>Mode:</strong> ${lead.mode}</p>
    
    <h3>Résumé IA</h3>
    <p>${analysis.summary}</p>
    
    <h3>Recommandations</h3>
    <ul>
      ${analysis.recommendations.map((r: string) => `<li>${r}</li>`).join("")}
    </ul>
    
    <h3>Points d'attention</h3>
    <ul>
      ${analysis.attention_points.map((p: string) => `<li>${p}</li>`).join("")}
    </ul>
    
    <p><strong>Complexité:</strong> ${analysis.complexity}/5</p>
  `;

  try {
    await resend.emails.send({
      from,
      to,
      subject: `[MIP] Nouveau lead: ${lead.firstname} ${lead.lastname} (${lead.ref})`,
      html,
    });
  } catch (error) {
    console.error("Erreur email:", error);
  }
}
