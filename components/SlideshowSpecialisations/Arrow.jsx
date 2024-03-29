import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/solid';

const SampleNextArrow = function SampleNextArrow(props) {
  const { style, onClick } = props;
  return (
    <div
      className="slick-arrow"
      onClick={onClick}
      style={{
        ...style
      }}
    >
      <ChevronRightIcon className="text-gray-600 cursor-pointer absolute -right-11 top-56 h-11 w-11 hover:text-gray-500" />
    </div>
  );
};

const SamplePrevArrow = function SamplePrevArrow(props) {
  const { style, onClick } = props;
  return (
    <div
      className="slick-arrow"
      onClick={onClick}
      style={{
        ...style
      }}
    >
      <ChevronLeftIcon className="text-gray-600 absolute cursor-pointer -left-11 top-56 h-11 w-11 hover:text-gray-500" />
    </div>
  );
};

export { SampleNextArrow, SamplePrevArrow };
