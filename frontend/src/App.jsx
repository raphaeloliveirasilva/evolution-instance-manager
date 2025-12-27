import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import InstanceDetails from './pages/InstanceDetails';
import MainLayout from './layouts/MainLayout'; // Importe o Layout criado

// Função simples para verificar se o usuário está logado
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('@manager:token');
  return token ? children : <Navigate to="/" />;
};

function App() {
  return (
    <BrowserRouter>
      <Toaster 
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 4000,
          style: { background: '#fff', color: '#333' },
        }}
      />
      <Routes>
        {/* Rota Pública: Login */}
        <Route path="/" element={<Login />} />

        {/* --- ROTAS PRIVADAS COM LAYOUT --- */}
        {/* Envolvemos o MainLayout com o PrivateRoute */}
        <Route element={
          <PrivateRoute>
            <MainLayout />
          </PrivateRoute>
        }>
            {/* Estas rotas serão renderizadas dentro do <Outlet /> do MainLayout */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/instances/:id" element={<InstanceDetails />} />
        </Route>

        {/* Redireciona qualquer rota inexistente para o Login */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;