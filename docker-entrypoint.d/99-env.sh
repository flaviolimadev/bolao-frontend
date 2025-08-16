#!/bin/sh
set -e

: "${VITE_API_URL:=}"

if [ -f /usr/share/nginx/html/env.js.tpl ]; then
  # Substitui a variável ${VITE_API_URL} (ou $VITE_API_URL) no template
  envsubst '${VITE_API_URL}' < /usr/share/nginx/html/env.js.tpl > /usr/share/nginx/html/env.js
fi
