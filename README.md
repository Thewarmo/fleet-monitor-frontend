# Fleet Monitor Frontend

This is the web frontend for the Fleet Monitoring system, providing an interactive dashboard for monitoring vehicle fleets.

## Technologies Used

*   **Framework:** Next.js (React)
*   **Styling:** Tailwind CSS
*   **Mapping:** Google Maps API (`@react-google-maps/api`)
*   **Real-time Communication:** SignalR (`@microsoft/signalr`)
*   **State Management:** React Context API

## Setup Instructions

1.  **Prerequisites:**
    *   Node.js (LTS version recommended)
    *   npm or Yarn

2.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd fleet-monitor-frontend
    ```

3.  **Install Dependencies:**
    ```bash
    npm install
    # or yarn install
    ```

4.  **Environment Variables:**
    *   Create a `.env.local` file in the root of the project.
    *   Add your Google Maps API key:
        ```
        NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY
        NEXT_PUBLIC_API_BASE_URL=http://localhost:5000 # Or your backend API URL
        ```

## Running the Application

To run the development server:

```bash
npm run dev
# or yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Running Tests

To run the unit tests (using Jest and React Testing Library):

```bash
npm test
# or yarn test
```

## Offline Strategy

This application implements a basic offline strategy using a Service Worker. It caches static assets (App Shell) and dynamically caches API responses (cache-first, then network strategy) to provide a basic level of functionality when offline.

To test offline capabilities:
1.  Start the application.
2.  Open your browser's developer tools.
3.  Go to the "Application" tab -> "Service Workers".
4.  Check "Offline" checkbox.
5.  Reload the page.

Note: For full offline functionality, ensure all critical assets are listed in `public/service-worker.js` and consider more advanced caching strategies for dynamic data.