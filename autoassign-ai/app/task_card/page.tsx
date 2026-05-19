'use client';

import { useState } from 'react';
import { Task, Priority, TaskStatus } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MoreVertical,
  Calendar,
  Clock,
  Flag,
  CheckCircle2,
  Circle,
  Loader,
} from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
}

const priorityConfig: Record<
  Priority,
  { label: string; color: string; badgeVariant: 'default' | 'destructive' | 'outline' | 'secondary' }
> = {
  LOW: { label: 'Low', color: 'text-blue-600', badgeVariant: 'default' },
  MEDIUM: { label: 'Medium', color: 'text-amber-600', badgeVariant: 'secondary' },
  HIGH: { label: 'High', color: 'text-red-600', badgeVariant: 'destructive' },
};

const statusConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> =
  {
    [TaskStatus.TODO]: { label: 'To Do', icon: <Circle className="w-5 h-5" />, color: 'text-slate-400' },
    [TaskStatus.IN_PROGRESS]: { label: 'In Progress', icon: <Loader className="w-5 h-5" />, color: 'text-blue-600' },
    [TaskStatus.DONE]: { label: 'Done', icon: <CheckCircle2 className="w-5 h-5" />, color: 'text-green-600' },
  }

export default function TaskCard({ task, onUpdate }: TaskCardProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editedTask, setEditedTask] = useState<Task>(task);

  const handleEditClick = () => {
    setEditedTask(task);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    onUpdate(task.id, editedTask);
    setEditDialogOpen(false);
  };

  const handleStatusToggle = () => {
    const nextStatus: Record<TaskStatus, TaskStatus> = {
      [TaskStatus.TODO]: TaskStatus.IN_PROGRESS,
      [TaskStatus.IN_PROGRESS]: TaskStatus.DONE,
      [TaskStatus.DONE]: TaskStatus.TODO,
    };
    onUpdate(task.id, { status: nextStatus[task.status] });
  };

  const formatDate = (dateInput: string | Date): string => {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (hours: number) => {
    if (hours < 1) {
      const minutes = Math.round(hours * 60);
      return `${minutes}m`;
    }
    const wholeHours = Math.floor(hours);
    const mins = Math.round((hours - wholeHours) * 60);
    return mins > 0 ? `${wholeHours}h ${mins}m` : `${wholeHours}h`;
  };

  const getStatusConfig = (status: TaskStatus) => {
    return statusConfig[status] || statusConfig[TaskStatus.TODO];
  };

  const getPriorityConfig = (priority: Priority) => {
    return priorityConfig[priority] || priorityConfig[Priority.LOW];
  };

  return (
    <>
      <div className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3 flex-1">
            <button
              onClick={handleStatusToggle}
              className={`mt-1 ${getStatusConfig(task.status).color} hover:scale-110 transition-transform`}
            >
              {getStatusConfig(task.status).icon}
            </button>
            <div className="flex-1">
              <h4 className={`mb-1 ${task.status === TaskStatus.DONE ? 'line-through text-slate-500' : ''}`}>
                {task.title}
              </h4>
              <p className="text-sm text-slate-600 mb-3">{task.description}</p>

              <div className="flex flex-wrap gap-2">
                <Badge variant={getPriorityConfig(task.priority).badgeVariant}>
                  <Flag className="w-3 h-3 mr-1" />
                  {getPriorityConfig(task.priority).label}
                </Badge>
                <Badge variant="default">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatTime(task.estimatedHours)}
                </Badge>
                <Badge variant="default">
                  <Calendar className="w-3 h-3 mr-1" />
                  {formatDate(task.scheduledDate)}
                </Badge>
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={handleEditClick}>Edit task</DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => {
                  handleStatusToggle();
                }}
              >
                Change status
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>
        <DialogContent className="flex flex-col gap-5 pt-4">
          <div>
            <Label htmlFor={`title-${task.id}`}>Task Title</Label>
            <Input
              id={`title-${task.id}`}
              value={editedTask.title}
              onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor={`desc-${task.id}`}>Description</Label>
            <Input
              id={`desc-${task.id}`}
              value={editedTask.description || ''}
              onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor={`priority-${task.id}`}>Priority</Label>
            <Select
              value={editedTask.priority}
              onValueChange={(value: Priority) =>
                setEditedTask({ ...editedTask, priority: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor={`status-${task.id}`}>Status</Label>
            <Select
              value={editedTask.status}
              onValueChange={(value: TaskStatus) =>
                setEditedTask({ ...editedTask, status: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODO">To Do</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="DONE">Done</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor={`hours-${task.id}`}>Estimated Hours</Label>
            <Input
              id={`hours-${task.id}`}
              type="number"
              step={0.25}
              min={0}
              value={editedTask.estimatedHours}
              onChange={(e) =>
                setEditedTask({
                  ...editedTask,
                  estimatedHours: parseFloat(e.target.value) || 0,
                })
              }
            />
          </div>

          <div>
            <Label htmlFor={`date-${task.id}`}>Scheduled Date</Label>
            <Input
              id={`date-${task.id}`}
              type="date"
              value={typeof editedTask.scheduledDate === 'string' ? editedTask.scheduledDate : editedTask.scheduledDate.toISOString().split('T')[0]}
              onChange={(e) => setEditedTask({ ...editedTask, scheduledDate: e.target.value })}
            />
          </div>
        </DialogContent>
        <DialogFooter>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveEdit}>Save Changes</Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}