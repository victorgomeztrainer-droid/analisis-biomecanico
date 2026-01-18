// server.js - Servidor backend para análisis biomecánico
// Adapty Global - Sistema de Análisis Ergonómico con IA

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Health check endpoint
app.get('/api/health', (req, res) => {
    const hasApiKey = !!process.env.GEMINI_API_KEY;
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        service: 'Adapty Global - Biomechanical Analysis API',
        model: 'gemini-2.0-flash-exp',
        apiKeyConfigured: hasApiKey,
        version: '1.0.0',
        port: PORT
    });
});

// Main analysis endpoint
app.post('/api/analyze', async (req, res) => {
    try {
        // Validate API key
        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ 
                error: 'API key not configured',
                message: 'Please configure GEMINI_API_KEY in environment variables',
                instructions: 'Visit https://aistudio.google.com/app/apikey to get your API key'
            });
        }

        const { imageData, language = 'es' } = req.body;

        if (!imageData) {
            return res.status(400).json({ 
                error: 'Invalid data',
                message: 'imageData is required in base64 format'
            });
        }

        console.log('📸 Imagen recibida para análisis...');
        console.log('🌐 Idioma:', language);

        // Build prompt based on language
        const prompts = {
            en: `You are an expert in occupational ergonomics and biomechanical analysis. Analyze this image of a person at their workstation or performing a work activity.

Evaluate the following ergonomic aspects:
1. Overall body posture (spine, neck, extremities)
2. Musculoskeletal risks by body zone
3. Ergonomic risk factors (angles, repetition, force)
4. Risk level for each affected zone

Respond ONLY with a valid JSON object (no markdown, no code blocks):

{
  "posture_general": "brief professional description of observed posture",
  "risks": [
    {
      "zone": "specific body zone name (Neck, Upper Back, Lower Back, Shoulders, Elbows, Wrists, Hips, Knees, etc.)",
      "level": "high|medium|low",
      "description": "technical description of identified biomechanical risk, including angles if possible"
    }
  ],
  "recommendations": [
    "specific actionable recommendation 1",
    "specific actionable recommendation 2",
    "specific actionable recommendation 3",
    "specific actionable recommendation 4"
  ],
  "ergonomic_score": integer from 0 to 100 (where 100 is perfect posture and 0 is extreme risk)
}

IMPORTANT: Respond ONLY with the JSON object, no additional explanations.`,
            
            es: `Eres un experto en ergonomía laboral y análisis biomecánico. Analiza esta imagen de una persona en su puesto de trabajo o realizando una actividad laboral.

Evalúa los siguientes aspectos ergonómicos:
1. Postura general del cuerpo (columna, cuello, extremidades)
2. Riesgos musculoesqueléticos por zona corporal
3. Factores de riesgo ergonómico (ángulos, repetición, fuerza)
4. Nivel de riesgo para cada zona afectada

Responde ÚNICAMENTE con un objeto JSON válido (sin markdown, sin bloques de código):

{
  "postura_general": "descripción breve y profesional de la postura observada",
  "riesgos": [
    {
      "zona": "nombre específico de la zona corporal (Cuello, Espalda superior, Espalda baja, Hombros, Codos, Muñecas, Caderas, Rodillas, etc.)",
      "nivel": "alto|medio|bajo",
      "descripcion": "descripción técnica del riesgo biomecánico identificado, incluyendo ángulos si es posible"
    }
  ],
  "recomendaciones": [
    "recomendación específica y accionable 1",
    "recomendación específica y accionable 2",
    "recomendación específica y accionable 3",
    "recomendación específica y accionable 4"
  ],
  "puntuacion_ergonomica": número entero del 0 al 100 (donde 100 es postura perfecta y 0 es riesgo extremo)
}

IMPORTANTE: Responde SOLO con el objeto JSON, sin explicaciones adicionales.`
        };

        const prompt = prompts[language] || prompts['es'];

        // Build Gemini API request
        const geminiPayload = {
            contents: [{
                parts: [
                    { text: prompt },
                    {
                        inline_data: {
                            mime_type: "image/jpeg",
                            data: imageData
                        }
                    }
                ]
            }],
            generationConfig: {
                temperature: 0.4,
                topK: 32,
                topP: 1,
                maxOutputTokens: 2048
            }
        };

        // Call Gemini API
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${process.env.GEMINI_API_KEY}`;
        
        console.log('🤖 Enviando a Gemini API...');

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(geminiPayload)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('❌ Error de Gemini API:', errorData);
            
            return res.status(response.status).json({ 
                error: 'Gemini API Error',
                message: errorData.error?.message || 'Error desconocido',
                status: response.status,
                details: errorData
            });
        }

        const data = await response.json();
        console.log('✅ Respuesta recibida de Gemini');

        // Extract text from response
        if (!data.candidates || !data.candidates[0]) {
            console.error('❌ Formato de respuesta inválido:', data);
            return res.status(500).json({ 
                error: 'Invalid Gemini response',
                message: 'No se pudo procesar la respuesta de IA',
                rawData: data
            });
        }

        const textResponse = data.candidates[0].content.parts[0].text;
        console.log('📝 Texto recibido:', textResponse.substring(0, 100) + '...');

        // Clean and parse JSON
        let cleanedText = textResponse.trim();
        cleanedText = cleanedText.replace(/```json\s*/g, '');
        cleanedText = cleanedText.replace(/```\s*/g, '');
        cleanedText = cleanedText.trim();

        let analysis;
        try {
            analysis = JSON.parse(cleanedText);
            console.log('✅ JSON parseado correctamente');
        } catch (parseError) {
            console.error('❌ Error al parsear JSON:', parseError.message);
            console.error('Texto recibido:', cleanedText);
            
            return res.status(500).json({ 
                error: 'Parse error',
                message: 'La IA no devolvió un JSON válido',
                rawResponse: cleanedText,
                parseError: parseError.message
            });
        }

        // Validate analysis structure (language-agnostic keys)
        const requiredKeys = language === 'es' 
            ? ['postura_general', 'riesgos', 'recomendaciones', 'puntuacion_ergonomica']
            : ['posture_general', 'risks', 'recommendations', 'ergonomic_score'];

        const hasAllKeys = requiredKeys.every(key => analysis.hasOwnProperty(key));

        if (!hasAllKeys) {
            console.error('❌ Estructura de análisis inválida:', analysis);
            return res.status(500).json({ 
                error: 'Incomplete analysis',
                message: 'El análisis no tiene la estructura esperada',
                receivedData: analysis,
                expectedKeys: requiredKeys
            });
        }

        console.log('✅ Análisis completado exitosamente');

        res.json({ 
            success: true,
            analysis: analysis,
            model: 'gemini-2.0-flash-exp',
            language: language,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Error general:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Serve main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ 
        error: 'Ruta no encontrada',
        path: req.path 
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('❌ Error no manejado:', err);
    res.status(500).json({ 
        error: 'Error interno del servidor',
        message: err.message 
    });
});

// Start server
app.listen(PORT, () => {
    console.log('\n' + '═'.repeat(60));
    console.log('🚀 ADAPTY GLOBAL - Servidor de Análisis Biomecánico');
    console.log('═'.repeat(60));
    console.log(`📍 URL: http://localhost:${PORT}`);
    console.log(`🏥 Aplicación: http://localhost:${PORT}`);
    console.log(`💚 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`🤖 Modelo: Google Gemini 2.0 Flash`);
    console.log(`🌐 Idiomas: Español, English`);
    console.log('═'.repeat(60));
    
    if (!process.env.GEMINI_API_KEY) {
        console.log('⚠️  ADVERTENCIA: GEMINI_API_KEY no configurada');
        console.log('   Configura la variable de entorno GEMINI_API_KEY');
        console.log('   Obtén tu key en: https://aistudio.google.com/app/apikey');
        console.log('═'.repeat(60));
    } else {
        console.log('✅ Gemini API Key configurada');
        console.log('✅ Sistema listo para análisis biomecánico');
        console.log('═'.repeat(60));
    }
    console.log('\n');
});
