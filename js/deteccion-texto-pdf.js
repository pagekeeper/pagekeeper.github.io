// Comprueba si un PDF contiene una cantidad mínima de texto seleccionable.
// Se detiene en cuanto alcanza el umbral y cede periódicamente el control para
// que los documentos escaneados grandes no bloqueen la interfaz.

export async function contieneTextoUtil(documento, { umbral = 40, ceder } = {}) {
  if (!documento?.numPages || typeof documento.getPage !== 'function') return false;
  const pausar = ceder ?? (() => new Promise((resolver) => setTimeout(resolver, 0)));
  let caracteres = 0;

  for (let numero = 1; numero <= documento.numPages; numero++) {
    const pagina = await documento.getPage(numero);
    const contenido = await pagina.getTextContent();
    for (const elemento of contenido.items ?? []) {
      caracteres += String(elemento?.str ?? '').replace(/\s/g, '').length;
      if (caracteres >= umbral) return true;
    }
    if (numero % 8 === 0) await pausar();
  }
  return false;
}
