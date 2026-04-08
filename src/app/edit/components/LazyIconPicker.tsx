'use client';

import dynamic from 'next/dynamic';
import type { IconPickerProps } from './IconPicker';

const IconPicker = dynamic(() => import('./IconPicker'), {
  ssr: false,
  loading: () => <IconPickerLoadingOverlay />,
});

export default function LazyIconPicker(props: IconPickerProps) {
  return <IconPicker {...props} />;
}

function IconPickerLoadingOverlay() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--background)]/72">
      <div
        className="rounded-[18px] border bg-[var(--panel-strong)] px-5 py-4 text-sm text-[var(--muted)] shadow-lg"
        style={{ borderColor: 'var(--panel-border)' }}
      >
        正在加载图标选择器...
      </div>
    </div>
  );
}
