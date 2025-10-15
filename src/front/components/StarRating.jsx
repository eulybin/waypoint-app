// COMPONENTE: StarRating
// Sistema de votación con estrellas interactivas (1-5)
// Se usa para votar por rutas

import { useState } from "react";
import { Star } from "lucide-react";

const StarRating = ({ initialRating = 0, onRatingChange, disabled = false }) => {
  const [rating, setRating] = useState(initialRating);
  const [hoverRating, setHoverRating] = useState(0);

  const handleClick = (value) => {
    if (!disabled) {
      setRating(value);
      if (onRatingChange) {
        onRatingChange(value);
      }
    }
  };

  const handleMouseEnter = (value) => {
    if (!disabled) {
      setHoverRating(value);
    }
  };

  const handleMouseLeave = () => {
    if (!disabled) {
      setHoverRating(0);
    }
  };

  return (
    <div className="d-flex gap-1">
      {[1, 2, 3, 4, 5].map((value) => {
        const isFilled = (hoverRating || rating) >= value;
        
        return (
          <Star
            key={value}
            size={28}
            className={`${disabled ? 'cursor-default' : 'cursor-pointer'} transition`}
            fill={isFilled ? "currentColor" : "none"}
            color={isFilled ? "#ffc107" : "#6c757d"}
            onClick={() => handleClick(value)}
            onMouseEnter={() => handleMouseEnter(value)}
            onMouseLeave={handleMouseLeave}
            style={{ 
              cursor: disabled ? 'default' : 'pointer',
              transition: 'all 0.2s ease'
            }}
          />
        );
      })}
      {rating > 0 && (
        <span className="ms-2 text-muted small align-self-center">
          {rating} {rating === 1 ? 'estrella' : 'estrellas'}
        </span>
      )}
    </div>
  );
};

export default StarRating;