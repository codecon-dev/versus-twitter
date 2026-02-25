import { FaComment, FaRetweet, FaHeart } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import { toast } from 'react-toastify';

export function PostCard({ post }: { post: any }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const likeMutation = useMutation({
    mutationFn: () => api.post(`/posts/${post.id}/like`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['profilePosts'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (err: any) => {
      if (err.response?.status === 409) {
        // If already liked, then unlike
        api.delete(`/posts/${post.id}/like`).then(() => {
          queryClient.invalidateQueries({ queryKey: ['feed'] });
          queryClient.invalidateQueries({ queryKey: ['posts'] });
          queryClient.invalidateQueries({ queryKey: ['profilePosts'] });
          queryClient.invalidateQueries({ queryKey: ['profile'] });
        });
      } else {
        toast.error('Could not like post');
      }
    }
  });

  const retweetMutation = useMutation({
    mutationFn: () => api.post(`/posts/${post.id}/retweet`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['profilePosts'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (err: any) => {
      if (err.response?.status === 409) {
         api.delete(`/posts/${post.id}/retweet`).then(() => {
          queryClient.invalidateQueries({ queryKey: ['feed'] });
          queryClient.invalidateQueries({ queryKey: ['posts'] });
          queryClient.invalidateQueries({ queryKey: ['profilePosts'] });
          queryClient.invalidateQueries({ queryKey: ['profile'] });
        });
      } else {
        toast.error('Could not retweet');
      }
    }
  });

  return (
    <div 
      className="post-card" 
      onClick={() => navigate(`/${post.author.username}/status/${post.id}`)}
      style={{ cursor: 'pointer' }}
    >
      {post.isRetweet && (
        <div className="d-flex align-items-center gap-2 text-muted-custom mb-1 ms-5 ps-3" style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>
          <FaRetweet />
          <span>Retweeted by {post.retweetedBy || 'someone'}</span>
        </div>
      )}
      <div className="d-flex gap-3">
        <Link to={`/${post.author.username}`} className="text-decoration-none" onClick={(e) => e.stopPropagation()}>
          <div className="bg-secondary rounded-circle mt-1 d-flex justify-content-center align-items-center overflow-hidden" style={{ width: '48px', height: '48px', flexShrink: 0 }}>
            {post.author.profilePic ? (
              <img src={post.author.profilePic} alt={post.author.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span className="text-white fw-bold fs-5">{post.author.name.charAt(0).toUpperCase()}</span>
            )}
          </div>
        </Link>
        <div className="flex-grow-1">
          <div className="d-flex align-items-center gap-2">
            <Link to={`/${post.author.username}`} className="text-white fw-bold text-decoration-none hover-underline">
              {post.author.name}
            </Link>
            <span className="text-muted-custom">@{post.author.username}</span>
            <span className="text-muted-custom">·</span>
            <span className="text-muted-custom">{new Date(post.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="mt-1 fs-5 text-white" style={{ wordBreak: 'break-word' }}>
            {post.content}
          </div>
          <div className="d-flex justify-content-between mt-3 text-muted-custom" style={{ maxWidth: '400px' }}>
            <div 
              className="d-flex align-items-center gap-2" 
              role="button"
              onClick={(e) => { e.stopPropagation(); navigate(`/${post.author.username}/status/${post.id}`); }}
            >
              <FaComment /> {post._count?.comments || 0}
            </div>
            <div 
              className="d-flex align-items-center gap-2" 
              role="button" 
              onClick={(e) => { e.stopPropagation(); retweetMutation.mutate(); }}
              style={{ color: post._count.retweets > 0 ? '#00ba7c' : 'inherit' }}
            >
              <FaRetweet /> {post._count.retweets}
            </div>
            <div 
              className="d-flex align-items-center gap-2" 
              role="button" 
              onClick={(e) => { e.stopPropagation(); likeMutation.mutate(); }}
              style={{ color: post._count.likes > 0 ? '#f91880' : 'inherit' }}
            >
              <FaHeart /> {post._count.likes}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
