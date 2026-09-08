import React from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  HelpCircle,
  FileSpreadsheet,
  Users,
  BarChart3,
  ShieldAlert,
  LogOut,
  GraduationCap,
  Radio,
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Live Monitoring', path: '/admin/live', icon: Radio, isLive: true },
    { label: 'Question Bank', path: '/admin/questions', icon: HelpCircle },
    { label: 'Exam Builder', path: '/admin/exams', icon: FileSpreadsheet },
    { label: 'Students', path: '/admin/students', icon: Users },
    { label: 'Results & Analytics', path: '/admin/results', icon: BarChart3 },
    { label: 'Integrity Logs', path: '/admin/integrity', icon: ShieldAlert },
  ];

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#1C1D21] flex flex-col font-sans selection:bg-[#1A2B4C] selection:text-[#FBF9F5]">
      {/* Top Academic Masthead */}
      <header className="bg-[#1A2B4C] text-[#FBF9F5] border-b border-[#1C1D21] sticky top-0 z-50 shadow-tactile">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-[#C88A2D] text-[#1C1D21] border border-[#1C1D21] flex items-center justify-center font-bold shadow-xs">
              <GraduationCap className="w-5 h-5 text-[#1C1D21]" />
            </div>
            <div>
              <span className="font-serif font-bold text-base sm:text-lg tracking-tight text-white">
                CBT Control Administration
              </span>
              <span className="hidden md:inline-block ml-2 font-mono text-[10px] uppercase bg-[#121F38] text-[#C88A2D] px-2 py-0.5 border border-[#2E323B]">
                Chief Proctor Console
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold text-white font-serif">{user?.name || 'Rajat Kolhapure'}</div>
              <div className="text-[10px] text-[#C88A2D] font-mono">{user?.email}</div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1.5 bg-[#121F38] hover:bg-[#A83232] text-white text-xs font-mono px-3 py-1.5 border border-[#2E323B] transition btn-tactile cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>LOGOUT</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex gap-6">
        {/* Navigation Sidebar */}
        <aside className="w-56 shrink-0 hidden md:block">
          <nav className="bg-white border border-[#1C1D21] shadow-tactile p-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.path === '/admin'
                  ? location.pathname === '/admin'
                  : location.pathname.startsWith(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between px-3 py-2.5 text-xs font-mono uppercase tracking-wider transition-colors duration-160 ease-out ${
                    isActive
                      ? 'bg-[#1A2B4C] text-[#FBF9F5] font-bold border border-[#1C1D21] shadow-xs'
                      : 'text-[#575A65] hover:bg-[#F4EFEA] hover:text-[#1C1D21]'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#C88A2D]' : 'text-[#8E929E]'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.isLive && (
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full bg-[#236B47] opacity-75"></span>
                      <span className="relative inline-flex h-2 w-2 bg-[#236B47]"></span>
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Dynamic Content Outlet */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
