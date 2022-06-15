import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/fontawesome-svg-core';

const SlideshowArrow = ({ className, to, onClick }) => {
  return (
    <div>
      <button
        type="button"
        onClick={onClick}
        className={`button button--text button--icon ${className}`}
        aria-label={to}
      >
        <FontAwesomeIcon icon="fa-solid fa-chevron-left" ic={to} />
      </button>
    </div>
  );
};

export default SlideshowArrow;
