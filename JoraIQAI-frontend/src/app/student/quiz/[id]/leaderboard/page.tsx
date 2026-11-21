'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '../../../../../lib/api';
import { LeaderboardEntry } from '../../../../../types';
import { Badge } from '../../../../../components/Badge';
import { ProgressBar } from '../../../../../components/ProgressBar';
import { formatDate } from '../../../../../lib/utils';
import {
  ArrowLeft,
  Trophy,
  Medal,
  Award,
  Sparkles,
  BookOpen,
  User,
  CheckCircle2,
} from 'lucide-react';

export default function StudentQuizLeaderboardPage() {
  const params = useParams();
  const quizId = params.id as string;

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [quizTitle, setQuizTitle] = useState('');
  const [currentUserEntry, setCurrentUserEntry] = useState<LeaderboardEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadLeaderboard() {
      setIsLoading(true);
      try {
        const data = await api.get<{
          quizTitle: string;
          leaderboard: LeaderboardEntry[];
          currentUserEntry: LeaderboardEntry | null;
        }>(`/quizzes/${quizId}/leaderboard`);
        setQuizTitle(data.quizTitle);
        setLeaderboard(data.leaderboard);
        setCurrentUserEntry(data.currentUserEntry);
      } catch (err: any) {
        setError(err.message || 'Failed to load leaderboard');
      } finally {
        setIsLoading(false);
      }
    }

    if (quizId) {
      loadLeaderboard();
    }
  }, [quizId]);

  const getRankBadge = (rank: number, isCurrentUser: boolean) => {
    if (rank === 1) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-extrabold text-xs shadow-sm">
          <Trophy className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
          Rank #1
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-200 text-slate-800 font-extrabold text-xs shadow-sm">
          <Medal className="w-3.5 h-3.5 text-slate-500 fill-slate-400" />
          Rank #2
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-100 text-orange-800 font-extrabold text-xs shadow-sm">
          <Award className="w-3.5 h-3.5 text-orange-600" />
          Rank #3
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-bold text-xs">
        Rank #{rank}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-500">Loading student rankings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            href={`/student/quiz/${quizId}/result`}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Peer Leaderboard
              </h1>
              <Badge variant="primary">{quizTitle}</Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Ranked by accuracy. Equal scores share equal rank.
            </p>
          </div>
        </div>

        <Link
          href="/student/dashboard"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
        >
          <BookOpen className="w-4 h-4" />
          <span>My Quizzes</span>
        </Link>
      </div>

      {error ? (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
          {error}
        </div>
      ) : (
        <>
          {/* Current User Highlight Banner */}
          {currentUserEntry && (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-lg">
                  #{currentUserEntry.rank}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black">Your Current Standing</span>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-white/20">
                      You
                    </span>
                  </div>
                  <p className="text-xs text-indigo-100 mt-0.5">
                    {currentUserEntry.correctAnswers} of {currentUserEntry.totalQuestions} correct answers
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <p className="text-2xl font-black">{currentUserEntry.accuracy}%</p>
                <p className="text-[11px] text-indigo-100">Overall Accuracy</p>
              </div>
            </div>
          )}

          {/* Standings Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                Completed Students ({leaderboard.length})
              </h2>
              <span className="text-xs text-slate-400">Ranked highest accuracy first</span>
            </div>

            <div className="divide-y divide-slate-100">
              {leaderboard.map((entry) => (
                <div
                  key={entry.studentId}
                  className={`p-4.5 flex items-center justify-between transition ${
                    entry.isCurrentUser
                      ? 'bg-indigo-50/80 border-l-4 border-l-indigo-600 font-semibold'
                      : 'hover:bg-slate-50/70'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-20">{getRankBadge(entry.rank, entry.isCurrentUser)}</div>

                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-slate-900">{entry.studentName}</p>
                        {entry.isCurrentUser && (
                          <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-indigo-200 text-indigo-800">
                            YOU
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500">{entry.studentEmail}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm font-black text-slate-900">{entry.accuracy}%</p>
                      <p className="text-[11px] text-slate-500">
                        {entry.correctAnswers} / {entry.totalQuestions}
                      </p>
                    </div>

                    <div className="hidden sm:block text-right text-[11px] text-slate-400">
                      <p>{formatDate(entry.submittedAt)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
