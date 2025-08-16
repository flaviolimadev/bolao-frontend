(function(){
  // Permite override em runtime da URL da API, independentemente do build
  // Coolify pode montar/gerar este arquivo com a variável correta
  var url = (window && window.__VITE_API_URL) || '';
  // Se o container definir ENV API_URL via Nginx, podemos ler por template
  try {
    // Caso o arquivo seja processado por envsubst, trocará ${VITE_API_URL}
    var tpl = '${VITE_API_URL}';
    if (tpl && tpl !== '${VITE_API_URL}') {
      url = tpl;
    }
  } catch (e) {}
  if (url) {
    window.__VITE_API_URL = url;
    try { localStorage.setItem('API_BASE_URL', url); } catch {}
  }
})();
