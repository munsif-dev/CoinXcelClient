import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { GripHorizontal, Search, Sidebar as SidebarIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


const Navbar = () => {
  return (
    <div className="px-2 py-3 border-b z-50 bg-background bg-opacity-0 sticky top-0 left-0 right-0 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <Sheet>
          <SheetTrigger>
            <Button variant="ghost" size="icon" className="rounded-full h-11 w-11">
              <GripHorizontal className="h-7 w-7" />
            </Button>
          </SheetTrigger>
          <SheetContent className="w-72 border-r-0 flex-col justify-center" side="left">
            <SheetHeader>
              <SheetTitle>
                <div className="text-3xl flex justify-center items-center gap-1">
                  <Avatar>
                    <AvatarImage src="https://cdn.pixabay.com/photo/2022/12/26/11/37/crypto-7678815_960_720.jpg" />
                  </Avatar>
                  <div>
                    <span className="font-bold text-orange-700">Zosh</span>
                    <span> Tread</span>
                  </div>
                </div>
              </SheetTitle>
            </SheetHeader>
            
            <SidebarIcon className="h-6 w-6" />
          </SheetContent>
        </Sheet>
        <p className="text-sm lg:text-base cursor-pointer">Zosh Treading</p>
        <div className="p-0 ml-9">
          <Button variant="outline" className="flex items-center gap-3">
            
            <Search className="h-5 w-5" />
            <span>Search</span>
          </Button>
        </div>
      </div>
      <div>
        <Avatar>
          <AvatarFallback>
            Z
          </AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
};

export default Navbar; 

