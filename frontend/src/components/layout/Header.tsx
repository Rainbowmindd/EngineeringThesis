import * as React from 'react';
import { GraduationCap, User } from 'lucide-react';

// Import komponentów UI
import { Button } from '../ui/Button';

// Pomocniczy komponent Link
interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children: React.ReactNode;
}
const Link: React.FC<LinkProps> = ({ children, className = '', ...props }) => (
  <a className={`${className}`} {...props}>
    {children}
  </a>
);

const Header: React.FC = () => {
  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <GraduationCap className="h-8 w-8 text-green-600" />
          <span className="text-xl font-bold text-gray-900">Konsultacje AGH</span>
        </div>

        {/* Nawigacja */}
        <nav className="hidden lg:flex items-center space-x-8">
          <Link href="#" className="text-gray-600 hover:text-green-600 transition-colors font-medium">
            Moi wykładowcy
          </Link>
          <Link href="#" className="text-gray-600 hover:text-green-600 transition-colors font-medium">
            Moje konsultacje
          </Link>
          <Link href="#" className="text-gray-600 hover:text-green-600 transition-colors font-medium">
            Plan zajęć
          </Link>
          <Link href="#" className="text-gray-600 hover:text-green-600 transition-colors font-medium">
            Pomoc
          </Link>
        </nav>

        {/* Profil i Wylogowanie */}
        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600 p-2 rounded-full hover:bg-gray-50 transition-colors">
            <User className="h-5 w-5 text-green-500" />
            <span className='font-semibold'>Jan Kowalski</span>
          </div>
          <Button variant="outline" size="sm" className="border-gray-300 text-gray-700 hover:bg-gray-100">
            Wyloguj
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;