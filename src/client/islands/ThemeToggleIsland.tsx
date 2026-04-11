import ThemeToggle from '@/client/components/ThemeToggle';
import { SettingsProvider } from '@/client/contexts/SettingsContext';
import type { Settings } from '@/shared/types';

interface ThemeToggleIslandProps {
  initialSettings: Settings;
  compact?: boolean;
  mobileOnly?: boolean;
}

export default function ThemeToggleIsland({
  initialSettings,
  compact = false,
  mobileOnly = false,
}: ThemeToggleIslandProps) {
  return (
    <SettingsProvider initialSettings={initialSettings}>
      <ThemeToggle compact={compact} mobileOnly={mobileOnly} />
    </SettingsProvider>
  );
}
