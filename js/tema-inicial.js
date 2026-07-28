// Tema antes de pintar nada: si esperase al módulo, la primera imagen sería
// del tema que no toca y se vería el cambio de golpe.
//
// Va en su propio archivo, y no incrustado en el HTML, por la política de
// seguridad (CSP): un script dentro de la página obligaría a repetir su hash
// en la cabecera y a rehacerlo con cada retoque, que es la clase de detalle
// que se olvida y deja de funcionar sin avisar. Se carga sin «defer» a
// propósito, para que se ejecute antes del primer pintado.
(() => {
  let guardado = null;
  try { guardado = localStorage.getItem('lector.tema'); } catch { /* sin almacenamiento */ }
  const colores = { claro: '#f8fafc', sepia: '#efe4cf', oscuro: '#0f172a' };
  const tema = colores[guardado] ? guardado
    : (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'oscuro' : 'claro');
  document.documentElement.dataset.tema = tema;
  if (tema !== 'claro') {
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', colores[tema]);
  }
})();
