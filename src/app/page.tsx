import ClientLayout from './components/ClientLayout';
import { loadResolvedConfig } from './load-config';

export default async function HomePage() {
  const config = await loadResolvedConfig();
  const { profile, settings, categories } = config;

  return (
    <ClientLayout 
      profile={profile} 
      settings={settings} 
      categories={categories} 
    />
  );
}
