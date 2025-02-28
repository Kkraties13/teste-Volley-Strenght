import { FaRegComment, FaRegHeart, FaHeart, FaShare } from 'react-icons/fa';
import { Post } from '../../types';
import { formatDistanceToNow } from '../../utils/dateUtils';

interface PostCompactProps {
  post: Post;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
  onClick: () => void;
}

export function PostCompact({ post, onLike, onComment, onShare, onClick }: PostCompactProps) {
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
  
  // Check if post has media
  const hasMedia = post.mediaUrls && post.mediaUrls.length > 0;
  
  return (
    <div 
      className="py-3 cursor-pointer hover:bg-gray-50 transition-colors"
      onClick={onClick}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
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
        </div>
        
        <div className="flex-grow">
          <div className="flex items-center text-xs text-gray-500 mb-1">
            <span className="font-medium text-gray-700">{post.author.name}</span>
            <span className="mx-1">•</span>
            <span>@{post.author.username}</span>
            <span className="mx-1">•</span>
            <span>{formatDistanceToNow(new Date(post.createdAt))}</span>
            <span className="mx-1">•</span>
            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
              {getTopicLabel(post.topic)}
            </span>
          </div>
          
          <h3 className="text-base font-medium mb-1">{post.title}</h3>
          <p className="text-gray-800 text-sm mb-2 line-clamp-2">{post.content}</p>
          
          {hasMedia && (
            <div className="text-xs text-blue-600 mb-2">
              {post.mediaUrls!.length} {post.mediaUrls!.length === 1 ? 'mídia' : 'mídias'} anexada{post.mediaUrls!.length !== 1 ? 's' : ''}
            </div>
          )}
          
          <div className="flex items-center space-x-4 text-xs text-gray-500">
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
    </div>
  );
}