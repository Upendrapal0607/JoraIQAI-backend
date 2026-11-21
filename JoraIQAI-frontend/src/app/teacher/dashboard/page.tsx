'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '../../../lib/api';
import { Quiz } from '../../../types';
import { Badge } from '../../../components/Badge';
import { ProgressBar } from '../../../components/ProgressBar';
import { formatDate } from '../../../lib/utils';
import {
  PlusCircle,
  BarChart3,
  Users,
  Trophy,
  BookOpen,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Trash2,
} from 'lucide-react';

export default function TeacherDashboardPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [overview, setOverview] = useState<{
    totalQuizzes: number;
    totalAssigned: number;
    totalCompleted: number;
    completionRate: number;
    overallAccuracy: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [quizzesData, overviewData] = await Promise.all([
        api.get<Quiz[]>('/quizzes/teacher'),
        api.get<any>('/analytics/overview'),
      ]);
      setQuizzes(quizzesData);
      setOverview(overviewData);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleDelete = async (quizId: string) => {
    if (!confirm('Are you sure you want to delete this quiz? All assignments, attempts, and analytics will be removed.')) {
      return;
    }
    try {
      await api.delete(`/quizzes/${quizId}`);
      fetchDashboardData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete quiz');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Teacher Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your quizzes, assign them to students, and monitor cohort accuracy in real-time.
          </p>
        </div>

        <Link
          href="/teacher/quizzes/create"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition group"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New Quiz</span>
        </Link>
      </div>

      {/* KPI Overview Cards */}
      {overview && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500">Total Quizzes</p>
              <p className="text-2xl font-black text-slate-900">{overview.totalQuizzes}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500">Total Assigned</p>
              <p className="text-2xl font-black text-slate-900">{overview.totalAssigned}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500">Completed Attempts</p>
              <p className="text-2xl font-black text-emerald-600">{overview.totalCompleted}</p>
              <p className="text-[10px] text-slate-400">{overview.completionRate}% completion rate</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500">Cohort Average Accuracy</p>
              <p className="text-2xl font-black text-indigo-600">{overview.overallAccuracy}%</p>
              <p className="text-[10px] text-slate-400">Across all completed quizzes</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        </div>
      )}

      {/* Quizzes List Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            Your Created Quizzes ({quizzes.length})
          </h2>
        </div>

        {isLoading ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500">Loading your quizzes...</p>
          </div>
        ) : error ? (
          <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs">
            {error}
          </div>
        ) : quizzes.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">No quizzes created yet</h3>
              <p className="text-xs text-slate-500 mt-1">Get started by creating your first multiple-choice quiz.</p>
            </div>
            <Link
              href="/teacher/quizzes/create"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition"
            >
              <PlusCircle className="w-4 h-4" />
              Create Quiz
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quizzes.map((quiz) => {
              const completionRate =
                quiz.totalAssigned && quiz.totalAssigned > 0
                  ? Math.round(((quiz.totalCompleted || 0) / quiz.totalAssigned) * 100)
                  : 0;

              return (
                <div
                  key={quiz.id}
                  className="bg-white border border-slate-200/90 rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col justify-between space-y-5"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-bold text-slate-900 tracking-tight leading-snug">
                          {quiz.title}
                        </h3>
                        <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                          {quiz.description || 'No description provided.'}
                        </p>
                      </div>
                      <Badge variant="primary" size="sm">
                        {quiz.totalQuestions} Questions
                      </Badge>
                    </div>

                    {/* Stats pills */}
                    <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase font-semibold">Assigned</p>
                        <p className="text-sm font-black text-slate-800">{quiz.totalAssigned || 0}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase font-semibold">Completed</p>
                        <p className="text-sm font-black text-emerald-600">{quiz.totalCompleted || 0}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase font-semibold">Avg Accuracy</p>
                        <p className="text-sm font-black text-indigo-600">
                          {quiz.averageAccuracy ? `${quiz.averageAccuracy}%` : '—'}
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                        <span>Cohort Progress</span>
                        <span>{completionRate}% completed</span>
                      </div>
                      <ProgressBar value={completionRate} size="sm" color="indigo" />
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/teacher/quizzes/${quiz.id}/assign`}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
                      >
                        <Users className="w-3.5 h-3.5 text-blue-600" />
                        Assign
                      </Link>

                      <Link
                        href={`/teacher/quizzes/${quiz.id}/analytics`}
                        className="px-3 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center gap-1.5 transition"
                      >
                        <BarChart3 className="w-3.5 h-3.5" />
                        Analytics
                      </Link>

                      <Link
                        href={`/teacher/quizzes/${quiz.id}/leaderboard`}
                        className="px-3 py-1.5 rounded-lg border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-semibold flex items-center gap-1.5 transition"
                      >
                        <Trophy className="w-3.5 h-3.5" />
                        Rankings
                      </Link>
                    </div>

                    <button
                      onClick={() => handleDelete(quiz.id)}
                      title="Delete Quiz"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
