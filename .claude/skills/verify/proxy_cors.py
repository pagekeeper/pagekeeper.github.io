"""Proxy mínimo que añade cabeceras CORS delante de rclone serve webdav."""
import http.server
import urllib.request
import urllib.error

TARGET = 'http://127.0.0.1:8767'
METODOS = ['GET', 'HEAD', 'PUT', 'POST', 'DELETE', 'PROPFIND', 'MKCOL', 'MOVE', 'COPY']


class Proxy(http.server.BaseHTTPRequestHandler):
    protocol_version = 'HTTP/1.1'

    def log_message(self, *args):
        pass

    def _cors(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', ', '.join(METODOS + ['OPTIONS']))
        self.send_header('Access-Control-Allow-Headers', '*')
        self.send_header('Access-Control-Expose-Headers', '*')

    def do_OPTIONS(self):
        self.send_response(204)
        self._cors()
        self.send_header('Content-Length', '0')
        self.end_headers()

    def _reenviar(self):
        largo = int(self.headers.get('Content-Length') or 0)
        cuerpo = self.rfile.read(largo) if largo else None
        peticion = urllib.request.Request(TARGET + self.path, data=cuerpo, method=self.command)
        for clave, valor in self.headers.items():
            if clave.lower() not in ('host', 'connection', 'content-length', 'origin'):
                peticion.add_header(clave, valor)
        try:
            respuesta = urllib.request.urlopen(peticion)
        except urllib.error.HTTPError as error:
            respuesta = error
        datos = respuesta.read()
        self.send_response(respuesta.status if hasattr(respuesta, 'status') else respuesta.code)
        for clave, valor in respuesta.headers.items():
            if clave.lower() not in ('connection', 'transfer-encoding', 'content-length'):
                self.send_header(clave, valor)
        self._cors()
        self.send_header('Content-Length', str(len(datos)))
        self.end_headers()
        self.wfile.write(datos)


for metodo in METODOS:
    setattr(Proxy, f'do_{metodo}', Proxy._reenviar)

http.server.ThreadingHTTPServer(('127.0.0.1', 8768), Proxy).serve_forever()
