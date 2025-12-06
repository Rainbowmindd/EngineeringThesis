import * as React from 'react';
import { GraduationCap } from 'lucide-react';

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children: React.ReactNode;
}
const Link: React.FC<LinkProps> = ({ children, className = '', ...props }) => (
  <a className={`${className}`} {...props}>
    {children}
  </a>
);

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white py-12 px-4">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <GraduationCap className="h-6 w-6 text-green-400" />
              <span className="text-lg font-bold">Konsultacje AGH</span>
            </div>
            <p className="text-gray-400 text-sm">System rezerwacji konsultacji dla studentów Akademii Górniczo-Hutniczej w Krakowie.</p>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-green-400">Funkcje</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <Link href="#" className="hover:text-green-300 transition-colors">
                  Moi wykładowcy
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-green-300 transition-colors">
                  Kalendarz konsultacji
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-green-300 transition-colors">
                  Historia spotkań
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-green-400">Pomoc</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <Link href="#" className="hover:text-green-300 transition-colors">
                  Jak korzystać z systemu
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-green-300 transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-green-300 transition-colors">
                  Kontakt z IT
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-green-400">AGH</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <Link href="#" className="hover:text-green-300 transition-colors">
                  Portal studenta
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-green-300 transition-colors">
                  Plan zajęć
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-green-300 transition-colors">
                  UPeL
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Akademia Górniczo-Hutnicza. System konsultacji.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;