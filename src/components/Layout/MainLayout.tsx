import { ReactNode } from 'react';
import { BottomNav } from './BottomNav';

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-2xl mx-auto">
        {children}
      </div>
      <BottomNav />
    </div>
  );
};
