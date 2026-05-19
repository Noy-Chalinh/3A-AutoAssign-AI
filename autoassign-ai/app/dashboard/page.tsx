'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Assignment, AssignmentStatus } from '@/lib/types';
import { BookOpen, Calendar, CheckCircle2, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const statusConfig: Record<AssignmentStatus, { label: string; color: 'default' | 'primary' | 'success' | 'error' }> = {
  'PENDING': { label: 'Not Started', color: 'default' },
  'IN_PROGRESS': { label: 'In Progress', color: 'primary' },
  'DONE': { label: 'Completed', color: 'success' }
};

const getStatusIcon = (status: AssignmentStatus) => {
  switch (status) {
    case 'DONE':
      return <CheckCircle2 className="w-4 h-4" />;
    case 'IN_PROGRESS':
      return <Clock className="w-4 h-4" />;
    default:
      return null;
  }
};

export default function DashboardPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<AssignmentStatus | 'all'>('all');

  useEffect(() => {
    fetch('/api/assignments')
      .then(r => r.json())
      .then(data => {
        setAssignments(data.assignments ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredAssignments = filter === 'all'
    ? assignments
    : assignments.filter(a => a.status === filter);

  const stats = {
    total: assignments.length,
    inProgress: assignments.filter(a => a.status === 'IN_PROGRESS').length,
    pending: assignments.filter(a => a.status === 'PENDING').length,
    done: assignments.filter(a => a.status === 'DONE').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="h-8 w-64 bg-slate-200 rounded animate-pulse mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-lg shadow p-6 h-24 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-slate-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-lg shadow p-6 h-32 animate-pulse">
                <div className="h-6 bg-slate-200 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (assignments.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="mb-8">My Assignments</h1>
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <p className="text-slate-500 mb-2">No assignments yet</p>
            <p className="text-sm text-slate-400">Your assignments from Google Classroom will appear here</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="mb-2">My Assignments</h1>
          <p className="text-slate-600">Track and manage your coursework</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <p className="text-sm text-slate-600 mb-1">Total Assignments</p>
            <p className="text-3xl">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-amber-500">
            <p className="text-sm text-slate-600 mb-1">In Progress</p>
            <p className="text-3xl">{stats.inProgress}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <p className="text-sm text-slate-600 mb-1">Completed</p>
            <p className="text-3xl">{stats.done}</p>
          </div>
        </div>

        <div className="mb-6 flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-slate-700 hover:bg-slate-100'
            }`}
          >
            All
          </button>
          {Object.entries(statusConfig).map(([status, config]) => (
            <button
              key={status}
              onClick={() => setFilter(status as AssignmentStatus)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-100'
              }`}
            >
              {config.label}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filteredAssignments.map(assignment => {
            const completedTasks = assignment.tasks.filter(t => t.status === 'DONE').length;
            const progress = assignment.tasks.length > 0
              ? (completedTasks / assignment.tasks.length) * 100
              : 0;
            const deadline = new Date(assignment.deadline);
            const today = new Date();
            const daysUntilDue = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

            return (
              <Link
                key={assignment.id}
                href={`/assignment_detail/${assignment.id}`}
                className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="mb-1">{assignment.title}</h3>
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {assignment.course}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Due {deadline.toLocaleDateString()}
                        {daysUntilDue <= 3 && daysUntilDue > 0 && (
                          <span className="text-amber-600">({daysUntilDue}d left)</span>
                        )}
                      </span>
                    </div>
                  </div>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {getStatusIcon(assignment.status)}
                    {statusConfig[assignment.status].label}
                  </Badge>
                </div>

                <p className="text-sm text-slate-600 mb-4 line-clamp-2">{assignment.description}</p>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">
                      {completedTasks} of {assignment.tasks.length} tasks completed
                    </span>
                    <span className="text-slate-900">{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100">
                  <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    AI-Generated Task Breakdown
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
