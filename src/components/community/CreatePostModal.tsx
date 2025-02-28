import { useState, useRef } from 'react';
import { FaTimes, FaImage, FaVideo, FaLink } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Post, PostTopic } from '../../types';

interface CreatePostModalProps {
  onClose: () => void;
  onPostCreated: (post: Post) => void;
}

const topics: { id: PostTopic; label: string }[] = [
  { id: 'dicas', label: 'Dicas' },
  { id: 'progressoFisico', label: 'Progresso Físico' },
  { id: 'posicao', label: 'Posição' },
  { id: 'taticas', label: 'Táticas' },
  { id: 'offTopic', label: 'Off Topic' },
  { id: 'fandom', label: 'Fandom' },
  { id: 'informacoes', label: 'Informações' }
];

export function CreatePostModal({ onClose, onPostCreated }: CreatePostModalProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [topic, setTopic] = useState<PostTopic>('dicas');
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [links, setLinks] = useState<string[]>([]);
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [newLink, setNewLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Close modal when clicking outside
  const handleClickOutside = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };
  
  // Add media URL
  const handleAddMediaUrl = () => {
    if (!newMediaUrl.trim()) return;
    
    // Simple validation for image/video URLs
    const isValidUrl = /^(https?:\/\/)/i.test(newMediaUrl);
    if (!isValidUrl) {
      setError('URL inválida. Certifique-se de incluir http:// ou https://');
      return;
    }
    
    setMediaUrls([...mediaUrls, newMediaUrl]);
    setNewMediaUrl('');
    setError(null);
  };
  
  // Add link
  const handleAddLink = () => {
    if (!newLink.trim()) return;
    
    // Simple validation for links
    const isValidUrl = /^(https?:\/\/)/i.test(newLink);
    if (!isValidUrl) {
      setError('URL inválida. Certifique-se de incluir http:// ou https://');
      return;
    }
    
    setLinks([...links, newLink]);
    setNewLink('');
    setError(null);
  };
  
  // Remove media URL
  const handleRemoveMediaUrl = (index: number) => {
    setMediaUrls(mediaUrls.filter((_, i) => i !== index));
  };
  
  // Remove link
  const handleRemoveLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };
  
  // Create post
  const handleCreatePost = async () => {
    if (!user) return;
    
    if (!title.trim()) {
      setError('O título é obrigatório');
      return;
    }
    
    if (!content.trim()) {
      setError('O conteúdo é obrigatório');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Get user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('name, username, avatar_url')
        .eq('id', user.id)
        .single();
      
      if (profileError) throw profileError;
      
      // Create post
      const { data, error } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          title,
          content,
          topic,
          media_urls: mediaUrls.length > 0 ? mediaUrls : null,
          links: links.length > 0 ? links : null
        })
        .select()
        .single();
      
      if (error) throw error;
      
      if (data) {
        // Format post for the UI
        const newPost: Post = {
          id: data.id,
          userId: data.user_id,
          author: {
            id: user.id,
            name: profileData.name,
            username: profileData.username,
            avatar: profileData.avatar_url
          },
          title: data.title,
          content: data.content,
          topic: data.topic as PostTopic,
          mediaUrls: data.media_urls || [],
          links: data.links || [],
          likes: 0,
          comments: 0,
          userLiked: false,
          createdAt: data.created_at
        };
        
        onPostCreated(newPost);
      }
    } catch (err) {
      console.error('Error creating post:', err);
      setError('Erro ao criar post. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleClickOutside}
    >
      <motion.div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Criar Post</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes />
          </button>
        </div>
        
        <div className="p-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <div className="mb-4">
            <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">
              Tópico
            </label>
            <select
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value as PostTopic)}
              className="w-full p-2 border rounded-lg"
            >
              {topics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Título
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border rounded-lg"
              placeholder="Título do seu post"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              Conteúdo
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-2 border rounded-lg h-32 resize-none"
              placeholder="Compartilhe seus pensamentos..."
            />
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Mídias (Imagens/Vídeos)
              </label>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setNewMediaUrl('')}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Limpar
                </button>
              </div>
            </div>
            
            <div className="flex mb-2">
              <input
                type="text"
                value={newMediaUrl}
                onChange={(e) => setNewMediaUrl(e.target.value)}
                className="flex-grow p-2 border rounded-l-lg"
                placeholder="Cole a URL da imagem ou vídeo"
              />
              <button
                type="button"
                onClick={handleAddMediaUrl}
                className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <FaPlus className="mr-1" /> Adicionar
              </button>
            </div>
            
            {mediaUrls.length > 0 && (
              <div className="space-y-2 mt-2">
                {mediaUrls.map((url, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-100 p-2 rounded">
                    <div className="truncate flex-grow">
                      <span className="text-sm">{url}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveMediaUrl(index)}
                      className="text-red-500 hover:text-red-700 ml-2"
                    >
                      <FaTimes />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Links
              </label>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setNewLink('')}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Limpar
                </button>
              </div>
            </div>
            
            <div className="flex mb-2">
              <input
                type="text"
                value={newLink}
                onChange={(e) => setNewLink(e.target.value)}
                className="flex-grow p-2 border rounded-l-lg"
                placeholder="Cole a URL do link"
              />
              <button
                type="button"
                onClick={handleAddLink}
                className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <FaPlus className="mr-1" /> Adicionar
              </button>
            </div>
            
            {links.length > 0 && (
              <div className="space-y-2 mt-2">
                {links.map((url, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-100 p-2 rounded">
                    <div className="truncate flex-grow">
                      <span className="text-sm">{url}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveLink(index)}
                      className="text-red-500 hover:text-red-700 ml-2"
                    >
                      <FaTimes />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="p-4 border-t flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded-lg mr-2 hover:bg-gray-100 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleCreatePost}
            disabled={loading}
            className={`bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Publicando...' : 'Publicar'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}