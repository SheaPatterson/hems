import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import { ThemeToggle } from './ThemeToggle';
import GlobalSearch from './GlobalSearch';
import BrandedFooter from './BrandedFooter';
import ConnectionStatusBanner from './ConnectionStatusBanner';

const Layout = () => {
  return (
    <div className="flex min-h-screen bg-background">
      <ConnectionStatusBanner />
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 border-r">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b flex items-center justify-between px-4 lg:px-8 shrink-0">
          <div className="flex items-center lg:hidden">
            <MobileNav />
          </div>
          <div className="flex-1 flex justify-end items-center space-x-4">
            <GlobalSearch />
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden">
          <div className="flex-1 p-4 lg:p-8">
            <Outlet />
          </div>
          <BrandedFooter />
        </main>
      </div>
    </div>
  );
};

export default Layout;