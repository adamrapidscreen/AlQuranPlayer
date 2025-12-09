export type ThemeMode = 'light' | 'dark';

export type ThemeColors = {
  Background: string;
  Surface: string;
  Primary: string;
  Secondary: string;
  TextPrimary: string;
  TextSecondary: string;
  Border: string;
  GlassTint: string;
};

export const ThemePalette: Record<ThemeMode, ThemeColors> = {
  light: {
    Background: '#F8F5F2', // Soft off-white/cream
    Surface: '#FFFFFF',
    Primary: '#D4AF37', // Muted gold
    Secondary: '#006064', // Deep teal
    TextPrimary: '#2D3436', // Dark charcoal
    TextSecondary: '#4F5759',
    Border: 'rgba(45, 52, 54, 0.12)',
    GlassTint: 'rgba(0, 0, 0, 0.04)',
  },
  dark: {
    Background: '#1A202C', // Deep slate/navy
    Surface: '#202A3A',
    Primary: '#D4AF37', // Same gold accent
    Secondary: '#006064', // Same teal accent
    TextPrimary: '#FFFFFF',
    TextSecondary: '#CBD5E0',
    Border: 'rgba(255, 255, 255, 0.12)',
    GlassTint: 'rgba(0, 0, 0, 0.45)',
  },
};

export const DEFAULT_THEME_MODE: ThemeMode = 'light';
