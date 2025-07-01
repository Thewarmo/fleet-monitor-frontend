# Fleet Monitor Frontend

Este es el frontend web del sistema de Monitoreo de Flotas, que proporciona un panel interactivo para monitorear flotas de vehículos.

## Tecnologías Utilizadas

*   **Framework:** Next.js (React)
*   **Estilos:** Tailwind CSS
*   **Mapas:** Google Maps API (`@react-google-maps/api`)
*   **Comunicación en Tiempo Real:** SignalR (`@microsoft/signalr`)
*   **Gestión de Estado:** React Context API

## Instrucciones de Configuración

1.  **Requisitos Previos:**
    *   Node.js (se recomienda la versión LTS)
    *   npm o Yarn

2.  **Clonar el repositorio:**
    ```bash
    git clone <tu-url-del-repositorio>
    cd fleet-monitor-frontend
    ```

3.  **Instalar Dependencias:**
    ```bash
    npm install
    # o yarn install
    ```

4.  **Variables de Entorno:**
    *   Crea un archivo `.env.local` en la raíz del proyecto.
    *   Agrega tu clave de API de Google Maps:
        ```
        NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=TU_CLAVE_DE_GOOGLE_MAPS
        NEXT_PUBLIC_API_BASE_URL=http://localhost:5000 # O la URL de tu API backend
        ```

## Ejecutar la Aplicación

Para ejecutar el servidor de desarrollo:

```bash
npm run dev
# o yarn dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver el resultado.

## Ejecutar Pruebas

Para ejecutar las pruebas unitarias (usando Jest y React Testing Library):

```bash
npm test
# o yarn test
```

## Estrategia Offline

Esta aplicación implementa una estrategia básica de funcionamiento offline utilizando un Service Worker. Se almacenan en caché los recursos estáticos (App Shell) y las respuestas de API de forma dinámica (estrategia de "cache primero, luego red") para proporcionar un nivel básico de funcionalidad sin conexión.

Para probar las capacidades offline:
1.  Inicia la aplicación.
2.  Abre las herramientas de desarrollo del navegador.
3.  Ve a la pestaña "Application" -> "Service Workers".
4.  Marca la casilla "Offline".
5.  Recarga la página.

Nota: Para una funcionalidad offline completa, asegúrate de que todos los recursos críticos estén listados en `public/service-worker.js` y considera estrategias de caché más avanzadas para los datos dinámicos.
