/**
 * Format a date to a relative time string (e.g., "5 minutes ago", "2 days ago")
 */
export function formatDistanceToNow(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds} segundo${diffInSeconds !== 1 ? 's' : ''} atrás`;
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minuto${diffInMinutes !== 1 ? 's' : ''} atrás`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hora${diffInHours !== 1 ? 's' : ''} atrás`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} dia${diffInDays !== 1 ? 's' : ''} atrás`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} mês${diffInMonths !== 1 ? 'es' : ''} atrás`;
  }
  
  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} ano${diffInYears !== 1 ? 's' : ''} atrás`;
}