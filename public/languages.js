// languages.js - Configuración multi-idioma
// Fácil de agregar nuevos idiomas copiando la estructura

const languages = {
  en: {
    // Header
    header: {
      title: "Biomechanical Analysis",
      subtitle: "AI-Powered Ergonomic Assessment",
      poweredBy: "Gemini AI"
    },
    
    // System Status
    status: {
      title: "System Status:",
      checking: "Checking connection...",
      connected: "Connected",
      disconnected: "Server disconnected",
      refresh: "Refresh"
    },
    
    // Capture Panel
    capture: {
      title: "Image Capture",
      placeholder: "Capture your work posture",
      placeholderSub: "Use camera or upload a photo",
      startCamera: "Start Camera",
      captureAnalyze: "Capture & Analyze",
      uploadImage: "Upload Image",
      stopCamera: "Stop Camera",
      analyzing: "Analyzing with Gemini AI...",
      analyzingTime: "This may take 5-10 seconds"
    },
    
    // Results Panel
    results: {
      title: "Analysis Results",
      noAnalysis: "No analysis yet",
      noAnalysisSub: "Capture an image to begin",
      score: "Ergonomic Score",
      analyzedBy: "Analyzed with",
      postureObserved: "Observed Posture",
      risksIdentified: "Identified Risks",
      recommendations: "Recommendations",
      poweredBy: "Analysis by Adapty Global • Powered by Google Gemini AI"
    },
    
    // Risk Levels
    risks: {
      high: "HIGH",
      medium: "MEDIUM",
      low: "LOW"
    },
    
    // Error Messages
    errors: {
      title: "Analysis Error",
      cameraAccess: "Error accessing camera: ",
      serverDown: "Check server status",
      apiKeyMissing: "⚠️ API Key not configured. Check .env file",
      invalidFormat: "Unsupported format. Use images (JPG, PNG) or videos.",
      general: "An error occurred during analysis"
    },
    
    // Footer
    footer: {
      copyright: "Biomechanical Analysis System • Adapty Global • Powered by Google Gemini AI"
    }
  },
  
  es: {
    // Header
    header: {
      title: "Análisis Biomecánico",
      subtitle: "Evaluación Ergonómica con IA",
      poweredBy: "Gemini AI"
    },
    
    // System Status
    status: {
      title: "Estado del Sistema:",
      checking: "Verificando conexión...",
      connected: "Conectado",
      disconnected: "Servidor desconectado",
      refresh: "Actualizar"
    },
    
    // Capture Panel
    capture: {
      title: "Captura de Imagen",
      placeholder: "Captura tu postura de trabajo",
      placeholderSub: "Usa la cámara o sube una foto",
      startCamera: "Activar Cámara",
      captureAnalyze: "Capturar y Analizar",
      uploadImage: "Subir Imagen",
      stopCamera: "Detener Cámara",
      analyzing: "Analizando con Gemini AI...",
      analyzingTime: "Esto puede tomar 5-10 segundos"
    },
    
    // Results Panel
    results: {
      title: "Resultados del Análisis",
      noAnalysis: "Sin análisis aún",
      noAnalysisSub: "Captura una imagen para comenzar",
      score: "Puntuación Ergonómica",
      analyzedBy: "Analizado con",
      postureObserved: "Postura Observada",
      risksIdentified: "Riesgos Identificados",
      recommendations: "Recomendaciones",
      poweredBy: "Análisis por Adapty Global • Powered by Google Gemini AI"
    },
    
    // Risk Levels
    risks: {
      high: "ALTO",
      medium: "MEDIO",
      low: "BAJO"
    },
    
    // Error Messages
    errors: {
      title: "Error en el Análisis",
      cameraAccess: "Error al acceder a la cámara: ",
      serverDown: "Verificar estado del servidor",
      apiKeyMissing: "⚠️ API Key no configurada. Revisa el archivo .env",
      invalidFormat: "Formato no soportado. Usa imágenes (JPG, PNG) o videos.",
      general: "Ocurrió un error durante el análisis"
    },
    
    // Footer
    footer: {
      copyright: "Sistema de Análisis Biomecánico • Adapty Global • Powered by Google Gemini AI"
    }
  }
};

// Idioma por defecto
const defaultLanguage = 'es';

// Obtener idioma del navegador o usar el predeterminado
function getLanguage() {
  const browserLang = navigator.language.split('-')[0];
  return languages[browserLang] ? browserLang : defaultLanguage;
}

// Exportar para uso en frontend
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { languages, defaultLanguage, getLanguage };
}
