'use client';
import { useState, useRef, useEffect, RefObject } from 'react';
import { ChevronDown, User, Settings, LogOut } from 'lucide-react';

interface UserProfileProps {
  user: {
    full_name: string;
    email: string;
  };
  onSignout: () => void;
}

interface UserDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    full_name: string;
    email: string;
  };
  onSignout: () => void;
  buttonRef: RefObject<HTMLButtonElement | null>;
}

const UserDropdown = ({ 
  isOpen, 
  onClose, 
  user,
  onSignout,
  buttonRef 
}: UserDropdownProps) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, buttonRef]);

  if (!isOpen) return null;

  return (
    <div 
      ref={dropdownRef}
      className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-[60] animate-in fade-in slide-in-from-top-2 duration-200"
    >
      <div className="absolute -top-2 right-4 w-4 h-4 bg-white border-l border-t border-gray-200 transform rotate-45"></div>
      
      <div className="px-4 py-3 border-b border-gray-100">
        <p className="text-sm font-medium text-gray-900">{user.full_name}</p>
        <p className="text-xs text-gray-500">{user.email}</p>
      </div>
      
      <div className="py-1">
        <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
          <Settings className="w-4 h-4 mr-3" />
          Settings
        </button>
        <button 
          onClick={onSignout}
          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4 mr-3" />
          Sign Out
        </button>
      </div>
    </div>
  );
};

const UserProfile = ({ user, onSignout }: UserProfileProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const profileButtonRef = useRef<HTMLButtonElement>(null);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500', 
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-yellow-500',
      'bg-red-500'
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className="relative">
      <button
        ref={profileButtonRef}
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 focus:outline-none transition-colors"
      >
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${getAvatarColor(user.full_name)}`}>
          {getInitials(user.full_name)}
        </div>
        <ChevronDown className="w-4 h-4" />
      </button>

      <UserDropdown
        isOpen={isDropdownOpen}
        onClose={() => setIsDropdownOpen(false)}
        user={user}
        onSignout={onSignout}
        buttonRef={profileButtonRef}
      />
    </div>
  );
};

export default UserProfile;