import { Link, useLocation } from 'react-router-dom';
import { Home, Camera, ClipboardList, MapPin, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/new-assessment', icon: Camera, label: 'New' },
  { path: '/assessments', icon: ClipboardList, label: 'Assessments' },
  { path: '/map', icon: MapPin, label: 'Map' },
  { path: '/materials', icon: Package, label: 'Materials' },
];

export function Navigation() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white">
      <div className="flex justify-around">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-1 flex-col items-center gap-1 py-2 text-xs transition-colors',
                isActive
                  ? 'text-green-700'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <item.icon className={cn('h-5 w-5', isActive && 'stroke-[2.5]')} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
