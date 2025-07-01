import api from '../lib/api';
import { jwtDecode } from 'jwt-decode';

api.interceptors.request.use(
  (config) => {
    // No agregar token si es la ruta de login
    if (
      config.url &&
      !config.url.endsWith('/Auth/login')
    ) {
      const token = localStorage.getItem('jwt_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    // ... resto del código ...
    return config;
  },
  (error) => Promise.reject(error)
);

export const login = async (username: string, password: string): Promise<boolean> => {
  try {
    console.log('urlapi : '+ api.defaults.baseURL);
    const response = await api.post('/Auth/login', {
      username,
      password,
    });

    console.log('response : ', response.data);

    if (response.data && response.data.token) {
      localStorage.setItem('jwt_token', response.data.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;

      // Decodificar el token para obtener el userId
      const decoded: any = jwtDecode(response.data.token);
      const userId = decoded.sub;
      console.log('decoded token:', decoded);
      console.log('userId:', userId);

      if (userId) {
        // Obtener el vehículo del usuario
        const vehicleResponse = await api.get(`/Vehicles/by-user/${userId}`);
        console.log('vehicleResponse:', vehicleResponse.data);

        if (vehicleResponse.data) {
          localStorage.setItem('vehicle', JSON.stringify(vehicleResponse.data));
          console.log('Vehículo guardado en localStorage');
        } else {
          console.log('No se recibió data de vehículo');
        }
      } else {
        console.log('No se pudo extraer userId del token');
      }
      return true;
    }
    return false;
  } catch (error) {
    console.error('Login failed:', error);
    return false;
  }
};

export const logout = (): void => {
  localStorage.removeItem('jwt_token');
  delete api.defaults.headers.common['Authorization'];
};

export const getToken = (): string | null => {
  return localStorage.getItem('jwt_token');
};

export const setAuthHeader = (token: string | null): void => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};


        