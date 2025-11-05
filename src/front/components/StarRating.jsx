// COMPONENT: StarRating
// Interactive star voting system (1-5)
// Used for voting on routes

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
            fill={isFilled ? "#FFC106" : "none"}
            stroke={isFilled ? "#FFC106" : "#6c757d"}
            strokeWidth={isFilled ? 0 : 2}
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
          {rating} {rating === 1 ? 'star' : 'stars'}
        </span>
      )}
    </div>
  );
};

export default StarRating;