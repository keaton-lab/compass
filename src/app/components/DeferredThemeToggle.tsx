'use client';

import ThemeToggle from './ThemeToggle';

interface DeferredThemeToggleProps {
  compact?: boolean;
  mobileOnly?: boolean;
}

export default function DeferredThemeToggle({
  compact = false,
  mobileOnly = false,
}: DeferredThemeToggleProps) {
  return <ThemeToggle compact={compact} mobileOnly={mobileOnly} />;
}
