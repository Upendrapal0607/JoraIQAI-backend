'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '../../../../../lib/api';
import { QuizAnalytics } from '../../../../../types';
import { Badge } from '../../../../../components/Badge';
import { ProgressBar } from '../../../../../components/ProgressBar';
import { formatDate } from '../../../../../lib/utils';
import {
  ArrowLeft,
  Users,
  CheckCircle2,
  TrendingUp,
  Trophy,
  UserCheck,
  Clock,
  BarChart3,
  HelpCircle,
  Award,
} from 'lucide-react';

export default function QuizAnalyticsPage() {
  const params = useParams();
  const quizId = params.id as string;

  const [analytics, setAnalytics] = useState<QuizAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAnalytics() {
      setIsLoading(true);
      try {
        const data = await api.get<QuizAnalytics>(`/quizzes/${quizId}/analytics`);
        setAnalytics(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load quiz analytics');
      } finally {
        setIsLoading(false);
      }
    }

    if (quizId) {
      loadAnalytics();
    }
  }, [quizId]);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-500">Calculating cohort analytics and accuracy...</p>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
          {error || 'Analytics not available.'}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            href="/teacher/dashboard"
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Performance Analytics
              </h1>
              <Badge variant="primary">{analytics.quizTitle}</Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Comprehensive report of student engagement, accuracy rates, and question breakdown.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/teacher/quizzes/${quizId}/assign`}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition"
          >
            <Users className="w-4 h-4 text-blue-600" />
            <span>Manage Assignments</span>
          </Link>

          <Link
            href={`/teacher/quizzes/${quizId}/leaderboard`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 text-xs font-bold transition"
          >
            <Trophy className="w-4 h-4" />
            <span>View Leaderboard</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500">Students Assigned</p>
            <p className="text-2xl font-black text-slate-900">{analytics.totalAssigned}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500">Completed Attempts</p>
            <p className="text-2xl font-black text-emerald-600">{analytics.totalCompleted}</p>
            <p className="text-[10px] text-slate-400">{analytics.completionRate}% completion rate</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500">Average Quiz Accuracy</p>
            <p className="text-2xl font-black text-indigo-600">{analytics.averageAccuracy}%</p>
            <p className="text-[10px] text-slate-400">Mean cohort mastery</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500">Questions Count</p>
            <p className="text-2xl font-black text-slate-900">{analytics.questionAnalytics.length}</p>
            <p className="text-[10px] text-slate-400">MCQ items</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
            <HelpCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Student-wise Scores & Accuracy Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-indigo-600" />
            Student Performance & Accuracy Breakdown ({analytics.studentPerformance.length})
          </h2>
        </div>

        {analytics.studentPerformance.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">No students assigned to this quiz yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-[10px] tracking-wider border-y border-slate-200">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4">Correct / Total</th>
                  <th className="py-3 px-4">Accuracy</th>
                  <th className="py-3 px-4">Submitted At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {analytics.studentPerformance.map((item) => {
                  const isCompleted = item.status === 'COMPLETED';
                  const attempt = item.attempt;

                  return (
                    <tr key={item.studentId} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">{item.studentName}</p>
                        <p className="text-[11px] text-slate-500">{item.studentEmail}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={isCompleted ? 'success' : 'warning'} size="sm">
                          {isCompleted ? 'Completed' : 'Pending'}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {isCompleted && attempt ? `${attempt.score} pts` : '—'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        {isCompleted && attempt
                          ? `${attempt.correctAnswers} / ${attempt.totalQuestions}`
                          : '—'}
                      </td>
                      <td className="py-3.5 px-4">
                        {isCompleted && attempt ? (
                          <div className="flex items-center gap-2 w-32">
                            <ProgressBar value={attempt.accuracy} size="sm" />
                            <span className="font-extrabold text-slate-800">{attempt.accuracy}%</span>
                          </div>
                        ) : (
                          <span className="text-slate-400">Not submitted</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {isCompleted && attempt ? formatDate(attempt.submittedAt) : 'Pending'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Question-wise accuracy breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-indigo-600" />
          Question-Level Accuracy & Difficulty Diagnostics
        </h2>
        <p className="text-xs text-slate-500">
          Identify questions where students struggled or performed exceptionally well.
        </p>

        <div className="space-y-3 pt-2">
          {analytics.questionAnalytics.map((q, idx) => (
            <div key={q.questionId} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-2.5">
                  <span className="text-[11px] font-black text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full shrink-0">
                    Q{idx + 1}
                  </span>
                  <p className="text-xs font-bold text-slate-800">{q.questionText}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-sm font-black text-indigo-600">{q.accuracy}%</span>
                  <p className="text-[10px] text-slate-500">
                    {q.correctCount} of {q.totalAttempts} correct
                  </p>
                </div>
              </div>
              <ProgressBar value={q.accuracy} size="sm" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
