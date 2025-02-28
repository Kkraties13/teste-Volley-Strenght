import { useState } from 'react';
import { FaRegComment, FaRegHeart, FaHeart, FaShare } from 'react-icons/fa';
import { Post } from '../../types';
import { formatDistanceToNow } from '../../utils/dateUtils';

interface PostCardProps {
  post: Post;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
  onClick: () => void;
}

export function PostCard({ post, onLike, onComment, onShare, onClick }: PostCardProps) {
  const [imageError, setImageError] = useState(false);
  
  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLike();
  };
  
  const handleComment = (e: React.MouseEvent) => {
    e.stopPropagation();
    onComment();
  };
  
  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    onShare();
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
  
  // Get first media URL if available
  const firstMediaUrl = post.mediaUrls && post.mediaUrls.length > 0 ? post.mediaUrls[0] : null;
  const isVideo = firstMediaUrl?.match(/\.(mp4|webm|ogg)$/i);
  
  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      <div className="p-4">
        <div className="flex items-center mb-2">
          <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden mr-2">
            {post.author.avatar ? (
              <img 
                src={post.author.avatar} 
                alt={post.author.name} 
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-blue-600 text-white">
                {post.author.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <span className="font-medium">{post.author.name}</span>
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
        
        <h2 className="text-lg font-semibold mb-2">{post.title}</h2>
        <p className="text-gray-800 mb-3 line-clamp-3">{post.content}</p>
        
        {firstMediaUrl && !imageError && (
          <div className="mb-3 rounded-lg overflow-hidden bg-gray-100">
            {isVideo ? (
              <video 
                src={firstMediaUrl} 
                controls 
                className="w-full max-h-80 object-contain"
              />
            ) : (
              <img 
                src={firstMediaUrl} 
                alt="Post media" 
                className="w-full max-h-80 object-contain"
                onError={() => setImageError(true)}
              />
            )}
          </div>
        )}
        
        {post.mediaUrls && post.mediaUrls.length > 1 && (
          <div className="text-sm text-gray-500 mb-3">
            +{post.mediaUrls.length - 1} {post.mediaUrls.length === 2 ? 'mídia' : 'mídias'}
          </div>
        )}
        
        <div className="flex items-center justify-between mt-4 text-gray-500">
          <button 
            className="flex items-center space-x-1 hover:text-blue-600"
            onClick={handleLike}
          >
            {post.userLiked ? (
              <FaHeart className="text-red-500" />
            ) : (
              <FaRegHeart />
            )}
            <span>{post.likes}</span>
          </button>
          
          <button 
            className="flex items-center space-x-1 hover:text-blue-600"
            onClick={handleComment}
          >
            <FaRegComment />
            <span>{post.comments}</span>
          </button>
          
          <button 
            className="flex items-center space-x-1 hover:text-blue-600"
            onClick={handleShare}
          >
            <FaShare />
            <span>Compartilhar</span>
          </button>
        </div>
      </div>
    </div>
  );
}