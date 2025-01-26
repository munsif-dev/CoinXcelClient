import React from 'react';
import { Button } from '@/components/ui/button';
import { SheetClose } from '@/components/ui/sheet';
import {
  ExitIcon,
  PersonIcon,
  BookmarkIcon,
  DashboardIcon,
  HomeIcon,
  ActivityIcon,
  CreditCardIcon,
  LandmarkIcon,
  WalletIcon,
} from 'lucide-react';

// Menu items
const menu = [
  { name: 'Home', path: '/', icon: <HomeIcon className="h-6 w-6" /> },
  { name: 'Portfolio', path: '/portfolio', icon: <DashboardIcon className="h-6 w-6" /> },
  { name: 'Watchlist', path: '/watchlist', icon: <BookmarkIcon className="h-6 w-6" /> },
  { name: 'Activity', path: '/activity', icon: <ActivityIcon className="h-6 w-6" /> },
  { name: 'Wallet', path: '/wallet', icon: <WalletIcon className="h-6 w-6" /> },
  { name: 'Payment Details', path: '/payment-details', icon: <CreditCardIcon className="h-6 w-6" /> },
  { name: 'Withdrawal', path: '/withdrawal', icon: <LandmarkIcon className="h-6 w-6" /> },
  { name: 'Profile', path: '/profile', icon: <PersonIcon className="h-6 w-6" /> },
  { name: 'Logout', path: '/logout', icon: <ExitIcon className="h-6 w-6" /> },
];

const Sidebar = () => {
  return (
    <div className="mt-10 space-y-5">
      {menu.map((item) => (
        <div key={item.name}>
          <SheetClose >
            <Button
              variant="outline"
              className="flex items-center gap-5 py-3 px-4 w-full justify-start"
            >
              {item.icon}
              <span>{item.name}</span>
            </Button>
          </SheetClose>
        </div>
      ))}
    </div>
  );
};

export default Sidebar;