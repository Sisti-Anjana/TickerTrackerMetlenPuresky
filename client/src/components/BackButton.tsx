import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import '../styles/back-button.css';

interface BackButtonProps {
  label?: string;
  to?: string;
  className?: string;
  onClick?: () => void;
}

const BackButton: React.FC<BackButtonProps> = ({ 
  label = 'Back', 
  to,
  className = '',
  onClick
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onClick) {
      onClick();
    } else if (to) {
      navigate(to);
    } else {
      navigate(-1); // Go to previous page in browser history
    }
  };

  return (
    <button 
      onClick={handleBack} 
      className={`back-button ${className}`}
      type="button"
    >
      <ArrowLeft size={18} />
      <span>{label}</span>
    </button>
  );
};

export default BackButton;

