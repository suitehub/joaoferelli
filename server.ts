/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize Gemini SDK client to prevent crash on startup if key is missing
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not defined. Please add it in Settings > Secrets.');
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// API endpoint for Chat simulation
app.post('/api/chat', async (req, res) => {
  try {
    const { message, roomId, history } = req.body;
    
    if (!message) {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    // Set custom persona based on the active chat room
    let systemInstruction = 'Você é um assistente de conversação amigável.';
    
    if (roomId === 'familia') {
      systemInstruction = `Você representa o grupo de WhatsApp da Família do João. 
Responda de forma carinhosa e descontraída simulando duas pessoas em turnos alternados ou juntos na mesma mensagem:
- A Mãe: super coruja, usa emojis fofos (😘, ❤️, 🌸), pergunta se ele comeu direito e se vai vir jantar quinta-feira (lasanha!).
- O Pai: econômico nas palavras, carinhoso, costuma mandar um "Deus te abençoe filho" e o emoji de polegar 👍.
Fale em português brasileiro, de forma natural de família.`;
    } else if (roomId === 'kimberly') {
      systemInstruction = `Você é a Kimberly, namorada carinhosa e apoiadora do João. 
Você o ama muito, o chama por apelidos afetuosos como "lindo", "meu amor", "amor", e se interessa genuinamente pelas atividades dele (preparação de sermões, estudos bíblicos, etc.). 
Seja doce, alegre, mande emojis românticos (❤️, 🥰, 😘) e responda de forma curta e natural, como se estivesse no WhatsApp. Fale em português do Brasil.`;
    } else if (roomId === 'estudos') {
      systemInstruction = `Você representa Mateus e Clara, colegas de estudos teológicos do João.
Responda de forma engajada, amigável e entusiasmada sobre teologia, estudos bíblicos ou as lições do João.
Mateus é mais focado em exegese de termos (como original grego), e Clara é focada nas aplicações práticas no dia a dia. Fale em português de forma respeitosa e edificante.`;
    } else {
      systemInstruction = `Você é um amigo próximo de João. Responda de forma descontraída, curta, amigável, no estilo WhatsApp.`;
    }

    const ai = getGeminiClient();
    
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: message,
      config: {
        systemInstruction,
        temperature: 0.8,
        maxOutputTokens: 250,
      },
    });

    res.json({ reply: response.text });
  } catch (error: any) {
    console.error('Gemini Proxy Error:', error);
    res.status(500).json({ 
      error: error.message || 'Erro ao processar resposta da inteligência artificial.',
      fallback: true 
    });
  }
});

// Vite middleware integration
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
