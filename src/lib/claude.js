import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function analyzeBrief(leadData) {
  const prompt = `Analyse ce brief commercial et fournis:
1. Un résumé exécutif (2-3 phrases)
2. 3-5 recommandations concrètes
3. Points d'attention importants
4. Niveau de complexité (1-5)

Données:
- Nom: ${leadData.firstname} ${leadData.lastname}
- Organisation: ${leadData.org || "Non spécifiée"}
- Type d'événement: ${leadData.event_data?.type || "Non spécifié"}
- Public visé: ${leadData.audience_data?.size || "Non spécifié"} personnes
- Budget: ${leadData.means_data?.budget || "Non spécifié"}
- Délai: ${leadData.staging_data?.timeline || "Non spécifié"}
- Objectifs: ${leadData.intrigue_data?.objectives || "Non spécifiés"}

Réponds en JSON avec les clés: summary, recommendations (array), attention_points (array), complexity (number)`;

  try {
    const message = await client.messages.create({
      model: "claude-opus-4-20250805",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const responseText = message.content[0].type === "text" ? message.content[0].text : "";
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return {
      summary: responseText,
      recommendations: [],
      attention_points: [],
      complexity: 3,
    };
  } catch (error) {
    console.error("Erreur Claude:", error);
    return {
      summary: "Analyse non disponible",
      recommendations: [],
      attention_points: [],
      complexity: 0,
    };
  }
}
