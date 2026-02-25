import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: (data: any) => api.post('/auth/login', data),
    onSuccess: (res) => {
      localStorage.setItem('token', res.data.access_token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/');
      toast.success('Logged in successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Login failed');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ username, password });
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 w-100">
      <div className="auth-container w-100">
        <h2 className="text-white mb-4 fw-bold">Sign in to CodeCon</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <input
              type="text"
              className="form-control form-control-lg bg-transparent text-white border-secondary"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <input
              type="password"
              className="form-control form-control-lg bg-transparent text-white border-secondary"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button 
            type="submit" 
            className="btn btn-light w-100 rounded-pill fw-bold py-2 mb-3"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Logging in...' : 'Log in'}
          </button>
        </form>
        <div className="text-center text-secondary">
          Don't have an account? <Link to="/register" className="text-primary text-decoration-none">Sign up</Link>
        </div>
      </div>
    </div>
  );
}
