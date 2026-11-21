'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '../../../../../lib/api';
import { Quiz, QuizAssignment } from '../../../../../types';
import { Badge } from '../../../../../components/Badge';
import { formatDate } from '../../../../../lib/utils';
import {
  ArrowLeft,
  Users,
  Search,
  CheckSquare,
  Square,
  UserCheck,
  CheckCircle2,
  Clock,
  BarChart3,
  AlertCircle,
} from 'lucide-react';

interface StudentUser {
  id: string;
  name: string;
  email: string;
  totalAssigned: number;
  totalCompleted: number;
}

export default function AssignQuizPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.id as string;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [allStudents, setAllStudents] = useState<StudentUser[]>([]);
  const [assignments, setAssignments] = useState<QuizAssignment[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [quizData, studentsData, assignmentsData] = await Promise.all([
        api.get<Quiz>(`/quizzes/${quizId}/teacher`),
        api.get<StudentUser[]>('/users/students'),
        api.get<QuizAssignment[]>(`/quizzes/${quizId}/assignments`),
      ]);

      setQuiz(quizData);
      setAllStudents(studentsData);
      setAssignments(assignmentsData);

      // Pre-select students who are NOT already assigned
      const assignedSet = new Set(assignmentsData.map((a) => a.studentId));
      const unassignedStudents = studentsData.filter((s) => !assignedSet.has(s.id));
      setSelectedIds(unassignedStudents.map((s) => s.id));
    } catch (err: any) {
      setError(err.message || 'Failed to load assignment data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (quizId) {
      loadData();
    }
  }, [quizId]);

  const assignedStudentIdSet = new Set(assignments.map((a) => a.studentId));

  const filteredStudents = allStudents.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const toggleSelect = (studentId: string) => {
    if (assignedStudentIdSet.has(studentId)) return; // already assigned
    if (selectedIds.includes(studentId)) {
      setSelectedIds(selectedIds.filter((id) => id !== studentId));
    } else {
      setSelectedIds([...selectedIds, studentId]);
    }
  };

  const selectAllUnassigned = () => {
    const unassigned = filteredStudents
      .filter((s) => !assignedStudentIdSet.has(s.id))
      .map((s) => s.id);
    setSelectedIds(unassigned);
  };

  const deselectAll = () => {
    setSelectedIds([]);
  };

  const handleAssign = async () => {
    if (selectedIds.length === 0) {
      alert('Please select at least one student to assign.');
      return;
    }

    setIsAssigning(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await api.post<{ message: string; assignedCount: number }>(
        `/quizzes/${quizId}/assign`,
        { studentIds: selectedIds },
      );
      setSuccessMessage(res.message);
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to assign quiz');
    } finally {
      setIsAssigning(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-500">Loading student directory & assignments...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
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
                Assign Quiz to Students
              </h1>
              <Badge variant="primary">{quiz?.title}</Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Select students from your institution directory and distribute this assessment.
            </p>
          </div>
        </div>

        <Link
          href={`/teacher/quizzes/${quizId}/analytics`}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-bold transition"
        >
          <BarChart3 className="w-4 h-4" />
          <span>View Analytics</span>
        </Link>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Student Selection Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-600" />
                  Available Students Directory ({allStudents.length})
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Checkboxes mark new recipients for assignment.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={selectAllUnassigned}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={deselectAll}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Search filter */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search students by name or email..."
                className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
              />
            </div>

            {/* Students List */}
            <div className="divide-y divide-slate-100 max-h-[380px] overflow-y-auto pr-1">
              {filteredStudents.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No matching students found.</p>
              ) : (
                filteredStudents.map((student) => {
                  const isAssigned = assignedStudentIdSet.has(student.id);
                  const isSelected = selectedIds.includes(student.id);

                  return (
                    <div
                      key={student.id}
                      onClick={() => !isAssigned && toggleSelect(student.id)}
                      className={`py-3 px-3 rounded-xl flex items-center justify-between transition cursor-pointer ${
                        isAssigned
                          ? 'bg-slate-50/60 cursor-default opacity-80'
                          : isSelected
                          ? 'bg-indigo-50/60'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-slate-400">
                          {isAssigned ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : isSelected ? (
                            <CheckSquare className="w-4 h-4 text-indigo-600" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-300" />
                          )}
                        </div>

                        <div>
                          <p className="text-xs font-bold text-slate-900">{student.name}</p>
                          <p className="text-[11px] text-slate-500">{student.email}</p>
                        </div>
                      </div>

                      <div>
                        {isAssigned ? (
                          <span className="text-[10px] font-bold text-slate-500 px-2.5 py-0.5 rounded-full bg-slate-200">
                            Already Assigned
                          </span>
                        ) : isSelected ? (
                          <span className="text-[10px] font-bold text-indigo-700 px-2.5 py-0.5 rounded-full bg-indigo-100">
                            Selected
                          </span>
                        ) : null}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Assignment Action */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">
                {selectedIds.length} new student(s) selected
              </span>

              <button
                type="button"
                onClick={handleAssign}
                disabled={isAssigning || selectedIds.length === 0}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition flex items-center gap-2"
              >
                {isAssigning ? (
                  <span>Assigning...</span>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                    <span>Assign Selected Students</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: Current Assignment Status (Completed vs Pending) */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center justify-between">
              <span>Assignment Status</span>
              <span className="text-xs font-medium text-slate-500">
                {assignments.length} assigned
              </span>
            </h2>

            {assignments.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                This quiz has not been assigned to any students yet.
              </p>
            ) : (
              <div className="divide-y divide-slate-100 max-h-[460px] overflow-y-auto pr-1 space-y-1">
                {assignments.map((a) => {
                  const isCompleted = a.status === 'COMPLETED';
                  return (
                    <div key={a.assignmentId} className="pt-3 pb-3 first:pt-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-900">{a.studentName}</p>
                        <Badge variant={isCompleted ? 'success' : 'warning'} size="sm">
                          {isCompleted ? 'Completed' : 'Pending'}
                        </Badge>
                      </div>

                      <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                        <span>{a.studentEmail}</span>
                        {isCompleted && a.attempt && (
                          <span className="font-extrabold text-emerald-600">
                            {a.attempt.score}/{a.totalQuestions} ({a.attempt.accuracy}%)
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
