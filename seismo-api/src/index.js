import { GoogleGenerativeAI } from '@google/generative-ai';
import { Groq } from 'groq-sdk';

export default {
  async fetch(request, env) {

    //CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'OPTIONS, POST',
      'Access-Control-Allow-Headers': 'X-API-Key, X-Client-ID',
      'Access-Control-Max-Age': '86400', //How long can the response be cached
      'Access-Control-Allow-Credentials': 'true',
    };

    // Handle preflight requests
    if (request.method === 'OPTIONS') {

      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    // Only allow POST requests
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ analysis: "Method not Allowed. Don't mess with the extension." }), { 
        status: 405,
        headers: corsHeaders
      });
    }

    try {
      // Check for API key
      const apiKey = request.headers.get('X-API-Key');
      // console.log('API Key:', apiKey);
      // console.log('Expected API Key:', env.EXTENSION_API_KEY);
      if (!apiKey || apiKey !== env.EXTENSION_API_KEY) {
        return new Response(JSON.stringify({ analysis: "Unauthorized" }), { 
          status: 401,
          headers: corsHeaders
        });
      }

      const clientId = request.headers.get('X-Client-ID');
      const { type, hValue, error } = await request.json();
      const errorHash = await hashError(hValue);

      // Check cache
      const cachedAnalysis = await env.SEISMO_STORE.get(`cache_${errorHash}`);
      if (cachedAnalysis) {
        try {
          // Try to parse the cached analysis
          const parsedAnalysis = JSON.parse(cachedAnalysis);
          return new Response(JSON.stringify({ analysis: parsedAnalysis }), {
            headers: corsHeaders
          });
        } catch (parseError) {
          // If parsing fails, continue with getting a new analysis
          console.error('Cache parse error:', parseError);
        }
      }

      // Rate limiting for deep analysis
      if (type === 'deep') {
        const lastRequest = await env.SEISMO_STORE.get(`rate_${clientId}`);
        if (lastRequest && (Date.now() - parseInt(lastRequest)) < 60000) {
          return new Response(JSON.stringify({ 
            analysis: "You hit the Rate Limit. Please wait for sometime"
          }), { 
            status: 429,
            headers: corsHeaders
          });
        }
      }

      // Get analysis based on type
      let analysis;
      if (type === 'simple') {
        analysis = await getGeminiAnalysis(error, env.GEMINI_KEY);
      } else {
        analysis = await getGroqAnalysis(error, env.GROQ_KEY);
        await env.SEISMO_STORE.put(`rate_${clientId}`, Date.now().toString());
      }

      // Cache the response
      const ttl = type === 'simple' ? 86400 : 604800; // 1 day or 1 week
      await env.SEISMO_STORE.put(`cache_${errorHash}`, JSON.stringify(analysis), {
        expirationTtl: ttl
      });

      return new Response(JSON.stringify({ analysis }), {
          headers: corsHeaders
        }
      );

    } catch (err) {
      return new Response(JSON.stringify({ 
        analysis: "Error",
        error: err.message || 'Unknown error'
      }), {
        headers: corsHeaders,
        status: 500
      });
    }
  }
};

async function hashError(error) {
 const msgUint8 = new TextEncoder().encode(JSON.stringify(error));
 const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
 return Array.from(new Uint8Array(hashBuffer))
   .map(b => b.toString(16).padStart(2, '0'))
   .join('');
}

async function getGeminiAnalysis(error, apiKey) {
 const genAI = new GoogleGenerativeAI(apiKey);
 const model = genAI.getGenerativeModel({ model: "gemini-pro" });

 const prompt = `
   Error details:
   ${JSON.stringify(error, null, 2)}
   
   Provide a simple, non-technical explanation of what this error means and basic steps to resolve it. 
   Keep it under 2-3 sentences.
 `;

 const result = await model.generateContent(prompt);
 return result.response.text();
}

async function getGroqAnalysis(error, apiKey) {
 const groq = new Groq({
   apiKey: apiKey
 });

 const prompt = `
   Error details:
   ${JSON.stringify(error, null, 2)}
   
   Provide a developer-focused analysis in this format:
   • Root Cause: One clear sentence identifying the core issue
   • Quick Fix: 1-2 specific steps to resolve
   • Prevention: One key best practice
   
   Keep total response under 5 lines.
 `;

 const completion = await groq.chat.completions.create({
   messages: [{ role: "user", content: prompt }],
   model: "mixtral-8x7b-32768",
 });

 return completion.choices[0].message.content;
}