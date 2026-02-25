import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api';

export default function Register() {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: (data: any) => api.post('/auth/register', data),
    onSuccess: (res) => {
      localStorage.setItem('token', res.data.access_token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/');
      toast.success('Account created successfully');
    },
    onError: (err: any) => {
      let msg = err.response?.data?.message || 'Registration failed';
      if (Array.isArray(msg)) msg = msg[0]; // Validation errors
      toast.error(msg);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ name, username, email, password });
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 w-100">
      <div className="auth-container w-100">
        <h2 className="text-white mb-4 fw-bold">Join CodeCon today</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <input
              type="text"
              className="form-control form-control-lg bg-transparent text-white border-secondary"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
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
          <div className="mb-3">
            <input
              type="email"
              className="form-control form-control-lg bg-transparent text-white border-secondary"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <input
              type="password"
              className="form-control form-control-lg bg-transparent text-white border-secondary"
              placeholder="Password (min 6 chars)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <button 
            type="submit" 
            className="btn btn-light w-100 rounded-pill fw-bold py-2 mb-3"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Creating account...' : 'Create account'}
          </button>
        </form>
        <div className="text-center text-secondary">
          Already have an account? <Link to="/login" className="text-primary text-decoration-none">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
