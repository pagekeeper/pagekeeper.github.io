#!/bin/sh
# SPDX-License-Identifier: MIT
# Compila la app de Android (ADR 9): app-release-bundle.aab para Google Play y
# app-release-signed.apk para instalarla a mano en un móvil de prueba.
# La clave de subida está fuera del repositorio, en ~/.config/pagekeeper/android/
# (con una copia en la carpeta de credenciales de Juanjo, android-pagekeeper).
set -eu
cd "$(dirname "$0")"
CLAVE="${CLAVE_ANDROID:-$HOME/.config/pagekeeper/android}"
[ -f "$CLAVE/upload.jks" ] && [ -f "$CLAVE/clau.env" ] || { echo "Falta la clave en $CLAVE" >&2; exit 1; }
ln -sf "$CLAVE/upload.jks" upload.jks
set -a; . "$CLAVE/clau.env"; set +a
BUBBLEWRAP="${BUBBLEWRAP:-$(command -v bubblewrap || echo "$HOME/.npm-global/bin/bubblewrap")}"
"$BUBBLEWRAP" build --skipPwaValidation
ls -l app-release-bundle.aab app-release-signed.apk
