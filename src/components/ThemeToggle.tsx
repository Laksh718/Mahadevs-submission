import { Sun, Contrast } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  console.log('ThemeToggle - Current theme:', theme);

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="theme-toggle-btn hover:bg-white/20 border-2 border-yellow-400/50"
      onClick={() => {
        console.log('ThemeToggle: Toggling theme from', theme);
        toggleTheme();
      }}
      title={`Toggle Theme (Current: ${theme})`}
    >
      {theme === 'light' && <Sun className="h-5 w-5" />}
      {theme === 'high-contrast' && <Contrast className="h-5 w-5" />}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
