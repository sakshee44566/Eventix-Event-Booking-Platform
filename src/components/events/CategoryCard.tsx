import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Music, Cpu, Briefcase, GraduationCap, Trophy, Palette, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const iconMap: Record<string, LucideIcon> = {
  Music,
  Cpu,
  Briefcase,
  GraduationCap,
  Trophy,
  Palette,
};

interface CategoryCardProps {
  category: {
    id: string;
    name: string;
    icon: string;
    color: string;
  };
  eventCount?: number;
}

export function CategoryCard({ category, eventCount = 0 }: CategoryCardProps) {
  const Icon = iconMap[category.icon] || Music;

  return (
    <Link to={`/events?category=${category.id}`}>
      <motion.div
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        className="relative group overflow-hidden rounded-2xl p-6 bg-card border border-border hover:border-primary/30 transition-all duration-300"
      >
        <div className={cn(
          "absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 bg-gradient-to-br",
          category.color
        )} />
        
        <div className="relative z-10">
          <div className={cn(
            "inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br mb-4",
            category.color
          )}>
            <Icon className="h-7 w-7 text-primary-foreground" />
          </div>
          
          <h3 className="font-semibold text-lg mb-1">{category.name}</h3>
          <p className="text-sm text-muted-foreground">
            {eventCount} {eventCount === 1 ? 'event' : 'events'}
          </p>
        </div>

        <div className="absolute bottom-0 right-0 w-24 h-24 opacity-5 group-hover:opacity-10 transition-opacity">
          <Icon className="w-full h-full" />
        </div>
      </motion.div>
    </Link>
  );
}