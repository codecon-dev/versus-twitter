import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import { toast } from 'react-toastify';
import { PostCard } from '../components/PostCard';

export default function PostDetail() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  const { data: post, isLoading: postLoading, error: postError } = useQuery({
    queryKey: ['post', postId],
    queryFn: () => api.get(`/posts/${postId}`).then((res) => res.data),
  });

  const { data: comments, isLoading: commentsLoading } = useQuery({
    queryKey: ['comments', postId],
    queryFn: () => api.get(`/posts/${postId}/comments`).then((res) => res.data),
  });

  const commentMutation = useMutation({
    mutationFn: (newComment: { content: string }) => api.post(`/posts/${postId}/comments`, newComment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
      setContent('');
      toast.success('Reply submitted');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to submit reply');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    commentMutation.mutate({ content });
  };

  if (postLoading) return <div className="text-center p-5 text-secondary">Loading post...</div>;
  if (postError || !post) return <div className="text-center p-5 text-secondary">Post not found</div>;

  return (
    <div className="w-100 min-vh-100 pb-5">
      <div className="page-header d-flex align-items-center gap-4">
        <button className="btn btn-link text-white text-decoration-none fs-4" onClick={() => navigate(-1)}>
          &larr;
        </button>
        <h2 className="mb-0 fw-bold fs-5">Post</h2>
      </div>

      <div className="border-bottom border-secondary">
        <PostCard post={post} />
      </div>

      <div className="p-3 border-bottom border-secondary d-flex gap-3">
        <div className="bg-secondary rounded-circle mt-1 d-flex justify-content-center align-items-center overflow-hidden" style={{ width: '48px', height: '48px', flexShrink: 0 }}>
          {currentUser.profilePic ? (
            <img src={currentUser.profilePic} alt={currentUser.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span className="text-white fw-bold fs-5">{currentUser.name?.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <form className="flex-grow-1" onSubmit={handleSubmit}>
          <textarea
            className="form-control bg-transparent text-white border-0 shadow-none fs-5 p-2"
            rows={2}
            placeholder="Post your reply"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{ resize: 'none' }}
            maxLength={280}
          />
          <div className="d-flex justify-content-end mt-2">
            <button
              type="submit"
              className="btn btn-primary rounded-pill fw-bold px-4"
              disabled={!content.trim() || commentMutation.isPending}
            >
              Reply
            </button>
          </div>
        </form>
      </div>

      <div>
        {commentsLoading ? (
          <div className="text-center p-4 text-secondary">Loading comments...</div>
        ) : (
          comments?.map((comment: any) => (
            <div key={comment.id} className="post-card">
              <div className="d-flex gap-3">
                <div className="bg-secondary rounded-circle mt-1 d-flex justify-content-center align-items-center overflow-hidden" style={{ width: '48px', height: '48px', flexShrink: 0 }}>
                  {comment.author.profilePic ? (
                    <img src={comment.author.profilePic} alt={comment.author.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span className="text-white fw-bold fs-5">{comment.author.name.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center gap-2">
                    <span className="text-white fw-bold">{comment.author.name}</span>
                    <span className="text-muted-custom">@{comment.author.username}</span>
                    <span className="text-muted-custom">·</span>
                    <span className="text-muted-custom">{new Date(comment.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="mt-1 fs-5 text-white" style={{ wordBreak: 'break-word' }}>
                    {comment.content}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
