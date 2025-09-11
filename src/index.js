import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { initMercadoPago } from '@mercadopago/sdk-react';
import './index.css';
import App from './App';

// --- ACCIÓN REQUERIDA ---
// TODO: REEMPLAZA ESTO CON TU PUBLIC KEY DE PRODUCCIÓN DE MERCADO PAGO
const MERCADOPAGO_PUBLIC_KEY = "APP_USR-2b43cf78-e7af-49c4-a6ca-774e1c0774e4";

// Se inicializa la librería una sola vez con tu Public Key
initMercadoPago(MERCADOPAGO_PUBLIC_KEY, { locale: 'es-CO' });

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);