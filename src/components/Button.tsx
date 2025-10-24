interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md' 
}: ButtonProps) {
  const baseClasses = 'font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-4 cursor-pointer';
  
  const variantClasses = {
    primary: 'bg-accent hover:bg-accent-hover text-white border border-transparent hover:border-accent-light focus:ring-accent/50',
    secondary: 'bg-gray-700 hover:bg-gray-600 text-white border border-gray-600 hover:border-gray-500 focus:ring-gray-500/50'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-5 py-3 text-base',
    lg: 'px-6 py-4 text-lg'
  };
  
  const className = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`;
  
  return (
    <button className={className} onClick={onClick}>
      {children}
    </button>
  );
}
