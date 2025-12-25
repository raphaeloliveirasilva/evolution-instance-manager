import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);

    const toastId = toast.loading('Autenticando...');
    try {
      const response = await api.post('/login', { email, password });
      toast.success('Bem-vindo ao Evolution Manager!', { id: toastId, duration: 4000 });
      localStorage.setItem('@manager:token', response.data.token);
      localStorage.setItem('@manager:user', JSON.stringify(response.data.user));

      // Redireciona para o dashboard
      navigate('/dashboard');
    } catch (error) {
      // Se deu erro:
      const mensagemErro = error.response?.data?.error || 'Falha na conexão com o servidor';
      toast.error(mensagemErro, { id: toastId });
      console.error('Erro no login:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
  // 1. CONTAINER EXTERNO
  // Adicionei 'sm:px-6 lg:px-8' para melhor controle em telas grandes
  <div className="flex min-h-screen items-center justify-center bg-slate-900 p-4 sm:px-6 lg:px-8">
    
    {/* 2. CARD PRINCIPAL */}
    {/* Mudamos de 'p-8' fixo para 'p-6 sm:p-8'. 
        No celular (p-6) ganha espaço, no PC (sm:p-8) fica elegante. */}
    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
      
      <header className="mb-8 text-center">
        {/* Título adaptável: text-2xl no celular, text-3xl no PC */}
        <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">
          Evolution <span className="text-indigo-600">Manager</span>
        </h1>
        <p className="mt-2 text-sm text-slate-500">Gestão inteligente de instâncias</p>
      </header>

      <form onSubmit={handleLogin} className="space-y-6">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">E-mail</label>
          <input
            type="email"
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Senha</label>
          <input
            type="password"
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          // Adicionei 'active:scale-95' para dar sensação de clique no celular
          // Mudei o padding para py-3 para facilitar o toque
          className="w-full transform rounded-lg bg-indigo-600 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:bg-indigo-700 hover:shadow-indigo-500/30 active:scale-95 disabled:cursor-not-allowed disabled:opacity-70 disabled:shadow-none"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
               {/* Spinner SVG simples */}
              <svg className="h-5 w-5 animate-spin text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Entrando...</span>
            </div>
          ) : (
            'Entrar no Painel'
          )}
        </button>
      </form>

      <footer className="mt-8 border-t border-slate-100 pt-6 text-center">
        <p className="text-xs text-slate-400">
          Desenvolvido por <span className="font-semibold text-slate-600">Raphael Oliveira</span>
        </p>
      </footer>
    </div>
  </div>
);
}