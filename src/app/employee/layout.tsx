// app/employee/layout.tsx

'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from "./Component/navbar";
import Sidebar from "./Component/sidebar";
import AuthGuard from "./Component/AuthGuard";

export default function EmployeeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  
  // Check if current path is an auth page
  const isAuthPage = pathname?.startsWith('/employee/Auth') || pathname === '/employee/login';

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <AuthGuard>
      {/* If it's an auth page, render without navbar/sidebar */}
      {isAuthPage ? (
        <div className="min-h-screen bg-gray-50">
          {children}
        </div>
      ) : (
        /* Regular employee layout with navbar/sidebar */
        <div className="min-h-screen flex flex-col bg-gray-50">
          {/* Navigation Bar */}
          <Navbar 
            onToggleSidebar={toggleSidebar} 
            sidebarOpen={sidebarOpen} 
          />
          
          {/* Main Layout Container */}
          <div className="flex flex-1 relative">
            {/* Sidebar */}
            <Sidebar 
              isOpen={sidebarOpen} 
              onToggle={toggleSidebar} 
            />
            
            {/* Main Content Area */}
            <main 
              className={`flex-1 transition-all duration-300 ease-in-out ${
                sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'
              }`}
              onClick={() => sidebarOpen && setSidebarOpen(false)}
            >
              <div className="p-6 max-w-full">
                <div className="max-w-7xl mx-auto">
                  {children}
                </div>
              </div>
            </main>
          </div>
        </div>
      )}
    </AuthGuard>
  );
}