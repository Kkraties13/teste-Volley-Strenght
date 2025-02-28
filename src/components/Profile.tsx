import { useState, useRef, useEffect } from 'react';
import { User as AuthUser } from '@supabase/supabase-js';
import { User, VolleyPosition } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const positions: { id: VolleyPosition; label: string }[] = [
  { id: 'libero', label: 'Líbero' },
  { id: 'setter', label: 'Levantador' },
  { id: 'passingOideHitter', label: 'Ponteiro Passador' },
  { id: 'attackOutsideHitter', label: 'Ponteiro de Definição' },
  { id: 'middleBlocker', label: 'Central' },
  { id: 'oppositeHitter', label: 'Oposto' }
];

const genders = [
  { id: 'male', label: 'Masculino' },
  { id: 'female', label: 'Feminino' }
];

export function Profile() {
  const { user: authUser, signOut } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [gender, setGender] = useState('');
  const [bio, setBio] = useState('');
  const [selectedPositions, setSelectedPositions] = useState<VolleyPosition[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Fetch user profile data
  useEffect(() => {
    async function fetchProfile() {
      if (!authUser) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();
        
        if (error) throw error;
        
        if (data) {
          setUser(data as unknown as User);
          setName(data.name || '');
          setUsername(data.username || '');
          setGender(data.gender || '');
          setBio(data.bio || '');
          setSelectedPositions(data.positions as VolleyPosition[] || []);
          if (data.avatar_url) {
            setPreviewImage(data.avatar_url);
          }
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchProfile();
  }, [authUser]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePositionToggle = (position: VolleyPosition) => {
    setSelectedPositions(prev => {
      if (prev.includes(position)) {
        return prev.filter(p => p !== position);
      } else {
        return [...prev, position];
      }
    });
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedPositions.length === 0) {
      setError('Selecione pelo menos uma posição');
      return;
    }
    
    if (!authUser) {
      setError('Usuário não autenticado');
      return;
    }
    
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Upload avatar if changed
      let avatarUrl = user?.avatar;
      if (previewImage && previewImage !== user?.avatar) {
        // This is a simplified version - in a real app, you'd upload the file to storage
        // For now, we'll just use the preview as the URL
        avatarUrl = previewImage;
      }
      
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: authUser.id,
          name,
          username,
          gender,
          positions: selectedPositions,
          bio,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
      
      setSuccess('Perfil atualizado com sucesso!');
      
      // Refresh user data
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();
      
      if (data) {
        setUser(data as unknown as User);
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err.message : 'Erro ao atualizar perfil');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
  };

  if (loading) {
    return (
      <div className="p-4 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If user exists but profile is incomplete, show the profile form
  const isProfileComplete = user && user.name && user.username && user.gender && user.positions?.length > 0 && user.bio;

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {isProfileComplete ? 'Meu Perfil' : 'Complete seu Perfil'}
        </h1>
        {authUser && (
          <button
            onClick={handleLogout}
            className="text-red-600 hover:text-red-800"
          >
            Sair
          </button>
        )}
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}
      
      <form onSubmit={handleSaveProfile} className="space-y-6">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div 
              className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              {previewImage ? (
                <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <span className="text-gray-500">Foto</span>
              )}
            </div>
            <button
              type="button"
              className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 shadow-lg"
              onClick={() => fileInputRef.current?.click()}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome Completo
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full p-2 border rounded-lg"
            placeholder="Digite seu nome completo"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome de Usuário
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full p-2 border rounded-lg"
            placeholder="@username"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            E-mail
          </label>
          <input
            type="email"
            value={authUser?.email || ''}
            disabled
            className="w-full p-2 border rounded-lg bg-gray-100"
          />
          <p className="text-xs text-gray-500 mt-1">O e-mail não pode ser alterado</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sexo
          </label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            required
            className="w-full p-2 border rounded-lg"
          >
            <option value="">Selecione</option>
            {genders.map(g => (
              <option key={g.id} value={g.id}>
                {g.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Posições
          </label>
          <p className="text-sm text-gray-500 mb-2">
            Selecione uma ou mais posições em que você joga
          </p>
          <div className="grid grid-cols-2 gap-2">
            {positions.map(position => (
              <button
                key={position.id}
                type="button"
                className={`p-3 rounded-lg text-center transition-colors ${
                  selectedPositions.includes(position.id)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
                onClick={() => handlePositionToggle(position.id)}
              >
                {position.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sobre Você
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            required
            className="w-full p-2 border rounded-lg h-32 resize-none"
            placeholder="Conte um pouco sobre sua experiência no vôlei..."
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className={`w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium ${
            saving ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {saving ? 'Salvando...' : isProfileComplete ? 'Atualizar Perfil' : 'Criar Perfil'}
        </button>
      </form>
    </div>
  );
}