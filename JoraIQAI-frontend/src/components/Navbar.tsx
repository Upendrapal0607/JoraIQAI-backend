'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { Badge } from './Badge';
import {
  Sparkles,
  BookOpen,
  Award,
  BarChart3,
  PlusCircle,
  LogOut,
  UserCheck,
  ChevronDown,
  Layers,
} from 'lucide-react';

export function Navbar() {
  const { user, logout, quickLogin } = useAuth();
  const pathname = usePathname();
  const [showSwitchMenu, setShowSwitchMenu] = useState(false);

  if (!user && (pathname === '/login' || pathname === '/register' || pathname === '/')) {
    return null; // Clean landing/auth header
  }

  const isTeacher = user?.role === 'TEACHER';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-8">
          <Link href={isTeacher ? '/teacher/dashboard' : '/student/dashboard'} className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight">
                Jora<span className="text-indigo-600 dark:text-indigo-400">IQ</span>
                <span className="text-xs font-semibold px-1.5 py-0.5 ml-1 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  AI
                </span>
              </span>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">Learning & Analytics</p>
            </div>
          </Link>

          {/* Nav Links */}
          {user && (
            <nav className="hidden md:flex items-center gap-1">
              {isTeacher ? (
                <>
                  <Link
                    href="/teacher/dashboard"
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                      pathname === '/teacher/dashboard'
                        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Layers className="w-4 h-4" />
                    Dashboard
                  </Link>
                  <Link
                    href="/teacher/quizzes/create"
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                      pathname === '/teacher/quizzes/create'
                        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                    }`}
                  >
                    <PlusCircle className="w-4 h-4" />
                    Create Quiz
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/student/dashboard"
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                      pathname === '/student/dashboard'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                    }`}
                  >
                    <BookOpen className="w-4 h-4" />
                    My Quizzes
                  </Link>
                </>
              )}
            </nav>
          )}
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* Quick Switcher dropdown for instant demo evaluation */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowSwitchMenu(!showSwitchMenu)}
                  className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <UserCheck className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Switch Role</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {showSwitchMenu && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-xl border border-slate-100 py-1.5 z-50 dark:bg-slate-900 dark:border-slate-800 animate-slide-up">
                    <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Demo Accounts
                    </div>
                    <button
                      onClick={() => {
                        quickLogin('TEACHER');
                        setShowSwitchMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 dark:text-slate-200 dark:hover:bg-indigo-950/40"
                    >
                      <span className="font-medium">Dr. Alan Turing</span>
                      <Badge variant="primary" size="sm">Teacher</Badge>
                    </button>
                    <button
                      onClick={() => {
                        quickLogin('STUDENT_1');
                        setShowSwitchMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 dark:text-slate-200 dark:hover:bg-emerald-950/40"
                    >
                      <span className="font-medium">Ada Lovelace</span>
                      <Badge variant="success" size="sm">Student 1</Badge>
                    </button>
                    <button
                      onClick={() => {
                        quickLogin('STUDENT_2');
                        setShowSwitchMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 dark:text-slate-200 dark:hover:bg-emerald-950/40"
                    >
                      <span className="font-medium">Grace Hopper</span>
                      <Badge variant="success" size="sm">Student 2</Badge>
                    </button>
                    <button
                      onClick={() => {
                        quickLogin('STUDENT_3');
                        setShowSwitchMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 dark:text-slate-200 dark:hover:bg-emerald-950/40"
                    >
                      <span className="font-medium">Claude Shannon</span>
                      <Badge variant="success" size="sm">Student 3</Badge>
                    </button>
                  </div>
                )}
              </div>

              {/* User Identity Pill */}
              <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-slate-800">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-200 to-slate-100 flex items-center justify-center text-xs font-bold text-slate-700 border border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700">
                  {user.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
                    {user.name}
                  </p>
                  <p className="text-[10px] text-slate-500 leading-tight">
                    {user.role === 'TEACHER' ? 'Instructor' : 'Student'}
                  </p>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={logout}
                title="Log Out"
                className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition dark:hover:bg-rose-950/30"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-xs font-semibold text-slate-700 hover:text-indigo-600 px-3 py-2 rounded-lg transition"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg shadow-sm transition"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
