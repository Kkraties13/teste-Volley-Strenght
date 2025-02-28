import { useState, useEffect, useRef } from 'react';
import { FaSearch, FaThList, FaTh, FaRegComment, FaRegHeart, FaHeart, FaShare, FaFilter, FaPlus } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Post, Comment, PostTopic, ViewMode, SortOption } from '../types';
import { CreatePostModal } from './community/CreatePostModal';
import { PostDetail } from './community/PostDetail';
import { PostCard } from './community/PostCard';
import { PostCompact } from './community/PostCompact';

const topics: { id: PostTopic; label: string }[] = [
  { id: 'dicas', label: 'Dicas' },
  { id: 'progressoFisico', label: 'Progresso Físico' },
  { id: 'posicao', label: 'Posição' },
  { id: 'taticas', label: 'Táticas' },
  { id: 'offTopic', label: 'Off Topic' },
  { id: 'fandom', label: 'Fandom' },
  { id: 'informacoes', label: 'Informações' }
];

export function Community() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<PostTopic | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('recent');
  const [showFilters, setShowFilters] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Fetch posts
  useEffect(() => {
    async function fetchPosts() {
      try {
        setLoading(true);
        
        let query = supabase
          .from('posts')
          .select(`
            *,
            profiles:user_id (id, name, username, avatar_url)
          `);
        
        // Apply topic filter if selected
        if (selectedTopic) {
          query = query.eq('topic', selectedTopic);
        }
        
        // Apply sorting
        switch (sortOption) {
          case 'recent':
            query = query.order('created_at', { ascending: false });
            break;
          case 'popular':
            query = query.order('likes', { ascending: false });
            break;
          case 'trending':
            // For trending, we could combine recency and popularity
            // This is a simplified version
            query = query.order('created_at', { ascending: false }).order('likes', { ascending: false });
            break;
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        if (data) {
          // Transform data to match our Post interface
          const formattedPosts: Post[] = await Promise.all(data.map(async (post) => {
            // Check if user has liked this post
            let userLiked = false;
            if (user) {
              const { data: likeData } = await supabase
                .from('post_likes')
                .select('*')
                .eq('post_id', post.id)
                .eq('user_id', user.id)
                .single();
              
              userLiked = !!likeData;
            }
            
            // Count comments
            const { count } = await supabase
              .from('comments')
              .select('*', { count: 'exact', head: true })
              .eq('post_id', post.id);
            
            return {
              id: post.id,
              userId: post.user_id,
              author: {
                id: post.profiles.id,
                name: post.profiles.name,
                username: post.profiles.username,
                avatar: post.profiles.avatar_url
              },
              title: post.title || '',
              content: post.content,
              topic: post.topic as PostTopic,
              mediaUrls: post.media_urls || [],
              links: post.links || [],
              likes: post.likes,
              comments: count || 0,
              userLiked,
              createdAt: post.created_at
            };
          }));
          
          setPosts(formattedPosts);
        }
      } catch (err) {
        console.error('Error fetching posts:', err);
        setError('Não foi possível carregar os posts. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchPosts();
  }, [user, selectedTopic, sortOption]);

  // Handle like/unlike post
  const handleLikePost = async (postId: string, isLiked: boolean) => {
    if (!user) return;
    
    try {
      if (isLiked) {
        // Unlike post
        await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
      } else {
        // Like post
        await supabase
          .from('post_likes')
          .insert({
            post_id: postId,
            user_id: user.id
          });
      }
      
      // Update posts state
      setPosts(prevPosts => 
        prevPosts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              likes: isLiked ? post.likes - 1 : post.likes + 1,
              userLiked: !isLiked
            };
          }
          return post;
        })
      );
      
      // Update selected post if needed
      if (selectedPost && selectedPost.id === postId) {
        setSelectedPost(prev => {
          if (!prev) return null;
          return {
            ...prev,
            likes: isLiked ? prev.likes - 1 : prev.likes + 1,
            userLiked: !isLiked
          };
        });
      }
    } catch (err) {
      console.error('Error liking/unliking post:', err);
    }
  };

  // Handle share post
  const handleSharePost = (postId: string) => {
    const url = `${window.location.origin}/community/post/${postId}`;
    navigator.clipboard.writeText(url)
      .then(() => {
        alert('Link copiado para a área de transferência!');
      })
      .catch(err => {
        console.error('Erro ao copiar link:', err);
      });
  };

  // Filter posts by search query
  const filteredPosts = posts.filter(post => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      post.title.toLowerCase().includes(query) ||
      post.content.toLowerCase().includes(query) ||
      post.author.name.toLowerCase().includes(query) ||
      post.author.username.toLowerCase().includes(query)
    );
  });

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is already handled by the filteredPosts
  };

  // Clear filters
  const clearFilters = () => {
    setSelectedTopic(null);
    setSortOption('recent');
    setSearchQuery('');
    if (searchInputRef.current) {
      searchInputRef.current.value = '';
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Comunidade</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode(viewMode === 'card' ? 'compact' : 'card')}
            className="p-2 bg-white rounded-full shadow"
            aria-label={viewMode === 'card' ? 'Mudar para visualização compacta' : 'Mudar para visualização em cards'}
          >
            {viewMode === 'card' ? <FaThList /> : <FaTh />}
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 bg-white rounded-full shadow"
            aria-label="Filtros"
          >
            <FaFilter />
          </button>
          {user && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="p-2 bg-blue-600 text-white rounded-full shadow hover:bg-blue-700 transition-colors"
              aria-label="Criar post"
            >
              <FaPlus />
            </button>
          )}
        </div>
      </div>
      
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-lg shadow-md p-4 mb-4 overflow-hidden"
          >
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Pesquisar posts..."
                  className="w-full p-2 pl-10 border rounded-lg"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </form>
            
            <div className="mb-4">
              <h3 className="font-medium mb-2">Ordenar por:</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => setSortOption('recent')}
                  className={`px-3 py-1 rounded-full text-sm ${
                    sortOption === 'recent'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  Recentes
                </button>
                <button
                  onClick={() => setSortOption('popular')}
                  className={`px-3 py-1 rounded-full text-sm ${
                    sortOption === 'popular'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  Populares
                </button>
                <button
                  onClick={() => setSortOption('trending')}
                  className={`px-3 py-1 rounded-full text-sm ${
                    sortOption === 'trending'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  Em alta
                </button>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Tópicos:</h3>
              <div className="flex flex-wrap gap-2">
                {topics.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => setSelectedTopic(prev => prev === topic.id ? null : topic.id)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      selectedTopic === topic.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {topic.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <button
                onClick={clearFilters}
                className="text-blue-600 hover:underline text-sm"
              >
                Limpar filtros
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500 mb-4">Nenhum post encontrado.</p>
          {user ? (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Criar o primeiro post
            </button>
          ) : (
            <p className="text-sm text-gray-500">Faça login para criar posts.</p>
          )}
        </div>
      ) : (
        <div className={`space-y-4 ${viewMode === 'compact' ? 'divide-y divide-gray-200' : ''}`}>
          {filteredPosts.map((post) => (
            viewMode === 'card' ? (
              <PostCard
                key={post.id}
                post={post}
                onLike={() => handleLikePost(post.id, post.userLiked || false)}
                onComment={() => setSelectedPost(post)}
                onShare={() => handleSharePost(post.id)}
                onClick={() => setSelectedPost(post)}
              />
            ) : (
              <PostCompact
                key={post.id}
                post={post}
                onLike={() => handleLikePost(post.id, post.userLiked || false)}
                onComment={() => setSelectedPost(post)}
                onShare={() => handleSharePost(post.id)}
                onClick={() => setSelectedPost(post)}
              />
            )
          ))}
        </div>
      )}
      
      {/* Create Post Modal */}
      {showCreateModal && (
        <CreatePostModal
          onClose={() => setShowCreateModal(false)}
          onPostCreated={(newPost) => {
            setPosts(prev => [newPost, ...prev]);
            setShowCreateModal(false);
          }}
        />
      )}
      
      {/* Post Detail Modal */}
      {selectedPost && (
        <PostDetail
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          onLike={() => handleLikePost(selectedPost.id, selectedPost.userLiked || false)}
          onShare={() => handleSharePost(selectedPost.id)}
          onPostUpdated={(updatedPost) => {
            setPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p));
            setSelectedPost(updatedPost);
          }}
        />
      )}
    </div>
  );
}