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
      <ChevronRightIcon className="text-white  cursor-pointer absolute -right-11 top-56 h-11 w-11 hover:text-gray-200" />
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
      <ChevronLeftIcon className="text-white absolute cursor-pointer -left-11 top-56 h-11 w-11 hover:text-gray-200" />
    </div>
  );
};

export { SampleNextArrow, SamplePrevArrow };
