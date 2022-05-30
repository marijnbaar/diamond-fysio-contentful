import React from 'react';
function TeampageHeader({ title, description }) {
  console.log(description);
  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto py-12 px-4 text-center sm:px-6 lg:px-8 lg:mt-24">
        <div className="space-y-12">
          <div className="space-y-5 sm:mx-auto sm:max-w-xl sm:space-y-4 lg:max-w-5xl">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{title && title}</h2>
            <p className="text-xl text-gray-500">{description && description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeampageHeader;
