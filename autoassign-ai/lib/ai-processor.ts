// lib/ai-processor.ts

import { openai } from './openai';
import { prisma } from './prisma';
import type { Assignment, Task } from '.prisma/client';

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

interface AITask {
  title: string;
  description: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  estimatedHours: number;
  scheduledDate: string;
  order: number;
}

interface AIResponse {
  tasks: AITask[];
  summary: string;
}

// ─────────────────────────────────────────
// Build the prompt
// ─────────────────────────────────────────

function buildPrompt(assignment: Assignment): string {
  const today = new Date().toISOString().split('T')[0];
  const deadline = new Date(assignment.deadline).toISOString().split('T')[0];

  return `
You are an academic task planner helping a student complete an assignment on time.

ASSIGNMENT DETAILS:
- Title: ${assignment.title}
- Course: ${assignment.course || 'Not specified'}
- Description: ${assignment.description || 'Not specified'}
- Deadline: ${deadline}
- Today's Date: ${today}

YOUR JOB:
Break this assignment into clear, actionable subtasks that the student can follow day by day.

RULES:
1. Each task must take between 0.5 and 3 hours maximum
2. Spread tasks across the available days before the deadline
3. Schedule earlier tasks as HIGH priority, later ones as MEDIUM or LOW
4. The last task should always be "Review and Submit" on the deadline day
5. scheduledDate must be between today (${today}) and the deadline (${deadline})
6. Return ONLY a valid JSON object — no explanation, no markdown, no extra text

RETURN THIS EXACT JSON SHAPE:
{
  "summary": "One sentence overview of the plan",
  "tasks": [
    {
      "title": "string",
      "description": "string — what exactly the student should do",
      "priority": "HIGH" | "MEDIUM" | "LOW",
      "estimatedHours": number,
      "scheduledDate": "YYYY-MM-DD",
      "order": number starting from 1
    }
  ]
}
  `.trim();
}

// ─────────────────────────────────────────
// Call GPT-4o-mini and parse response
// ─────────────────────────────────────────

async function callAI(prompt: string): Promise<AIResponse> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 1500,
    temperature: 0.7,
    messages: [
      {
        role: 'system',
        content:
          'You are an academic task planner. Always respond with valid JSON only. Never include markdown or explanation.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const raw = response.choices[0].message.content || '';

  // Strip markdown code blocks if model adds them anyway
  const cleaned = raw
    .replace(/```json/g, '')
    .replace(/```/g, '')
    .trim();

  try {
    return JSON.parse(cleaned) as AIResponse;
  } catch (err) {
    console.error('Failed to parse AI response:', cleaned);
    throw new Error('AI returned invalid JSON');
  }
}

// ─────────────────────────────────────────
// Validate AI output before saving
// ─────────────────────────────────────────

function validateTasks(tasks: AITask[], deadline: Date): AITask[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return tasks.filter((task) => {
    const scheduled = new Date(task.scheduledDate);

    // Must have a title
    if (!task.title) return false;

    // scheduledDate must be valid
    if (isNaN(scheduled.getTime())) return false;

    // Must not be in the past
    if (scheduled < today) return false;

    // Must not be after deadline
    if (scheduled > deadline) return false;

    // estimatedHours must be a positive number
    if (!task.estimatedHours || task.estimatedHours <= 0) return false;

    return true;
  });
}

// ─────────────────────────────────────────
// Main function — called from webhook + /api/ai/process
// ─────────────────────────────────────────

export async function processAssignment(
  assignment: Assignment
): Promise<Task[]> {
  console.log(`🤖 AI processing assignment: ${assignment.title}`);

  // 1. Build prompt
  const prompt = buildPrompt(assignment);

  // 2. Call GPT-4o-mini (retry once on failure)
  let aiResponse: AIResponse;
  try {
    aiResponse = await callAI(prompt);
  } catch (err) {
    console.warn('First AI attempt failed, retrying...');
    aiResponse = await callAI(prompt); // retry once
  }

  // 3. Validate tasks
  const validTasks = validateTasks(aiResponse.tasks, assignment.deadline);

  if (validTasks.length === 0) {
    throw new Error('AI returned no valid tasks');
  }

  console.log(`✅ AI generated ${validTasks.length} valid tasks`);

  // 4. Save tasks to database
  const savedTasks = await prisma.$transaction(
    validTasks.map((task) =>
      prisma.task.create({
        data: {
          assignmentId: assignment.id,
          title: task.title,
          description: task.description,
          priority: task.priority,
          estimatedHours: task.estimatedHours,
          scheduledDate: new Date(task.scheduledDate),
          status: 'TODO',
        },
      })
    )
  );

  // 5. Update assignment status to IN_PROGRESS
  await prisma.assignment.update({
    where: { id: assignment.id },
    data: { status: 'IN_PROGRESS' },
  });

  console.log(`💾 Saved ${savedTasks.length} tasks to database`);

  return savedTasks;
}