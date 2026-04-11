import { useEffect, useState } from 'react';
import type { ResolvedConfig } from '@/shared/types';
import { loadResolvedConfig } from '@/client/services/config-source';
import ClientLayout from '@/client/components/ClientLayout';
import LoadingSpinner from '@/client/components/LoadingSpinner';

/**
 * 首页组件
 */
export default function HomePage() {
  const [config, setConfig] = useState<ResolvedConfig | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadResolvedConfig()
      .then(setConfig)
      .catch((err) => {
        console.error('加载配置失败:', err);
        setError(err.message || '加载失败');
      });
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-xl font-semibold mb-2">加载失败</h1>
          <p className="text-[var(--text-secondary)]">{error}</p>
        </div>
      </div>
    );
  }

  if (!config) {
    return <LoadingSpinner />;
  }

  return (
    <ClientLayout
      profile={config.profile}
      settings={config.settings}
      categories={config.categories}
    />
  );
}
