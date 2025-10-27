'use client';

import { Progress } from '@/components/ui/progress';

interface ChecklistItem {
  id: string;
  label: string;
  deadline: string;
  completed: boolean;
}

interface ChecklistProgressProps {
  items: ChecklistItem[];
  onToggleItem: (itemId: string) => void;
}

function formatDDMM(d: string) {
  if (!d) return '';
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return d;
  const day = String(dt.getDate()).padStart(2, '0');
  const month = String(dt.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}`;
}

export function ChecklistProgress({ items, onToggleItem }: ChecklistProgressProps) {
  const completedItems = items.filter((item) => item.completed).length;
  const progressPercentage = (completedItems / items.length) * 100;

  return (
    <div className="space-y-6">
      {/* Interactive Checklist */}
      <div className="rounded-2xl border border-neutral-200 p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold">
          My club checklist!
        </h3>
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <button
                onClick={() => onToggleItem(item.id)}
                className={`h-6 w-6 rounded-full border-2 transition-all ${
                  item.completed
                    ? 'bg-red-900 border-red-900'
                    : 'border-neutral-300 hover:border-red-400'
                }`}
              >
                {item.completed && (
                  <div className="h-full w-full rounded-full bg-primary flex items-center justify-center">
                    <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </button>
              <span className={`text-sm transition-all ${
                item.completed
                  ? 'text-neutral-500 line-through'
                  : 'text-neutral-600'
              }`}>
                {item.label} : <span className="text-sm text-primary font-extrabold">{formatDDMM(item.deadline)}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Progress Display */}
      <div className="rounded-2xl border border-neutral-200 p-6 shadow-sm">
        <div className="mb-6 text-center">
          <div className="relative mx-auto h-32 w-32">
            <svg className="h-full w-full -rotate-90 transform">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                className="text-gray-light"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * 56}`}
                strokeDashoffset={`${2 * Math.PI * 56 * (1 - progressPercentage / 100)}`}
                className="text-primary transition-all duration-500 ease-in-out"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {Math.round(progressPercentage)}%
                </div>
              </div>
            </div>
          </div>
          <p className="mt-4 text-sm font-medium text-gray-extradark">
            You have made {Math.round(progressPercentage)}% progress!
          </p>
          <div className="mt-4">
            <Progress 
              value={progressPercentage} 
              className="h-2 bg-neutral-200" 
            />
            <p className="mt-2 text-xs text-neutral-500">
              {completedItems} of {items.length} clubs completed
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export type { ChecklistItem };