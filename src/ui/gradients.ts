/**
 * Gradient Definitions
 */

import gradient from 'gradient-string';

// Define the gradient function type explicitly
type GradientFn = {
  (text: string): string;
  multiline: (text: string) => string;
};

// Brand gradients with explicit type annotations
export const nebula: GradientFn = gradient(['#8B5CF6', '#6366F1', '#22D3EE']);
export const cosmic: GradientFn = gradient(['#EC4899', '#8B5CF6', '#6366F1']);
export const aurora: GradientFn = gradient(['#10B981', '#22D3EE', '#6366F1']);

// Export object with explicit type
export const gradients: Record<string, GradientFn> = {
  nebula,
  cosmic,
  aurora,
};
