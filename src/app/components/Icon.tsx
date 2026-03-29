'use client';

import { useMemo } from 'react';
import {
  Mail, Palette, FileText, MessageSquare, HelpCircle, BookOpen, Package,
  Container, MessageCircle, Headphones, CloudLightning, Shield, Globe,
  Calendar, Wrench, Code2, Users, Cloud, Rocket, Play, AtSign, GitBranch,
  LucideIcon
} from 'lucide-react';
import dynamic from 'next/dynamic';

const BrandIcon = dynamic(() => import('./BrandIcon'), { ssr: false });

const lucideIconMap: Record<string, LucideIcon> = {
  'mail': Mail,
  'palette': Palette,
  'file-text': FileText,
  'message-square': MessageSquare,
  'help-circle': HelpCircle,
  'book-open': BookOpen,
  'package': Package,
  'container': Container,
  'message-circle': MessageCircle,
  'headphones': Headphones,
  'cloud-lightning': CloudLightning,
  'shield': Shield,
  'globe': Globe,
  'calendar': Calendar,
  'wrench': Wrench,
  'code-2': Code2,
  'users': Users,
  'cloud': Cloud,
  'rocket': Rocket,
  'play': Play,
  'at-sign': AtSign,
  'git-branch': GitBranch,
  'GitBranch': GitBranch,
  'Mail': Mail,
  'Palette': Palette,
  'FileText': FileText,
  'MessageSquare': MessageSquare,
  'HelpCircle': HelpCircle,
  'BookOpen': BookOpen,
  'Package': Package,
  'Container': Container,
  'MessageCircle': MessageCircle,
  'Headphones': Headphones,
  'CloudLightning': CloudLightning,
  'Shield': Shield,
  'Globe': Globe,
  'Calendar': Calendar,
  'Wrench': Wrench,
  'Code2': Code2,
  'Users': Users,
  'Cloud': Cloud,
  'Rocket': Rocket,
  'Play': Play,
  'AtSign': AtSign,
};

const brandIcons = new Set([
  'github', 'vercel', 'figma', 'notion', 'docker', 'npm', 'aws',
  'google', 'microsoft', 'facebook', 'twitter', 'instagram', 'linkedin',
  'youtube', 'reddit', 'discord', 'slack', 'zoom', 'stripe', 'paypal',
  'apple', 'android', 'linux', 'windows', 'macos', 'chrome', 'firefox',
  'safari', 'edge', 'vscode', 'jetbrains', 'gitlab', 'bitbucket',
  'jira', 'confluence', 'trello', 'asana', 'airtable',
  'zapier', 'hubspot', 'salesforce', 'shopify', 'wordpress', 'ghost',
  'medium', 'dev', 'stackoverflow', 'codepen', 'codesandbox', 'replit',
  'mongodb', 'postgresql', 'redis', 'elasticsearch', 'kubernetes',
  'terraform', 'ansible', 'jenkins', 'circleci', 'travisci',
  'heroku', 'digitalocean', 'cloudflare', 'netlify', 'supabase',
  'nextdotjs', 'react', 'vue', 'angular', 'svelte', 'nuxt',
  'tailwind', 'bootstrap', 'materialui', 'framer',
  'javascript', 'typescript', 'python', 'rust', 'go', 'java',
  'php', 'ruby', 'swift', 'kotlin', 'c', 'cpp',
  'vite', 'webpack', 'esbuild', 'rollup', 'babel',
  'eslint', 'prettier', 'yarn', 'pnpm', 'bun'
]);

interface IconProps {
  name: string;
  size?: number;
  className?: string;
  color?: string;
}

export default function Icon({ name, size = 24, className = '', color }: IconProps) {
  const iconInfo = useMemo(() => {
    const normalizedName = name.toLowerCase().replace(/\s+/g, '-');
    
    if (brandIcons.has(normalizedName)) {
      return { type: 'brand' as const, name: normalizedName };
    }
    
    if (lucideIconMap[normalizedName] || lucideIconMap[name]) {
      return { type: 'lucide' as const, name: lucideIconMap[normalizedName] || lucideIconMap[name] };
    }
    
    return { type: 'brand' as const, name: normalizedName };
  }, [name]);

  if (iconInfo.type === 'brand') {
    return (
      <BrandIcon 
        name={iconInfo.name}
        size={size}
        className={className}
        color={color}
      />
    );
  }

  const LucideComponent = iconInfo.name;
  return <LucideComponent size={size} className={className} style={color ? { color } : undefined} />;
}

export const AVAILABLE_ICONS = {
  lucide: Object.keys(lucideIconMap).filter(k => !k.includes('Alias')),
  brands: Array.from(brandIcons)
};
