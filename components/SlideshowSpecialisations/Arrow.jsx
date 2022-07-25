import React from 'react';

const SampleNextArrow = function SampleNextArrow(props) {
  const { className, style, onClick } = props;
  return (
    <div
      className={className}
      style={{ ...style, display: 'block', background: '#38b2ac', 'border-radius': '2px' }}
      onClick={onClick}
    />
  );
};

const SamplePrevArrow = function SamplePrevArrow(props) {
  const { className, style, onClick } = props;
  return (
    <div
      className={className}
      style={{
        ...style,
        display: 'block',
        background: '#38b2ac',
        'border-radius': '2px'
      }}
      onClick={onClick}
    />
  );
};

export { SampleNextArrow, SamplePrevArrow };
