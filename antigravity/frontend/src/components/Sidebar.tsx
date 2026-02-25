import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaHome, FaUser, FaSignOutAlt, FaUserFriends, FaBell } from 'react-icons/fa';
import { useQuery } from '@tanstack/react-query';
import api from '../api';

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications').then((res) => res.data),
    enabled: !!user,
    refetchInterval: 10000, // Poll every 10 seconds for new notifications
  });

  const unreadCount = notifications ? notifications.filter((n: any) => !n.read).length : 0;

  if (!user) return null;

  return (
    <div className="sidebar d-flex flex-column">
      <Link to="/" className="text-decoration-none text-white fs-3 font-weight-bold mb-4">
        CodeCon
      </Link>

      <nav className="nav flex-column gap-3 mb-auto">
        <Link 
          to="/" 
          className={`text-decoration-none d-flex align-items-center gap-3 fs-5 p-2 rounded-pill ${location.pathname === '/' ? 'font-weight-bold' : 'text-white'}`}
          style={{ transition: 'background-color 0.2s' }}
        >
          <FaHome /> Home
        </Link>
        <Link 
          to="/following" 
          className={`text-decoration-none d-flex align-items-center gap-3 fs-5 p-2 rounded-pill ${location.pathname === '/following' ? 'font-weight-bold' : 'text-white'}`}
          style={{ transition: 'background-color 0.2s' }}
        >
          <FaUserFriends /> Following
        </Link>
        <Link 
          to="/notifications" 
          className={`text-decoration-none d-flex align-items-center gap-3 fs-5 p-2 rounded-pill ${location.pathname === '/notifications' ? 'font-weight-bold' : 'text-white'}`}
          style={{ transition: 'background-color 0.2s' }}
        >
          <div className="position-relative">
            <FaBell />
            {unreadCount > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle" style={{ width: '10px', height: '10px' }}>
                <span className="visually-hidden">New alerts</span>
              </span>
            )}
          </div>
          Notifications
        </Link>
        <Link 
          to={`/${user.username}`} 
          className={`text-decoration-none d-flex align-items-center gap-3 fs-5 p-2 rounded-pill ${location.pathname === `/${user.username}` ? 'font-weight-bold' : 'text-white'}`}
          style={{ transition: 'background-color 0.2s' }}
        >
          <FaUser /> Profile
        </Link>
      </nav>

      <div className="mt-auto">
        <div className="d-flex align-items-center gap-2 mb-3">
          <div className="bg-secondary rounded-circle d-flex justify-content-center align-items-center overflow-hidden" style={{ width: '40px', height: '40px', flexShrink: 0 }}>
            {user.profilePic ? (
              <img src={user.profilePic} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span className="text-white fw-bold">{user.name.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div>
            <div className="font-weight-bold">{user.name}</div>
            <div className="text-muted-custom">@{user.username}</div>
          </div>
        </div>
        <button onClick={handleLogout} className="btn text-white w-100 d-flex align-items-center justify-content-center gap-2" style={{ border: '1px solid var(--border-color)'}}>
          <FaSignOutAlt /> Logout
        </button>
      </div>
    </div>
  );
}
