// Lectura en voz alta con la síntesis de voz del navegador (Web Speech API).
//
// El texto se trocea en frases cortas antes de hablar: Chrome corta las
// locuciones largas, y el troceo permite además que pausar, reanudar y
// detener respondan al momento. Cuando se agota el texto de la página o el
// capítulo, se pide avanzar y se continúa; las páginas sin texto (escaneos)
// se saltan hasta un límite prudente.

const MAXIMO_FRASE = 220;
const PAGINAS_VACIAS_SEGUIDAS = 20;

export function trocearTexto(texto, maximo = MAXIMO_FRASE) {
  const limpio = String(texto ?? '').replace(/\s+/g, ' ').trim();
  if (!limpio) return [];
  const frases = limpio.match(/[^.!?…]+[.!?…]+["»”')\]]*\s*|[^.!?…]+$/g) ?? [limpio];
  const resultado = [];
  for (const frase of frases) {
    let resto = frase.trim();
    while (resto.length > maximo) {
      let corte = resto.lastIndexOf(',', maximo);
      if (corte < maximo * 0.4) corte = resto.lastIndexOf(' ', maximo);
      if (corte <= 0) corte = maximo;
      resultado.push(resto.slice(0, corte + 1).trim());
      resto = resto.slice(corte + 1).trim();
    }
    if (resto) resultado.push(resto);
  }
  return resultado;
}

export class LectorVoz {
  // obtenerTexto(): texto desde la posición actual (página o resto del capítulo).
  // avanzar(): pasa a la página o capítulo siguiente; false al final del libro.
  // alCambiarEstado(estado): 'parado' | 'leyendo' | 'pausado'.
  // alFallo(clave): clave i18n del problema ('ttsNoText').
  constructor({ obtenerTexto, avanzar, alCambiarEstado, alFallo }) {
    this.obtenerTexto = obtenerTexto;
    this.avanzar = avanzar;
    this.alCambiarEstado = alCambiarEstado;
    this.alFallo = alFallo;

    this.sintesis = typeof window !== 'undefined' ? window.speechSynthesis ?? null : null;
    this.estado = 'parado';
    this.frases = [];
    this.indice = 0;
    this.voz = null;      // SpeechSynthesisVoice elegida, o null para automática
    this.idioma = null;   // idioma del libro cuando no hay voz elegida
    this.velocidad = 1;
    // Cada inicio o parada invalida la sesión anterior: los eventos de las
    // locuciones antiguas que lleguen tarde no deben reanudar nada.
    this.sesion = 0;
  }

  disponible() {
    return Boolean(this.sintesis);
  }

  voces() {
    return this.sintesis?.getVoices() ?? [];
  }

  cambiarEstado(estado) {
    if (estado === this.estado) return;
    this.estado = estado;
    this.alCambiarEstado?.(estado);
  }

  async iniciar() {
    if (!this.disponible()) return;
    this.detener();
    const sesion = ++this.sesion;
    this.frases = trocearTexto(await this.obtenerTexto());
    this.indice = 0;
    if (sesion !== this.sesion) return;
    this.cambiarEstado('leyendo');
    if (!this.frases.length) return this.avanzarYSeguir(sesion, 1);
    this.hablarSiguiente(sesion);
  }

  hablarSiguiente(sesion) {
    if (sesion !== this.sesion) return;
    if (this.indice >= this.frases.length) return void this.avanzarYSeguir(sesion, 0);
    const locucion = new SpeechSynthesisUtterance(this.frases[this.indice++]);
    if (this.voz) locucion.voice = this.voz;
    else if (this.idioma) locucion.lang = this.idioma;
    locucion.rate = this.velocidad;
    locucion.onend = () => this.hablarSiguiente(sesion);
    locucion.onerror = (evento) => {
      // 'interrupted' y 'canceled' son consecuencia de cancel(): no se sigue.
      if (evento.error === 'interrupted' || evento.error === 'canceled') return;
      this.hablarSiguiente(sesion);
    };
    this.sintesis.speak(locucion);
  }

  async avanzarYSeguir(sesion, vaciasSeguidas) {
    while (sesion === this.sesion) {
      if (vaciasSeguidas > PAGINAS_VACIAS_SEGUIDAS) {
        this.detener();
        this.alFallo?.('ttsNoText');
        return;
      }
      const hay = await this.avanzar();
      if (sesion !== this.sesion) return;
      if (!hay) {
        // Fin del libro: si nunca hubo texto, el problema es otro.
        this.detener();
        if (vaciasSeguidas > 0 && this.frases.length === 0) this.alFallo?.('ttsNoText');
        return;
      }
      this.frases = trocearTexto(await this.obtenerTexto());
      this.indice = 0;
      if (sesion !== this.sesion) return;
      if (this.frases.length) return this.hablarSiguiente(sesion);
      vaciasSeguidas += 1;
    }
  }

  pausar() {
    if (this.estado !== 'leyendo') return;
    this.sintesis.pause();
    this.cambiarEstado('pausado');
  }

  reanudar() {
    if (this.estado !== 'pausado') return;
    this.sintesis.resume();
    this.cambiarEstado('leyendo');
  }

  detener() {
    this.sesion += 1;
    this.frases = [];
    this.indice = 0;
    try {
      this.sintesis?.cancel();
      // Un cancel() con la síntesis pausada deja bloqueados algunos motores.
      this.sintesis?.resume?.();
      this.sintesis?.cancel();
    } catch { /* sin síntesis no hay nada que cancelar */ }
    this.cambiarEstado('parado');
  }
}
