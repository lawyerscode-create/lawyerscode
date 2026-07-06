export default async function handler(request, response) {
  // 1. Handle browser pre-flight security requests (CORS)
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  try {
    // 2. Read the prompts sent from your index.html file
    const { system, message } = request.body;

    // 3. Grab your Gemini API Key safely from Vercel's Environment Variables
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return response.status(500).json({ error: "API Key missing on server configuration." });
    }

    // 4. Send the request to Google's official Gemini API endpoint
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    
    const googleResponse = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `${system}\n\nUser Request: ${message}` }]
        }]
      })
    });

    const data = await googleResponse.json();

    if (!googleResponse.ok) {
      return response.status(googleResponse.status).json({ error: data?.error?.message || "Google API Error" });
    }

    // 5. Extract the AI's answer text
    const aiText = data.candidates[0].content.parts[0].text;

    // 6. Return it back safely to your website front-end (index.html)
    return response.status(200).json({ text: aiText });

  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
}
