import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import { PostCard } from '../components/PostCard';
import { toast } from 'react-toastify';

export default function Feed({ feedType = 'all' }: { feedType?: 'all' | 'following' }) {
  const [content, setContent] = useState('');
  const queryClient = useQueryClient();
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  const queryKey = feedType === 'all' ? ['posts'] : ['feed'];
  const endpoint = feedType === 'all' ? '/posts' : '/posts/feed';

  const { data: posts, isLoading } = useQuery({
    queryKey,
    queryFn: () => api.get(endpoint).then((res) => res.data),
  });

  const mutation = useMutation({
    mutationFn: (newPost: { content: string }) => api.post('/posts', newPost),
    onSuccess: () => {
      setContent('');
      queryClient.invalidateQueries({ queryKey });
      toast.success('Posted!');
    },
    onError: () => {
      toast.error('Failed to post');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.length > 0 && content.length <= 140) {
      mutation.mutate({ content });
    }
  };

  return (
    <div className="w-100 min-vh-100 pb-5">
      <div className="page-header d-flex align-items-center">
        {feedType === 'all' ? 'Home' : 'Following'}
      </div>
      
      <div className="p-3 border-bottom" style={{ borderColor: 'var(--border-color)' }}>
        <form onSubmit={handleSubmit}>
          <div className="d-flex gap-3">
            <div className="bg-secondary rounded-circle mt-1 d-flex justify-content-center align-items-center overflow-hidden" style={{ width: '48px', height: '48px', flexShrink: 0 }}>
              {currentUser.profilePic ? (
                <img src={currentUser.profilePic} alt={currentUser.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span className="text-white fw-bold fs-5">{currentUser.name?.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="flex-grow-1">
              <textarea
                className="form-control form-control-lg bg-transparent border-0 text-white fs-4 p-0 shadow-none mb-3"
                placeholder="What is happening?!"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                maxLength={140}
                style={{ resize: 'none', minHeight: '80px' }}
              />
              <div className="d-flex justify-content-between align-items-center border-top pt-3" style={{ borderColor: 'var(--border-color)' }}>
                <span className={`small ${content.length > 130 ? 'text-danger' : 'text-primary'}`}>
                  {content.length}/140
                </span>
                <button 
                  type="submit" 
                  className="btn btn-primary-custom rounded-pill fw-bold"
                  disabled={content.length === 0 || content.length > 140 || mutation.isPending}
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      <div>
        {isLoading ? (
          <div className="text-center p-4 text-secondary">Loading feed...</div>
        ) : posts?.length === 0 ? (
          <div className="text-center p-5 text-secondary">
            <h3>Welcome to CodeCon!</h3>
            <p>Follow users or write your first post to populate your feed.</p>
          </div>
        ) : (
          posts?.map((post: any) => (
            <PostCard key={post.id} post={post} />
          ))
        )}
      </div>
    </div>
  );
}
