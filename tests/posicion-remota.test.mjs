import test from 'node:test';
import assert from 'node:assert/strict';

import {
  claveDePosicion, distanciaPosiciones, decidirPosicionRemota, avisoDePosicion,
} from '../js/posicion-remota.js';

test('la posición se identifica por el CFI en EPUB y por la página en PDF', () => {
  assert.equal(claveDePosicion({ cfi: 'epubcfi(/6/4!/4/2)' }), 'epubcfi(/6/4!/4/2)');
  assert.equal(claveDePosicion({ pagina: 42 }), 'p42');
  assert.equal(claveDePosicion({}), null);
  assert.equal(claveDePosicion(null), null);
});

test('la distancia son páginas en PDF y puntos de porcentaje en EPUB', () => {
  assert.equal(distanciaPosiciones({ pagina: 120, paginas: 300 }, { pagina: 45, paginas: 300 }), 75);
  assert.equal(distanciaPosiciones({ pagina: 30.5, paginas: 100 }, { pagina: 28, paginas: 100 }), 2.5);
});

test('un porcentaje aproximado no sirve para medir la distancia', () => {
  const remoto = { pagina: 30, paginas: 100, porcentajeAproximado: true };
  assert.equal(distanciaPosiciones(remoto, { pagina: 10, paginas: 100 }), null);
  assert.equal(distanciaPosiciones({ pagina: 30 }, { pagina: 10, porcentajeAproximado: true }), null);
  assert.equal(distanciaPosiciones({ pagina: 30 }, {}), null);
});

test('sin haber leído aquí, la posición ajena se toma sin preguntar', () => {
  assert.equal(decidirPosicionRemota({
    clave: 'p120', claveApertura: 'p45', claveLector: 'p45',
  }), 'saltar');
});

test('habiendo leído aquí se pregunta en vez de mover la página', () => {
  assert.equal(decidirPosicionRemota({
    clave: 'p120', claveApertura: 'p45', claveLector: 'p60', distancia: 60,
  }), 'preguntar');
});

test('la posición que ya se está viendo no dispara nada', () => {
  assert.equal(decidirPosicionRemota({
    clave: 'p60', claveApertura: 'p45', claveLector: 'p60', distancia: 0,
  }), 'nada');
  assert.equal(decidirPosicionRemota({
    clave: 'p45', claveApertura: 'p45', claveLector: 'p60', distancia: 15,
  }), 'nada');
  assert.equal(decidirPosicionRemota({
    clave: null, claveApertura: 'p45', claveLector: 'p60',
  }), 'nada');
});

test('lo que ya se rechazó no se vuelve a preguntar', () => {
  assert.equal(decidirPosicionRemota({
    clave: 'p120', claveApertura: 'p45', claveLector: 'p60',
    claveDescartada: 'p120', distancia: 60,
  }), 'nada');
  // Pero otra posición nueva sí, que es lectura distinta de la rechazada.
  assert.equal(decidirPosicionRemota({
    clave: 'p200', claveApertura: 'p45', claveLector: 'p60',
    claveDescartada: 'p120', distancia: 140,
  }), 'preguntar');
});

test('una diferencia mínima no merece cartel', () => {
  assert.equal(decidirPosicionRemota({
    clave: 'epubcfi(/6/4!/4/2)', claveApertura: 'epubcfi(/6/4!/4/1)',
    claveLector: 'epubcfi(/6/4!/4/3)', distancia: 0.4,
  }), 'nada');
  // Y sin poder medirla tampoco: enseñar un número falso sería peor.
  assert.equal(decidirPosicionRemota({
    clave: 'epubcfi(/6/4!/4/2)', claveApertura: 'epubcfi(/6/4!/4/1)',
    claveLector: 'epubcfi(/6/4!/4/3)', distancia: null,
  }), 'nada');
});

test('el aviso lleva el texto y los números de cada formato', () => {
  assert.deepEqual(
    avisoDePosicion({ cfi: 'epubcfi(/6/4)', pagina: 62.4 }, { cfi: 'epubcfi(/6/2)', pagina: 30 }),
    { clave: 'remotePositionAskEpub', remoto: 62.4, local: 30, paginas: null },
  );
  assert.deepEqual(
    avisoDePosicion({ pagina: 120, paginas: 300 }, { pagina: 45, paginas: 300 }),
    { clave: 'remotePositionAskPdf', remoto: 120, local: 45, paginas: 300 },
  );
});
