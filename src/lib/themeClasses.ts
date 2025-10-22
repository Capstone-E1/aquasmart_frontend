// Theme utility classes for consistent dark/light mode styling

export const themeClasses = {
  // Background classes
  bg: {
    primary: 'bg-primary dark:bg-primary light:bg-slate-200',
    secondary: 'bg-primary-light dark:bg-primary-light light:bg-white',
    card: 'bg-primary-light/50 dark:bg-primary-light/50 light:bg-white',
    cardHover: 'hover:bg-slate-700/20 dark:hover:bg-slate-700/20 light:hover:bg-slate-100',
  },
  
  // Text classes
  text: {
    primary: 'text-white dark:text-white light:text-slate-800',
    secondary: 'text-slate-400 dark:text-slate-400 light:text-slate-600',
    muted: 'text-slate-500 dark:text-slate-500 light:text-slate-500',
  },
  
  // Border classes
  border: {
    default: 'border-slate-600 dark:border-slate-600 light:border-slate-300',
    light: 'border-slate-700 dark:border-slate-700 light:border-slate-200',
  },
  
  // Button classes
  button: {
    primary: 'bg-blue-600 dark:bg-blue-600 light:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-700 light:hover:bg-blue-600',
    secondary: 'bg-slate-700 dark:bg-slate-700 light:bg-slate-200 hover:bg-slate-600 dark:hover:bg-slate-600 light:hover:bg-slate-300',
  },
};