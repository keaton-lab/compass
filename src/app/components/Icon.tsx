'use client';

import { Navigation, Calendar, Mail, Play, Wrench, Rocket, Palette, FileText, MessageSquare, Code2, HelpCircle, BookOpen, Package, Container, Users, AtSign, MessageCircle, Headphones, Cloud, CloudLightning, Shield, Globe, Sun, Moon, Grid, List, Pause, Search, X, Settings, Check, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Menu, Home, User, LogOut, LogIn, UserPlus, UserMinus, UserCheck, UserX, UserCircle, UserCog, UserSearch } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { lucideIconNames, brandIconNames } from '../../data/icons-manifest';
import BrandIcon from './BrandIcon';

const lucideIcons: Record<string, LucideIcon> = {
  Navigation,
  Calendar,
  Mail,
  Play,
  Wrench,
  Rocket,
  Palette,
  FileText,
  MessageSquare,
  Code2,
  HelpCircle,
  BookOpen,
  Package,
  Container,
  Users,
  AtSign,
  MessageCircle,
  Headphones,
  Cloud,
  CloudLightning,
  Shield,
  Globe,
  Sun,
  Moon,
  Grid,
  List,
  Pause,
  Search,
  X,
  Settings,
  Check,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Menu,
  Home,
  User,
  LogOut,
  LogIn,
  UserPlus,
  UserMinus,
  UserCheck,
  UserX,
  UserCircle,
  UserCog,
  UserSearch,
};

const lucideIconMap: Record<string, LucideIcon> = {};

for (const name of lucideIconNames) {
  const key = name.toLowerCase().replace(/([a-z])([A-Z])/g, '$1-$2');
  const icon = lucideIcons[name];
  if (icon) {
    lucideIconMap[key] = icon;
    lucideIconMap[name] = icon;
  }
}

const brandIcons = new Set(brandIconNames);

interface IconProps {
  name: string;
  size?: number;
  className?: string;
  color?: string;
}

export default function Icon({ name, size = 24, className = '', color }: IconProps) {
  const normalizedName = name.toLowerCase().replace(/\s+/g, '-');
  
  if (brandIcons.has(normalizedName)) {
    return (
      <BrandIcon 
        name={normalizedName}
        size={size}
        className={className}
        color={color}
      />
    );
  }
  
  const LucideComponent = lucideIconMap[normalizedName] || lucideIconMap[name];
  
  if (LucideComponent) {
    return <LucideComponent size={size} className={className} color={color} />;
  }
  
  return (
    <BrandIcon 
      name={normalizedName}
      size={size}
      className={className}
      color={color}
    />
  );
}

export const AVAILABLE_ICONS = {
  lucide: lucideIconNames,
  brands: brandIconNames,
};
