// Envoyer le lead à l'API
async function submitLeadToAPI(formData) {
  try {
    const response = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Erreur API:", data.error);
      return { success: false, error: data.error };
    }

    return { success: true, id: data.id, ref: data.ref };
  } catch (err) {
    console.error("Erreur réseau:", err);
    return { success: false, error: "Erreur réseau" };
  }
}
