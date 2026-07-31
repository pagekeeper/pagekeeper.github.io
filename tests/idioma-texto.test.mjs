import test from 'node:test';
import assert from 'node:assert/strict';
import { detectarIdioma, idiomaUtil } from '../js/idioma-texto.js';

const MUESTRAS = {
  es: `Me hallaba trabajando, en mangas de camisa, con la ventana abierta, cuando ella
       entró en la habitación y me dijo que no había nadie fuera. Esto era muy raro,
       porque desde aquí se ve toda la calle y también el portal, y sus voces se oían
       como si estuvieran muy cerca, pero solo estaba el mismo hombre de siempre.`,
  ca: `Estava treballant amb la finestra oberta quan ella va entrar a l'habitació i em
       va dir que no hi havia ningú a fora. Això era molt estrany, perquè des d'aquest
       pis es veu tot el carrer i també el portal, i les seves veus se sentien fins
       aquí, però només hi era el mateix home de sempre.`,
  en: `I was working with the window open when she came into the room and told me that
       there was nobody outside. This was very strange, because from the window they
       could have seen the whole street and the door, and their voices were heard
       from here, but the same man was still there.`,
  fr: `Je travaillais avec la fenêtre ouverte dans une chambre quand elle est entrée et
       m'a dit qu'il n'y avait personne dehors. C'était très étrange, parce que des
       fenêtres on voit toute la rue, et les voix qui nous parvenaient étaient plus
       proches, mais il y avait toujours le même homme sur le trottoir.`,
  de: `Ich arbeitete mit dem offenen Fenster, als sie in das Zimmer kam und mir sagte,
       dass draußen niemand war. Das war sehr seltsam, denn von dem Fenster aus sieht
       man die ganze Straße und auch die Tür, und ihre Stimmen waren noch zu hören,
       aber es war nicht mehr der Mann, der immer da ist.`,
  gl: `Estaba a traballar coa fiestra aberta cando ela entrou no cuarto e díxome que
       non había ninguén fóra. Iso era moi estraño, porque dende a fiestra vese toda a
       rúa e tamén a porta, e aínda se oían as súas voces, mais era sempre o mesmo
       home, onde os seus pasos se perdían.`,
  eu: `Leihoa zabalik nuela lanean ari nintzen bat, bera gelara sartu zen eta esan
       zidan kanpoan ez zegoela inor. Hori oso bitxia zen, leihotik kale osoa ere
       ikusten baita, eta haien ahotsak oraindik entzuten ziren, baina beti gizon bera
       zen, orain egin dute dela.`,
  pt: `Eu estava trabalhando com a janela aberta quando ela entrou no quarto e me disse
       que não havia ninguém lá fora. Isso era muito estranho, porque da janela você vê
       toda a rua e também a porta, e depois as vozes ainda eram ouvidas, mas era
       sempre o mesmo homem, com o mesmo casaco.`,
};

test('reconoce el idioma de un párrafo corriente', () => {
  for (const [idioma, texto] of Object.entries(MUESTRAS)) {
    assert.equal(detectarIdioma(texto), idioma, `esperaba ${idioma}`);
  }
});

test('calla ante muestras demasiado cortas o sin palabras conocidas', () => {
  assert.equal(detectarIdioma('Capítulo primero'), null);
  assert.equal(detectarIdioma(''), null);
  assert.equal(detectarIdioma(null), null);
  assert.equal(detectarIdioma('xxx '.repeat(60)), null);
});

test('una cita suelta en otra lengua no cambia el idioma del texto', () => {
  const mezcla = `${MUESTRAS.es} The quick brown fox was there.`;
  assert.equal(detectarIdioma(mezcla), 'es');
});

test('acepta las etiquetas de idioma que el navegador entiende', () => {
  assert.ok(idiomaUtil('es'));
  assert.ok(idiomaUtil('ca-ES'));
  assert.ok(idiomaUtil('pt-BR'));
  assert.ok(idiomaUtil(' EN '));
});

test('rechaza las etiquetas de relleno y la basura', () => {
  for (const etiqueta of ['UND', 'und', 'mul', 'zxx', 'unknown', '', '  ', 'español', '1234', null, undefined]) {
    assert.equal(idiomaUtil(etiqueta), false, `debería rechazar ${etiqueta}`);
  }
});
