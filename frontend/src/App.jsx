import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import InstanceDetails from './pages/InstanceDetails';

// Função simples para verificar se o usuário está logado
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('@Genial:token');
  // Se não tiver token, manda de volta para o login
  return token ? children : <Navigate to="/" />;
};

function App() {
  return (
    <BrowserRouter>
      <Toaster 
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          // Podemos definir um estilo padrão aqui se quiser
          duration: 4000,
          style: {
            background: '#fff',
            color: '#333',
          },
        }}
      />
      <Routes>
        {/* Rota Pública: Login */}
        <Route path="/" element={<Login />} />

        {/* Rota Privada: Dashboard (Protegida) */}
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } 
        />

        <Route 
          path="/instances/:id" 
          element={
            <PrivateRoute>
              <InstanceDetails />
            </PrivateRoute>
          } 
        />

        {/* Redireciona qualquer rota inexistente para o Login */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;