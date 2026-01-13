    import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the theme types to match the website
type ThemeType = 
  | 'light'
  | 'dark'
  | 'cupcake'
  | 'bumblebee'
  | 'emerald'
  | 'corporate'
  | 'synthwave'
  | 'retro'
  | 'cyberpunk'
  | 'valentine'
  | 'halloween'
  | 'garden'
  | 'forest'
  | 'aqua'
  | 'lofi'
  | 'pastel'
  | 'fantasy'
  | 'wireframe'
  | 'black'
  | 'luxury'
  | 'dracula'
  | 'cmyk'
  | 'autumn'
  | 'business'
  | 'acid'
  | 'lemonade'
  | 'night'
  | 'coffee'
  | 'winter'
  | 'dim'
  | 'nord'
  | 'sunset';

interface ThemeStore {
    theme: ThemeType;
    setTheme: (theme: ThemeType) => Promise<void>;
    loadTheme: () => Promise<void>;
}

// Default theme to match the website's default
export const useThemeStore = create<ThemeStore>((set) => ({
    theme: 'coffee', // Default to coffee theme to match website

    setTheme: async (theme: ThemeType) => {
        set({ theme });
        await AsyncStorage.setItem('chat-theme', theme); // Use same key as website
    },

    loadTheme: async () => {
        try {
            const savedTheme = await AsyncStorage.getItem('chat-theme');
            if (savedTheme) {
                set({ theme: savedTheme as ThemeType });
            }
        } catch (error) {
            console.error('Error loading theme:', error);
        }
    },
}));