/* Aplica o tema antes da pintura (evita piscar). Claro é o padrão, independentemente do sistema. */
(function(){
  var t = null;
  try { t = localStorage.getItem('bf-theme'); } catch (e) {}
  document.documentElement.setAttribute('data-theme', t === 'dark' ? 'dark' : 'light');
})();
