import { cn } from '../lib/utils';

interface CardProps {
  title: string;
  description: string;
  children?: React.ReactNode;
  className?: string;
}

export function Card({ title, description, children, className }: CardProps) {
  return (
    <div className={cn(
      "bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700",
      "p-6 transition-all duration-200 hover:shadow-xl hover:-translate-y-1",
      className
    )}>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-300 mb-4">
        {description}
      </p>
      {children}
    </div>
  );
}
