import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  CreditCard, 
  Users, 
  Bell, 
  BarChart3, 
  User, 
  Home,
  Heart,
  ArrowRightLeft
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const Navbar = () => {
  const location = useLocation();
  const { user } = useAuth();

  const navItems = [
    { to: '/', icon: Home, label: 'Dashboard' },
    { to: '/transactions', icon: ArrowRightLeft, label: 'Transações' },
    { to: '/shared-accounts', icon: Users, label: 'Contas Compartilhadas' },
    { to: '/reminders', icon: Bell, label: 'Lembretes' },
    { to: '/analytics', icon: BarChart3, label: 'Relatórios' },
    { to: '/motivation', icon: Heart, label: 'Motivação' },
    { to: '/profile', icon: User, label: 'Perfil' },
  ];

  return (
    <nav className="bg-gradient-primary border-b border-border/10 shadow-primary">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <CreditCard className="h-8 w-8 text-primary-foreground" />
            <span className="text-xl font-bold text-primary-foreground">Finska</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <Link key={item.to} to={item.to}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    size="sm"
                    className={`text-primary-foreground hover:bg-white/20 ${
                      isActive ? 'bg-white/20' : ''
                    }`}
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </div>
          
          <div className="flex items-center space-x-2">
            {user && (
              <span className="text-primary-foreground font-medium">
                {user.user_metadata?.display_name || user.email}
              </span>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;