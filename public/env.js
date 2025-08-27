(function(){
  // 🔧 FORÇAR URL DA API PARA RESOLVER O ERRO "VITE_API_URL não configurado"
  var apiUrl = 'https://db-clientes-back-end.kl5dxx.easypanel.host';
  
  // Definir globalmente
  window.__VITE_API_URL = apiUrl;
  
  // Salvar no localStorage como fallback
  try { 
    localStorage.setItem('API_BASE_URL', apiUrl); 
    console.log('🔧 env.js: API_URL definida como', apiUrl);
  } catch (e) {
    console.warn('🔧 env.js: Erro ao salvar no localStorage:', e);
  }
  
  // Log para debug
  console.log('🔧 env.js carregado com sucesso');
})();
