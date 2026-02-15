import clsx from 'clsx';
import { getMethodColor } from '../../utils/formatters';

interface MethodBadgeProps {
  method: string;
  size?: 'sm' | 'md';
}

export function MethodBadge({ method, size = 'md' }: MethodBadgeProps) {
  const sizeClasses = size === 'sm' ? 'px-1.5 py-0.5 text-xs' : 'px-2 py-1 text-sm';
  
  return (
    <span
      className={clsx(
        'rounded font-semibold uppercase',
        getMethodColor(method),
        sizeClasses
      )}
    >
      {method}
    </span>
  );
}
