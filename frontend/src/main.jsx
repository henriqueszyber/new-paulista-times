import Editoria from './pages/Editoria.jsx';
import Esportes from './pages/Esportes.jsx';
import TabelaBrasileirao from './components/TabelaBrasileirao.jsx';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Inicio from './pages/Inicio.jsx';
import Noticia from './pages/Noticia.jsx';
import Login from './pages/Login.jsx';
import Painel from './pages/Painel.jsx';
import NovaNoticia from './pages/NovaNoticia.jsx';
import Usuarios from './pages/Usuarios.jsx';
import NaoEncontrada from './pages/NaoEncontrada.jsx';
import './styles.css';

// A mesma organização de rotas do trabalho REACT 3.
const rotas = createBrowserRouter([
  { path: '/', element: <Inicio /> },
  { path: '/esportes', element: <Esportes /> },
  { path: '/economia', element: <Editoria key="economia" editoria="economia" /> },
  { path: '/sao-paulo', element: <Editoria key="sao-paulo" editoria="sao-paulo" /> },
  { path: '/embed/brasileirao', element: <main className="sports-embed"><TabelaBrasileirao /></main> },
  { path: '/noticia/:id', element: <Noticia /> },
  { path: '/login', element: <Login /> },
  { path: '/admin', element: <Painel /> },
  { path: '/admin/nova', element: <NovaNoticia /> },
  { path: '/admin/editar/:id', element: <NovaNoticia /> },
  { path: '/admin/usuarios', element: <Usuarios /> },
  { path: '*', element: <NaoEncontrada /> },
]);

createRoot(document.getElementById('root')).render(
  <RouterProvider router={rotas} />
);
