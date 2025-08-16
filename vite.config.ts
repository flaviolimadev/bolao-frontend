import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 🔧 GARANTIR QUE A VARIÁVEL SEJA LIDA CORRETAMENTE
  const apiUrl = process.env.VITE_API_URL || '';
  
  console.log('🔧 VITE_API_URL durante build:', apiUrl);
  
  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
      mode === 'development' &&
      componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    // 🔧 CONFIGURAÇÃO PARA VARIÁVEIS DE AMBIENTE
    define: {
      'import.meta.env.VITE_API_URL': JSON.stringify(apiUrl),
    },
  };
});
