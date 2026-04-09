import ClientLayout from './components/ClientLayout';
import { loadConfig } from './load-config';

export default function HomePage() {
  const config = loadConfig();
  const { profile, settings, categories } = config;

  return (
    <ClientLayout 
      profile={profile} 
      settings={settings} 
      categories={categories} 
    />
  );
}
