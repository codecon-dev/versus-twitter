import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FaHeart, FaRetweet, FaComment, FaUserPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import api from '../api';

export default function Notifications() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications').then((res) => res.data),
  });

  const markReadMutation = useMutation({
    mutationFn: () => api.patch('/notifications/mark-read'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  useEffect(() => {
    // When the user opens the page, mark all as read automatically
    markReadMutation.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'LIKE': return <FaHeart className="text-danger" size={24} />;
      case 'RETWEET': return <FaRetweet className="text-success" size={24} />;
      case 'COMMENT': return <FaComment className="text-primary" size={24} />;
      case 'FOLLOW': return <FaUserPlus className="text-info" size={24} />;
      default: return null;
    }
  };

  const getMessage = (n: any) => {
    const boldName = <span className="fw-bold text-white">{n.actor.name}</span>;
    switch (n.type) {
      case 'LIKE': return <>{boldName} liked your post</>;
      case 'RETWEET': return <>{boldName} retweeted your post</>;
      case 'COMMENT': return <>{boldName} replied to your post</>;
      case 'FOLLOW': return <>{boldName} followed you</>;
      default: return null;
    }
  };

  const handleClick = (n: any) => {
    if (n.type === 'FOLLOW') {
      navigate(`/${n.actor.username}`);
    } else if (n.post && n.postId) {
      // Need the original author username to build the post link
      // Since it's our post, it's our username.
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      navigate(`/${currentUser.username}/status/${n.postId}`);
    }
  };

  return (
    <div className="w-100 min-vh-100 pb-5">
      <div className="page-header">
        <h2 className="mb-0 fw-bold fs-5">Notifications</h2>
      </div>

      {isLoading ? (
        <div className="text-center p-5 text-secondary">Loading notifications...</div>
      ) : notifications?.length === 0 ? (
        <div className="text-center p-5 mt-5">
          <h3 className="fw-bold text-white">Nothing to see here — yet</h3>
          <p className="text-secondary mt-2">When someone likes, retweets, or replies to your post, or follows you, you'll see it here.</p>
        </div>
      ) : (
        <div>
          {notifications?.map((n: any) => (
            <div 
              key={n.id} 
              className={`p-3 border-bottom border-secondary d-flex gap-3 hover-bg-secondary ${!n.read ? 'bg-dark' : ''}`}
              style={{ cursor: 'pointer', transition: 'background-color 0.2s' }}
              onClick={() => handleClick(n)}
            >
              <div className="pt-1" style={{ width: '40px', flexShrink: 0, textAlign: 'right' }}>
                {getIcon(n.type)}
              </div>
              <div className="flex-grow-1">
                <div className="bg-secondary rounded-circle mb-2 d-flex justify-content-center align-items-center overflow-hidden" style={{ width: '32px', height: '32px' }}>
                  {n.actor.profilePic ? (
                    <img src={n.actor.profilePic} alt={n.actor.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span className="text-white fw-bold">{n.actor.name.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="fs-5 text-white mb-1">
                  {getMessage(n)}
                </div>
                {n.post && (
                  <div className="text-secondary mt-1">
                    {n.post.content}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
