import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import { PostCard } from '../components/PostCard';
import { toast } from 'react-toastify';

export default function Profile() {
  const { username } = useParams<{ username: string }>();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('posts');
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', username],
    queryFn: () => api.get(`/users/${username}`).then((res) => res.data),
  });

  // For this basic clone we just fetch all posts and let the backend return the user's posts.
  // In a real app we'd fetch specific tabs from the backend (Likes, Retweets)
  // For now we'll just show the user's created posts in the profile.
  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ['profilePosts', username],
    // The backend endpoint GET /posts/user/:username uses `postsService.findUserPosts`
    queryFn: () => api.get(`/posts/user/${username}`).then((res) => res.data),
  });

  // Fetch current user following list to see if we follow this profile
  useQuery({
    queryKey: ['following', currentUser.id],
    queryFn: () => api.get(`/users/${currentUser.username}`).then(res => res.data),
    // we would actually need an endpoint to know if A follows B exactly, 
    // but we can just use the mutation optimistic update for the clone
  });
  
  // We'll manage a local follow state based on recent action
  const [isFollowing, setIsFollowing] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', username: '', password: '', profilePic: '' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => api.patch('/users/me', data),
    onSuccess: (data) => {
      // update local storage and invalidate queries
      const updatedUser = { 
        ...currentUser, 
        name: data.data.name, 
        username: data.data.username || currentUser.username, 
        profilePic: data.data.profilePic 
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      queryClient.invalidateQueries({ queryKey: ['profile', username] });
      // If username changed, we should probably redirect... but for simplicity let's just show success
      toast.success('Profile updated successfully');
      setIsEditModalOpen(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Could not update profile');
    }
  });

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const updateData: any = {};
    if (editForm.name && editForm.name !== profile.name) updateData.name = editForm.name;
    if (editForm.password) updateData.password = editForm.password;

    let newProfilePicUrl = editForm.profilePic;

    if (selectedFile) {
      const formData = new FormData();
      formData.append('file', selectedFile);
      try {
        const uploadRes = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        newProfilePicUrl = uploadRes.data.url;
      } catch (err: any) {
        toast.error('Failed to upload image');
        return;
      }
    }

    if (newProfilePicUrl !== profile.profilePic) updateData.profilePic = newProfilePicUrl;
    
    if (Object.keys(updateData).length > 0) {
      updateProfileMutation.mutate(updateData);
    } else {
      setIsEditModalOpen(false);
    }
  };

  const followMutation = useMutation({
    mutationFn: () => api.post(`/users/${username}/follow`),
    onSuccess: () => {
      setIsFollowing(true);
      queryClient.invalidateQueries({ queryKey: ['profile', username] });
      toast.success(`Followed @${username}`);
    },
    onError: (err: any) => {
      if (err.response?.status === 409) {
        setIsFollowing(true); // Already following
      } else {
        toast.error('Could not follow user');
      }
    }
  });

  const unfollowMutation = useMutation({
    mutationFn: () => api.delete(`/users/${username}/follow`),
    onSuccess: () => {
      setIsFollowing(false);
      queryClient.invalidateQueries({ queryKey: ['profile', username] });
      toast.success(`Unfollowed @${username}`);
    },
    onError: () => {
      toast.error('Could not unfollow user');
    }
  });

  if (profileLoading) return <div className="text-center p-5">Loading profile...</div>;
  if (!profile) return <div className="text-center p-5">User not found</div>;

  const isOwnProfile = profile.id === currentUser.id;

  return (
    <div className="w-100 min-vh-100 pb-5">
      <div className="page-header d-flex align-items-center gap-4">
        <div>
          <h2 className="mb-0 fw-bold fs-5">{profile.name}</h2>
          <div className="text-muted-custom small" style={{ fontSize: '0.85rem' }}>{posts?.length || 0} posts</div>
        </div>
      </div>
      
      {/* Profile Header Background */}
      <div className="bg-secondary" style={{ height: '200px' }}></div>
      
      <div className="px-3 position-relative">
        <div className="d-flex justify-content-between align-items-start">
          <div 
            className="bg-dark rounded-circle border border-dark border-4 overflow-hidden d-flex justify-content-center align-items-center" 
            style={{ width: '134px', height: '134px', marginTop: '-70px', backgroundColor: 'var(--secondary-color)' }}
          >
            {profile.profilePic ? (
              <img src={profile.profilePic} alt={profile.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span className="text-secondary fs-1">{profile.name.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className="mt-3">
            {!isOwnProfile && (
              isFollowing ? (
                <button 
                  className="btn rounded-pill fw-bold bg-transparent text-white border-secondary px-4 py-2"
                  onMouseEnter={(e) => { e.currentTarget.textContent = 'Unfollow'; e.currentTarget.classList.add('border-danger', 'text-danger'); }}
                  onMouseLeave={(e) => { e.currentTarget.textContent = 'Following'; e.currentTarget.classList.remove('border-danger', 'text-danger'); }}
                  onClick={() => unfollowMutation.mutate()}
                >
                  Following
                </button>
              ) : (
                <button 
                  className="btn btn-light rounded-pill fw-bold px-4 py-2"
                  onClick={() => followMutation.mutate()}
                >
                  Follow
                </button>
              )
            )}
            {isOwnProfile && (
              <button 
                className="btn rounded-pill fw-bold bg-transparent text-white border-secondary px-4 py-2"
                onClick={() => {
                  setEditForm({ name: profile.name || '', username: profile.username || '', password: '', profilePic: profile.profilePic || '' });
                  setSelectedFile(null);
                  setIsEditModalOpen(true);
                }}
              >
                Edit profile
              </button>
            )}
          </div>
        </div>
        
        <div className="mt-3">
          <h1 className="fw-bold fs-4 mb-0">{profile.name}</h1>
          <p className="text-muted-custom mb-2">@{profile.username}</p>
          <div className="d-flex gap-3 text-muted-custom mb-3">
            <span><span className="text-white fw-bold">{profile._count?.following || 0}</span> Following</span>
            <span><span className="text-white fw-bold">{profile._count?.followers || 0}</span> Followers</span>
            <span>Joined {new Date(profile.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="d-flex border-bottom" style={{ borderColor: 'var(--border-color)' }}>
        {['posts', 'likes', 'retweets'].map((tab) => (
          <div 
            key={tab}
            className="flex-grow-1 text-center py-3 position-relative hover-bg cursor-pointer"
            style={{ 
              color: activeTab === tab ? 'white' : 'var(--text-muted)',
              fontWeight: activeTab === tab ? 'bold' : 'normal',
              cursor: 'pointer'
            }}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {activeTab === tab && (
              <div 
                className="position-absolute bottom-0 start-50 translate-middle-x" 
                style={{ width: '56px', height: '4px', backgroundColor: 'var(--primary-color)', borderRadius: '9999px' }}
              ></div>
            )}
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="mt-1">
        {postsLoading ? (
           <div className="text-center p-4 text-secondary">Loading...</div>
        ) : (
          posts?.map((post: any) => (
            <PostCard key={post.id + (post.isRetweet ? '_rt' : '')} post={post} />
          ))
        )}
        {posts?.length === 0 && (
          <div className="text-center p-5 text-secondary">
             <h3>@{profile.username} hasn't posted anything</h3>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content bg-dark border-secondary">
              <div className="modal-header border-secondary">
                <h5 className="modal-title fw-bold">Edit profile</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setIsEditModalOpen(false)}></button>
              </div>
              <form onSubmit={handleEditSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label text-muted-custom">Name</label>
                    <input 
                      type="text" 
                      className="form-control bg-transparent text-white border-secondary" 
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted-custom">Username</label>
                    <input 
                      type="text" 
                      className="form-control bg-dark text-secondary border-secondary" 
                      value={editForm.username}
                      disabled
                      readOnly
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted-custom">New Password (leave blank to keep current)</label>
                    <input 
                      type="password" 
                      className="form-control bg-transparent text-white border-secondary" 
                      value={editForm.password}
                      onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted-custom">Upload Profile Picture (Optional)</label>
                    <input 
                      type="file" 
                      accept="image/*"
                      className="form-control bg-dark text-muted border-secondary mb-2" 
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    />
                    <label className="form-label text-muted-custom">Or enter a Profile Picture URL</label>
                    <input 
                      type="url" 
                      className="form-control bg-transparent text-white border-secondary" 
                      placeholder="https://example.com/image.jpg"
                      value={editForm.profilePic}
                      onChange={(e) => setEditForm({ ...editForm, profilePic: e.target.value })}
                      disabled={!!selectedFile} // disable URL input if a file is selected
                    />
                  </div>
                </div>
                <div className="modal-footer border-secondary">
                  <button type="button" className="btn btn-outline-secondary rounded-pill fw-bold" onClick={() => { setIsEditModalOpen(false); setSelectedFile(null); }}>Cancel</button>
                  <button type="submit" className="btn btn-light rounded-pill fw-bold" disabled={updateProfileMutation.isPending}>
                    {updateProfileMutation.isPending ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
