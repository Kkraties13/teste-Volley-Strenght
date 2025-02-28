import { useState, useEffect, useRef } from 'react';
import { FaRegComment, FaRegHeart, FaHeart, FaShare, FaTimes, FaReply } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Post, Comment } from '../../types';
import { formatDistanceToNow } from '../../utils/dateUtils';

interface PostDetailProps {
  post: Post;
  onClose: () => void;
  onLike: () => void;
  onShare: () => void;
  onPostUpdated: (post: Post) => void;
}

export function PostDetail({ post, onClose, onLike, onShare, onPostUpdated }: PostDetailProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<{ id: string; username: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const modalRef = useRef<HTMLDivElement>(null);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);
  
  // Fetch comments
  useEffect(() => {
    async function fetchComments() {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('comments')
          .select(`
            *,
            profiles:user_id (id, name, username, avatar_url)
          `)
          .eq('post_id', post.id)
          .order('created_at', { ascending: true });
        
        if (error) throw error;
        
        if (data) {
          // Transform data to match our Comment interface
          const formattedComments: Comment[] = await Promise.all(data.map(async (comment) => {
            // Check if user has liked this comment
            let userLiked = false;
            if (user) {
              const { data: likeData } = await supabase
                .from('comment_likes')
                .select('*')
                .eq('comment_id', comment.id)
                .eq('user_id', user.id)
                .single();
              
              userLiked = !!likeData;
            }
            
            return {
              id: comment.id,
              postId: comment.post_id,
              userId: comment.user_id,
              author: {
                id: comment.profiles.id,
                name: comment.profiles.name,
                username: comment.profiles.username,
                avatar: comment.profiles.avatar_url
              },
              content: comment.content,
              replyTo: comment.reply_to ? {
                id: comment.reply_to.id,
                username: comment.reply_to.username
              } : undefined,
              likes: comment.likes || 0,
              userLiked,
              createdAt: comment.created_at
            };
          }));
          
          setComments(formattedComments);
        }
      } catch (err) {
        console.error('Error fetching comments:', err);
        setError('Não foi possível carregar os comentários. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchComments();
  }, [post.id, user]);
  
  // Close modal when clicking outside
  const handleClickOutside = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };
  
  // Handle like/unlike comment
  const handleLikeComment = async (commentId: string, isLiked: boolean) => {
    if (!user) return;
    
    try {
      if (isLiked) {
        // Unlike comment
        await supabase
          .from('comment_likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', user.id);
      } else {
        // Like comment
        await supabase
          .from('comment_likes')
          .insert({
            comment_id: commentId,
            user_id: user.id
          });
      }
      
      // Update comments state
      setComments(prevComments => 
        prevComments.map(comment => {
          if (comment.id === commentId) {
            return {
              ...comment,
              likes: isLiked ? comment.likes - 1 : comment.likes + 1,
              userLiked: !isLiked
            };
          }
          return comment;
        })
      );
    } catch (err) {
      console.error('Error liking/unliking comment:', err);
    }
  };
  
  // Handle reply to comment
  const handleReplyToComment = (commentId: string, username: string) => {
    setReplyTo({ id: commentId, username });
    if (commentInputRef.current) {
      commentInputRef.current.focus();
    }
  };
  
  // Cancel reply
  const handleCancelReply = () => {
    setReplyTo(null);
  };
  
  // Submit comment
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    if (!newComment.trim()) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Create comment
      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: post.id,
          user_id: user.id,
          content: newComment,
          reply_to: replyTo
        })
        .select()
        .single();
      
      if (error) throw error;
      
      if (data) {
        // Get user profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('name, username, avatar_url')
          .eq('id', user.id)
          .single();
        
        // Add new comment to state
        const newCommentObj: Comment = {
          id: data.id,
          postId: data.post_id,
          userId: data.user_id,
          author: {
            id: user.id,
            name: profileData.name,
            username: profileData.username,
            avatar: profileData.avatar_url
          },
          content: data.content,
          replyTo: data.reply_to,
          likes: 0,
          userLiked: false,
          createdAt: data.created_at
        };
        
        setComments([...comments, newCommentObj]);
        setNewComment('');
        setReplyTo(null);
        
        // Update post comment count
        const updatedPost = {
          ...post,
          comments: post.comments + 1
        };
        onPostUpdated(updatedPost);
      }
    } catch (err) {
      console.error('Error creating comment:', err);
      setError('Erro ao publicar comentário. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Get topic label
  const getTopicLabel = (topicId: string) => {
    const topics: Record<string, string> = {
      'dicas': 'Dicas',
      'progressoFisico': 'Progresso Físico',
      'posicao': 'Posição',
      'taticas': 'Táticas',
      'offTopic': 'Off Topic',
      'fandom': 'Fandom',
      'informacoes': 'Informações'
    };
    
    return topics[topicId] || topicId;
  };
  
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleClickOutside}
    >
      <motion.div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Post</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes />
          </button>
        </div>
        
        <div className="overflow-y-auto flex-grow">
          {/* Post content */}
          <div className="p-4 border-b">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden mr-3">
                {post.author.avatar ? (
                  <img 
                    src={post.author.avatar} 
                    alt={post.author.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-blue-600 text-white">
                    {post.author.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <div className="font-medium">{post.author.name}</div>
                <div className="flex items-center text-xs text-gray-500">
                  <span>@{post.author.username}</span>
                  <span className="mx-1">•</span>
                  <span>{formatDistanceToNow(new Date(post.createdAt))}</span>
                </div>
              </div>
              <div className="ml-auto">
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                  {getTopicLabel(post.topic)}
                </span>
              </div>
            </div>
            
            <h1 className="text-xl font-bold mb-3">{post.title}</h1>
            <p className="text-gray-800 mb-4 whitespace-pre-line">{post.content}</p>
            
            {post.mediaUrls && post.mediaUrls.length > 0 && (
              <div className="space-y-4 mb-4">
                {post.mediaUrls.map((url, index) => {
                  const isVideo = url.match(/\.(mp4|webm|ogg)$/i);
                  
                  return (
                    <div key={index} className="rounded-lg overflow-hidden bg-gray-100">
                      {isVideo ? (
                        <video 
                          src={url} 
                          controls 
                          className="w-full max-h-96 object-contain"
                        />
                      ) : (
                        <img 
                          src={url} 
                          alt={`Post media ${index + 1}`} 
                          className="w-full max-h-96 object-contain"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            
            {post.links && post.links.length > 0 && (
              <div className="space-y-2 mb-4">
                <h3 className="text-sm font-medium text-gray-700">Links:</h3>
                {post.links.map((url, index) => (
                  <a 
                    key={index}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-blue-600 hover:underline truncate"
                  >
                    {url}
                  </a>
                ))}
              </div>
            )}
            
            <div className="flex items-center justify-between mt-4 text-gray-500">
              <button 
                className="flex items-center space-x-1 hover:text-blue-600"
                onClick={onLike}
              >
                {post.userLiked ? (
                  <FaHeart className="text-red-500" />
                ) : (
                  <FaRegHeart />
                )}
                <span>{post.likes}</span>
              </button>
              
              <div className="flex items-center space-x-1">
                <FaRegComment />
                <span>{comments.length}</span>
              </div>
              
              <button 
                className="flex items-center space-x-1 hover:text-blue-600"
                onClick={onShare}
              >
                <FaShare />
                <span>Compartilhar</span>
              </button>
            </div>
          </div>
          
          {/* Comments */}
          <div className="p-4">
            <h3 className="text-lg font-medium mb-4">Comentários</h3>
            
            {loading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-600"></div>
              </div>
            ) : error ? (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center text-gray-500 py-4">
                Nenhum comentário ainda. Seja o primeiro a comentar!
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-start">
                      <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden mr-2 flex-shrink-0">
                        {comment.author.avatar ? (
                          <img 
                            src={comment.author.avatar} 
                            alt={comment.author.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-blue-600 text-white">
                            {comment.author.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-grow">
                        <div className="flex items-center">
                          <span className="font-medium">{comment.author.name}</span>
                          <span className="text-xs text-gray-500 ml-1">@{comment.author.username}</span>
                          <span className="text-xs text-gray-500 ml-2">
                            {formatDistanceToNow(new Date(comment.createdAt))}
                          </span>
                        </div>
                        
                        {comment.replyTo && (
                          <div className="text-xs text-gray-500 mb-1">
                            Respondendo a <span className="text-blue-600">@{comment.replyTo.username}</span>
                          </div>
                        )}
                        
                        <p className="text-gray-800 mt-1">{comment.content}</p>
                        
                        <div className="flex items-center mt-2 text-xs text-gray-500">
                          <button 
                            className="flex items-center space-x-1 hover:text-blue-600"
                            onClick={() => handleLikeComment(comment.id, comment.userLiked || false)}
                          >
                            {comment.userLiked ? (
                              <FaHeart className="text-red-500" />
                            ) : (
                              <FaRegHeart />
                            )}
                            <span>{comment.likes}</span>
                          </button>
                          
                          {user && (
                            <button 
                              className="flex items-center space-x-1 ml-4 hover:text-blue-600"
                              onClick={() => handleReplyToComment(comment.id, comment.author.username)}
                            >
                              <FaReply />
                              <span>Responder</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Comment form */}
        {user && (
          <div className="p-4 border-t">
            <form onSubmit={handleSubmitComment}>
              {replyTo && (
                <div className="flex items-center justify-between bg-blue-50 p-2 rounded mb-2">
                  <div className="text-sm">
                    Respondendo a <span className="font-medium">@{replyTo.username}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCancelReply}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <FaTimes />
                  </button>
                </div>
              )}
              
              <div className="flex">
                <textarea
                  ref={commentInputRef}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Escreva um comentário..."
                  className="flex-grow p-2 border rounded-lg resize-none h-20"
                />
              </div>
              
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={submitting || !newComment.trim()}
                  className={`bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors ${
                    (submitting || !newComment.trim()) ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {submitting ? 'Enviando...' : 'Comentar'}
                </button>
              </div>
            </form>
          </div>
        )}
      </motion.div>
    </div>
  );
}