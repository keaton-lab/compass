import { Link } from 'react-router-dom';

/**
 * 404 页面
 */
export default function NotFoundPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[var(--background)]">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-[var(--text-primary)] mb-4">404</h1>
        <p className="text-xl text-[var(--text-secondary)] mb-8">页面未找到</p>
        <Link
          to="/"
          className="px-6 py-3 bg-[var(--accent)] text-white rounded-lg hover:opacity-90 transition-opacity"
        >
          返回首页
        </Link>
      </div>
    </div>
  );
}
