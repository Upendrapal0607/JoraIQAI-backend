'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  ArrowRight,
  GraduationCap,
  Users,
  BarChart3,
  Trophy,
  ShieldCheck,
  CheckCircle2,
  FileCode,
} from 'lucide-react';

export default function HomePage() {
  const { quickLogin, isLoading } = useAuth();

  return (
    <div className="relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-indigo-500/10 via-violet-500/15 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24">
        {/* Assessment Tag */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-semibold shadow-sm">
            <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
            <span>JoraIQ.AI — Full Stack Product Engineering Assessment</span>
          </div>
        </div>

        {/* Hero Title */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight">
            Quiz-Based Learning &{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-700 bg-clip-text text-transparent">
              Precision Analytics
            </span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
            A high-performance evaluation platform built with Next.js, NestJS, TypeScript, and Supabase.
            Role-based authorization, server-side score calculation, instant leaderboards, and teacher analytics.
          </p>
        </div>

        {/* 1-Click Demo Evaluation Box */}
        <div className="mt-10 max-w-2xl mx-auto p-6 bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/50">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                1-Click Instant Demo Evaluation
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Pre-seeded test accounts. Click any role below for zero-friction evaluation.
              </p>
            </div>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
              Ready to Demo
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            <button
              onClick={() => quickLogin('TEACHER')}
              disabled={isLoading}
              className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/60 hover:bg-indigo-100/70 text-left transition group flex items-start justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-bold text-slate-900">Teacher Account</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1">Dr. Alan Turing</p>
                <p className="text-[10px] text-indigo-600 font-medium">Create quizzes, assign & inspect analytics</p>
              </div>
              <ArrowRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-1 group-hover:text-indigo-700 transition" />
            </button>

            <button
              onClick={() => quickLogin('STUDENT_1')}
              disabled={isLoading}
              className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/70 text-left transition group flex items-start justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-900">Student 1 (Top Rank)</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1">Ada Lovelace (100% Score)</p>
                <p className="text-[10px] text-emerald-600 font-medium">View leaderboard rank 1 & take pending quiz</p>
              </div>
              <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 group-hover:text-emerald-700 transition" />
            </button>

            <button
              onClick={() => quickLogin('STUDENT_2')}
              disabled={isLoading}
              className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/60 hover:bg-amber-100/70 text-left transition group flex items-start justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-bold text-slate-900">Student 2 (Tied Rank)</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1">Grace Hopper (100% Score)</p>
                <p className="text-[10px] text-amber-600 font-medium">Tests equal-score tie rank logic</p>
              </div>
              <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 group-hover:text-amber-700 transition" />
            </button>

            <button
              onClick={() => quickLogin('STUDENT_3')}
              disabled={isLoading}
              className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left transition group flex items-start justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-slate-600" />
                  <span className="text-xs font-bold text-slate-900">Student 3 (Rank 3)</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1">Claude Shannon (60% Score)</p>
                <p className="text-[10px] text-slate-600 font-medium">View detailed question review & mistakes</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-slate-800 transition" />
            </button>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Need a fresh account?</span>
            <div className="flex items-center gap-3">
              <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-800">
                Custom Login &rarr;
              </Link>
              <Link href="/register" className="font-semibold text-slate-700 hover:text-slate-900">
                Register New
              </Link>
            </div>
          </div>
        </div>

        {/* Core Architecture Features Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Role-Based Security</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Strict NestJS RolesGuard & JwtAuthGuard enforce TEACHER vs STUDENT operations. Students cannot view answer keys before submission.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Teacher Analytics</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Track student completion rates, average accuracy, score distribution, and per-question difficulty breakdowns.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600">
              <Trophy className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Precise Leaderboards</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Standard competition ranking handles equal scores fairly, highlights the logged-in student, and restricts access to assigned peers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
