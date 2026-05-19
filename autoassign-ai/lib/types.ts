// Enums matching Prisma schema
export enum AssignmentStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

export enum Priority {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

// Type definitions matching Prisma schema
export interface Task {
  id: string;
  assignmentId: string;
  title: string;
  description: string | null;
  priority: Priority;
  estimatedHours: number;
  scheduledDate: Date | string;
  status: TaskStatus;
  calendarEventId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Assignment {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  deadline: Date | string;
  course: string | null;
  status: AssignmentStatus;
  tasks: Task[];
  aiGenerated?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  name: string | null;
  email: string | null;
  emailVerified: Date | null;
  image: string | null;
  createdAt: Date;
}
