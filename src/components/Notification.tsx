import React, { useEffect } from 'react';
import { Badge } from '../types';

interface NotificationProps {
  badge: Badge;
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ badge, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-4 right-4 animate-slide-up">
      <div className="bg-[#1A1A1A] border border-[#00FF94] rounded-lg p-4 shadow-lg max-w-sm">
        <div className="flex items-center space-x-3">
          <div className="text-3xl">{badge.emoji}</div>
          <div>
            <h3 className="font-medium text-[#00FF94]">New Badge Earned!</h3>
            <p className="text-white font-medium">{badge.name}</p>
            <p className="text-sm text-gray-400">{badge.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notification