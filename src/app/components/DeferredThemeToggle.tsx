'use client';

import dynamic from 'next/dynamic';

interface DeferredThemeToggleProps {
  compact?: boolean;
  mobileOnly?: boolean;
}

const CompactThemeToggle = dynamic(() => import('./ThemeToggle'), {
  ssr: false,
  loading: () => <ThemeToggleFallback compact />,
});

const MobileThemeToggle = dynamic(() => import('./ThemeToggle'), {
  ssr: false,
  loading: () => <ThemeToggleFallback mobileOnly />,
});

const DefaultThemeToggle = dynamic(() => import('./ThemeToggle'), {
  ssr: false,
  loading: () => <ThemeToggleFallback />,
});

export default function DeferredThemeToggle({
  compact = false,
  mobileOnly = false,
}: DeferredThemeToggleProps) {
  if (mobileOnly) {
    return <MobileThemeToggle mobileOnly />;
  }

  if (compact) {
    return <CompactThemeToggle compact />;
  }

  return <DefaultThemeToggle />;
}

function ThemeToggleFallback({
  compact = false,
  mobileOnly = false,
}: DeferredThemeToggleProps) {
  if (mobileOnly) {
    return (
      <button
        type="button"
        disabled
        aria-hidden="true"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border bg-[var(--panel-strong)] text-[var(--muted)] md:hidden"
        style={{ borderColor: 'var(--panel-border)' }}
      >
        <span className="h-4 w-4 rounded-full bg-[var(--bg-secondary)]" />
      </button>
    );
  }

  if (compact) {
    return (
      <button
        type="button"
        disabled
        aria-hidden="true"
        className="flex h-9 w-9 items-center justify-center rounded-lg border bg-[var(--panel-strong)] text-[var(--muted)]"
        style={{ borderColor: 'var(--panel-border)' }}
      >
        <span className="h-4 w-4 rounded-full bg-[var(--bg-secondary)]" />
      </button>
    );
  }

  return (
    <div className="fixed right-4 top-4 z-50 hidden md:block">
      <div
        className="flex items-center gap-1 rounded-lg border bg-[var(--panel-strong)] px-1.5 py-1.5"
        style={{ borderColor: 'var(--panel-border)' }}
      >
        <span className="h-6 w-20 rounded-md bg-[var(--bg-secondary)]" />
      </div>
    </div>
  );
}
