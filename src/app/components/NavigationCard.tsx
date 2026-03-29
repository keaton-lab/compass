'use client';

import { motion } from 'framer-motion';
import { 
  Mail, 
  Palette, 
  FileText, 
  MessageSquare, 
  HelpCircle, 
  BookOpen, 
  Package, 
  Container,
  MessageCircle,
  Headphones,
  CloudLightning,
  Shield,
  Globe,
  Calendar,
  Wrench,
  Code2,
  Users,
  Cloud,
  Rocket,
  Play,
  AtSign,
  GitBranch,
  LucideIcon
} from 'lucide-react';
import type { Link as LinkType } from '../types';

const iconMap: Record<string, LucideIcon> = {
  Mail,
  Palette,
  FileText,
  MessageSquare,
  HelpCircle,
  BookOpen,
  Package,
  Container,
  MessageCircle,
  Headphones,
  CloudLightning,
  Shield,
  Globe,
  Calendar,
  Wrench,
  Code2,
  Users,
  Cloud,
  Rocket,
  Play,
  AtSign,
  GitBranch,
};

interface NavigationCardProps {
  link: LinkType;
  color: string;
}

export default function NavigationCard({ link, color }: NavigationCardProps) {
  const IconComponent = iconMap[link.icon] || Globe;

  return (
    <motion.a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex items-center gap-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 cursor-pointer overflow-hidden"
      whileHover={{ 
        scale: 1.02,
        boxShadow: `0 0 30px ${color}30`
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at center, ${color}20 0%, transparent 70%)`
        }}
      />

      <motion.div 
        className="relative z-10 flex items-center justify-center w-12 h-12 rounded-lg"
        style={{ backgroundColor: `${color}20` }}
        whileHover={{ rotate: 5 }}
      >
        <IconComponent 
          size={24} 
          style={{ color }} 
          className="transition-transform group-hover:scale-110"
        />
      </motion.div>

      <div className="relative z-10 flex-1 min-w-0">
        <h3 className="text-white font-semibold text-base truncate group-hover:text-white transition-colors">
          {link.name}
        </h3>
        <p className="text-gray-400 text-sm truncate group-hover:text-gray-300 transition-colors">
          {link.description}
        </p>
      </div>


      <motion.div
        className="relative z-10 text-gray-500 group-hover:text-white transition-colors"
        initial={{ x: 0, opacity: 0.5 }}
        whileHover={{ x: 4, opacity: 1 }}
      >
        <svg 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M7 17L17 7" />
          <path d="M7 7h10v10" />
        </svg>
      </motion.div>
    </motion.a>
  );
}