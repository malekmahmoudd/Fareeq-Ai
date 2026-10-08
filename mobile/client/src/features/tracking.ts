export interface Goal { id: string; title: string; detail: string; priority: number; status: 'active' | 'done' | 'paused'; target_date: string | null }
export interface Plan { id: string; agent_id: string; title: string; status: 'active' | 'done' | 'archived'; goal_id: string | null; done: number; steps: { id: string; position: number; text: string; due_on: string | null; done: boolean }[] }
export function targetDate(input: string): string | null {
  if (!input.trim()) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input)) throw new Error('Use YYYY-MM-DD for the target date.');
  const date = new Date(`${input}T12:00:00Z`);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== input) throw new Error('Enter a valid calendar date.');
  return date.toISOString();
}
