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
} from 'lucide-react';
import { CATEGORY_META } from '../../constants/categories';
import type { TransactionCategory } from '../../types/finance';

interface CategoryIconProps {
  category: TransactionCategory;
  size?: number;
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  category,
  size = 18,
  className = '',
}) => {
  const meta = CATEGORY_META[category] ?? CATEGORY_META.other_expense;
  const props = { size, className, strokeWidth: 2 };

  switch (meta.iconName) {
    case 'Briefcase':
      return <Briefcase {...props} />;
    case 'Laptop':
      return <Laptop {...props} />;
    case 'Store':
      return <Store {...props} />;
    case 'Coins':
      return <Coins {...props} />;
    case 'Utensils':
      return <Utensils {...props} />;
    case 'Car':
      return <Car {...props} />;
    case 'ShoppingBag':
      return <ShoppingBag {...props} />;
    case 'GraduationCap':
      return <GraduationCap {...props} />;
    case 'Film':
      return <Film {...props} />;
    case 'Zap':
      return <Zap {...props} />;
    case 'HeartPulse':
      return <HeartPulse {...props} />;
    case 'Sparkles':
      return <Sparkles {...props} />;
    case 'Plane':
      return <Plane {...props} />;
    case 'Landmark':
      return <Landmark {...props} />;
    case 'QrCode':
      return <QrCode {...props} />;
    case 'Smartphone':
      return <Smartphone {...props} />;
    case 'Users':
      return <Users {...props} />;
    case 'Vault':
      return <Vault {...props} />;
    case 'Send':
      return <Send {...props} />;
    case 'Layers':
    default:
      return <Layers {...props} />;
  }
};
