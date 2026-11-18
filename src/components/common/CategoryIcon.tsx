import React from 'react';
import {
  Briefcase,
  Car,
  Coins,
  Film,
  GraduationCap,
  HeartPulse,
  Landmark,
  Laptop,
  Layers,
  Plane,
  QrCode,
  Send,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Store,
  Users,
  Utensils,
  Vault,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { getCategoryMeta, type CategoryIconName } from '../../constants/categories';
import type { TransactionCategory } from '../../types';

const CATEGORY_ICON_MAP: Record<CategoryIconName, LucideIcon> = {
  Briefcase,
  Laptop,
  Store,
  Coins,
  Utensils,
  Car,
  ShoppingBag,
  GraduationCap,
  Film,
  Zap,
  HeartPulse,
  Sparkles,
  Plane,
  Landmark,
  QrCode,
  Smartphone,
  Users,
  Vault,
  Send,
  Layers,
};

interface CategoryIconProps {
  category: TransactionCategory;
  size?: number;
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = React.memo(
  ({ category, size = 18, className = '' }) => {
    const meta = getCategoryMeta(category);
    const IconComponent = CATEGORY_ICON_MAP[meta.iconName] ?? Layers;
    return <IconComponent size={size} className={className} strokeWidth={2} />;
  }
);

CategoryIcon.displayName = 'CategoryIcon';
