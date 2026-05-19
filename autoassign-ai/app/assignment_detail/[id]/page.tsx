'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Assignment, Task } from '@/lib/types';
import TaskCard from '@/components/TaskCard';
import { ArrowLeft, BookOpen, Calendar, Sparkles, Clock, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export default function AssignmentDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/assignments/${id}`)
      .then(r => r.json())
      .then(data => {
        setAssignment(data.assignment ?? null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleTaskUpdate = useCallback(async (taskId: string, updates: Partial<Task>) => {
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (res.ok) {
      const data = await res.json();
      setAssignment(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          tasks: prev.tasks.map(t => t.id === taskId ? { ...t, ...data.task } : t),
        };
      });
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="h-10 w-32 bg-slate-200 rounded animate-pulse mb-6"></div>
          <div className="bg-white rounded-lg shadow p-8 mb-6">
            <div className="h-8 w-3/4 bg-slate-200 rounded animate-pulse mb-4"></div>
            <div className="h-4 w-1/2 bg-slate-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-2/3 bg-slate-200 rounded animate-pulse"></div>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-lg border p-4 h-32 animate-pulse">
                <div className="h-5 w-3/4 bg-slate-200 rounded mb-2"></div>
                <div className="h-4 w-full bg-slate-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6">
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </Link>
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-slate-500">Assignment not found</p>
          </div>
        </div>
      </div>
    );
  }

  const completedTasks = assignment.tasks.filter(t => t.status === 'DONE').length;
  const inProgressTasks = assignment.tasks.filter(t => t.status === 'IN_PROGRESS').length;
  const progress = assignment.tasks.length > 0
    ? (completedTasks / assignment.tasks.length) * 100
    : 0;
  const totalEstimatedHours = assignment.tasks.reduce((sum, task) => sum + task.estimatedHours, 0);
  const completedHours = assignment.tasks
    .filter(t => t.status === 'DONE')
    .reduce((sum, task) => sum + task.estimatedHours, 0);

  const formatTime = (hours: number) => {
    if (hours < 1) {
      const minutes = Math.round(hours * 60);
      return `${minutes}m`;
    }
    const wholeHours = Math.floor(hours);
    const mins = Math.round((hours - wholeHours) * 60);
    return mins > 0 ? `${wholeHours}h ${mins}m` : `${wholeHours}h`;
  };

  const deadline = new Date(assignment.deadline);
  const today = new Date();
  const daysUntilDue = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6">
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </Link>

        <div className="bg-white rounded-lg shadow p-8 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="mb-3">{assignment.title}</h1>
              <div className="flex items-center gap-4 text-slate-600 mb-4">
                <span className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  {assignment.course}
                </span>
                <span className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Due {deadline.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </div>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Sparkles className="w-4 h-4" />
              AI-Generated
            </Badge>
          </div>

          <p className="text-slate-700 mb-6">{assignment.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-slate-600 mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm">Progress</span>
              </div>
              <p className="text-2xl">{Math.round(progress)}%</p>
              <p className="text-sm text-slate-600">
                {completedTasks} of {assignment.tasks.length} tasks
              </p>
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-slate-600 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Time Remaining</span>
              </div>
              <p className="text-2xl">{formatTime(totalEstimatedHours - completedHours)}</p>
              <p className="text-sm text-slate-600">
                of {formatTime(totalEstimatedHours)} total
              </p>
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-slate-600 mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Time Until Due</span>
              </div>
              <p className={`text-2xl ${daysUntilDue <= 3 ? 'text-red-600' : ''}`}>
                {daysUntilDue > 0 ? `${daysUntilDue} days` : 'Overdue'}
              </p>
              <p className="text-sm text-slate-600">
                {daysUntilDue <= 3 && daysUntilDue > 0 ? 'Due soon!' : ''}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-slate-600">Overall Progress</span>
              <span className="text-slate-900">{completedTasks} / {assignment.tasks.length} completed</span>
            </div>
            <Progress value={progress} className="h-2 rounded-full" />
          </div>
        </div>

        <div className="mb-4">
          <h2 className="mb-2">Task Breakdown</h2>
          <p className="text-sm text-slate-600 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            This assignment has been automatically broken down into manageable tasks by AI
          </p>
        </div>

        {inProgressTasks > 0 && (
          <div className="mb-6">
            <h3 className="text-sm uppercase tracking-wide text-slate-500 mb-3">In Progress</h3>
            <div className="space-y-3">
              {assignment.tasks
                .filter(t => t.status === 'IN_PROGRESS')
                .map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onUpdate={handleTaskUpdate}
                  />
                ))}
            </div>
          </div>
        )}

        <div className="mb-6">
          <h3 className="text-sm uppercase tracking-wide text-slate-500 mb-3">Pending Tasks</h3>
          {assignment.tasks.filter(t => t.status === 'TODO').length === 0 ? (
            <p className="text-sm text-slate-500 italic">No pending tasks</p>
          ) : (
            <div className="space-y-3">
              {assignment.tasks
                .filter(t => t.status === 'TODO')
                .map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onUpdate={handleTaskUpdate}
                  />
                ))}
            </div>
          )}
        </div>

        {completedTasks > 0 && (
          <div>
            <h3 className="text-sm uppercase tracking-wide text-slate-500 mb-3">Completed</h3>
            <div className="space-y-3">
              {assignment.tasks
                .filter(t => t.status === 'DONE')
                .map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onUpdate={handleTaskUpdate}
                  />
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
