import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Lock, User, AlertCircle, Loader2 } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const success = await login(username, password);
      if (success) {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid username or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-light flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-2xl">
        <div className="bg-primary-blue p-8 flex flex-col items-center">
          <div className="bg-white/10 p-4 rounded-full backdrop-blur-sm mb-4">
            <ShieldCheck className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">ECS Platform</h1>
          <p className="text-blue-100/80 text-sm mt-1">Evidence Collection System Login</p>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400 group-focus-within:text-primary-blue transition-colors" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-all"
                  placeholder="Enter your username"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-primary-blue transition-colors" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-bold text-white bg-primary-blue hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-blue transition-all transform active:scale-[0.98] ${
                isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-500">
              Authorized access only. All activities are monitored and logged.
            </p>
          </div>
        </div>
      </div>
      
      <div className="mt-8 text-gray-400 text-xs flex gap-4">
        <span>Admin: admin / sec-a-001</span>
        <span>Auditor: auditor / sec-aud-001</span>
      </div>
    </div>
  );
}
