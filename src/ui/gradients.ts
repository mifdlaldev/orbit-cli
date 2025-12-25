/**
 * Gradient Definitions
 */

import gradient from 'gradient-string';

// Define the gradient function type explicitly
type GradientFn = {
  (text: string): string;
  multiline: (text: string) => string;
};

// Primary brand gradient (nebula - multicolor)
export const nebula: GradientFn = gradient([
  '#8B5CF6', // Violet
  '#6366F1', // Indigo
  '#3B82F6', // Blue
  '#22D3EE', // Cyan
]);

// Simplified brand gradient (cosmic)
export const cosmic: GradientFn = gradient(['#8B5CF6', '#6366F1']);

// Success gradient (aurora)
export const aurora: GradientFn = gradient(['#10B981', '#14B8A6', '#22D3EE']);

// Error gradient (supernova)
export const supernova: GradientFn = gradient(['#EF4444', '#F97316']);

// Info gradient (stellar)
export const stellar: GradientFn = gradient(['#6366F1', '#8B5CF6']);

// Export all gradients
export const gradients: Record<string, GradientFn> = {
  nebula,
  cosmic,
  aurora,
  supernova,
  stellar,
};
