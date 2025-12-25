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
      localStorage.setItem('@Genial:token', response.data.token);
      localStorage.setItem('@Genial:user', JSON.stringify(response.data.user));

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
    <div className="flex min-h-screen items-center justify-center bg-slate-900 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-800">
            Evolution <span className="text-indigo-600">Manager</span>
          </h1>
          <p className="text-slate-500 mt-2">Gestão inteligente de instâncias</p>
        </header>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">E-mail</label>
            <input
              type="email"
              className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
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
              className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 py-2.5 font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar no Painel'}
          </button>
        </form>
        <footer className="mt-8 text-center">
          <p className="text-xs text-slate-400">
            Desenvolvido por <span className="font-semibold">Raphael Oliveira</span>
          </p>
        </footer>
      </div>
    </div>
  );
}