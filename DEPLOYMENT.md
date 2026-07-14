# Despliegue

## Producción en contenedor

El `Dockerfile` compila el export estático de Next en una etapa Node y lo sirve con nginx:

```bash
docker build --target production -t gaza-cenizas-del-olivo .
docker run --rm -p 8080:80 gaza-cenizas-del-olivo
```

## Vercel

Importar el repositorio, seleccionar pnpm y mantener el comando `pnpm build`. `next.config.ts` usa `output: "export"`; el resultado no necesita backend, secretos ni servicios externos.

Antes de publicar: regenerar assets, ejecutar lint/test/build/e2e, revisar licencias y sensibilidad cultural, probar rutas directas del hosting y verificar cabeceras de caché para PNG/JS.
