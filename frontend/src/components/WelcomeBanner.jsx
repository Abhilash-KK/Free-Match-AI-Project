import React from 'react';

const WelcomeBanner = ({ 
  userSession, 
  defaultUsername = 'user', 
  greeting = 'Good evening,',
  subtitle = "Here's an overview of your projects, hiring activity, and payments.",
  actionButton = null 
}) => {
  const userEmailOrName = userSession?.email || (defaultUsername ? `${defaultUsername}@gmail.com` : 'user@gmail.com');

  return (
    <div className="bg-gradient-to-r from-blue-50/80 via-white to-blue-50/40 rounded-3xl p-7 border border-blue-100/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
      {/* Decorative background glow shape */}
      <div className="absolute right-0 top-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

      <div className="space-y-1 z-10">
        <p className="text-xs font-bold text-slate-500">{greeting}</p>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <span>{userEmailOrName}</span>
        </h2>
        {subtitle && (
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            {subtitle}
          </p>
        )}
      </div>

      {actionButton && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 z-10">
          {actionButton}
        </div>
      )}
    </div>
  );
};

export default WelcomeBanner;
