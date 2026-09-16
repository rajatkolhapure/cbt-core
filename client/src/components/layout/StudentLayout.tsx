import React from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, GraduationCap, UserCheck, Flame, LayoutDashboard } from 'lucide-react';

export const StudentLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#1C1D21] flex flex-col font-sans selection:bg-[#1A2B4C] selection:text-[#FBF9F5]">
      {/* Top Academic Masthead */}
      <header className="bg-[#1A2B4C] text-[#FBF9F5] border-b border-[#1C1D21] sticky top-0 z-40 shadow-tactile">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link to="/student/dashboard" className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-[#C88A2D] text-[#1C1D21] border border-[#1C1D21] flex items-center justify-center font-bold shadow-xs">
                <GraduationCap className="w-5 h-5 text-[#1C1D21]" />
              </div>
              <div>
                <span className="font-serif font-bold text-base sm:text-lg tracking-tight text-white">
                  Candidate Examination Portal
                </span>
                <span className="hidden sm:inline-block ml-2 font-mono text-[10px] uppercase bg-[#121F38] text-[#C88A2D] px-2 py-0.5 border border-[#2E323B]">
                  Official Testing Station
                </span>
              </div>
            </Link>

            {/* Nav Tabs */}
            <div className="hidden md:flex items-center gap-1.5 ml-6 pl-6 border-l border-white/20 font-mono text-xs">
              <Link
                to="/student/dashboard"
                className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition ${
                  location.pathname === '/student/dashboard'
                    ? 'bg-[#121F38] text-white border border-[#2E323B] font-bold'
                    : 'text-stone-300 hover:text-white hover:bg-[#121F38]/50'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Exams</span>
              </Link>
              <Link
                to="/student/practice/new"
                className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition ${
                  location.pathname.startsWith('/student/practice')
                    ? 'bg-[#C88A2D] text-[#1C1D21] font-bold shadow-xs'
                    : 'text-[#C88A2D] hover:bg-[#121F38]/50'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>AI Practice</span>
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold text-white font-serif">{user?.name}</div>
              <div className="text-[10px] text-[#C88A2D] font-mono flex items-center justify-end gap-1">
                <UserCheck className="w-3 h-3 text-[#C88A2D]" />
                <span>ROLL: {user?.candidateId || user?.email}</span>
              </div>
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

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>
    </div>
  );
};

export default StudentLayout;
