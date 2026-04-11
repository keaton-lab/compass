import { Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import LoadingSpinner from './components/LoadingSpinner';

// 懒加载页面组件
const HomePage = lazy(() => import('./pages/HomePage'));
const EditPage = lazy(() => import('./pages/EditPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

/**
 * 应用主组件
 */
export default function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/edit" element={<EditPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
