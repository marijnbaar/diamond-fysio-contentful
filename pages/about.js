import React from 'react';
// import Menu from '../components/Menu';

export default function about() {
  return (
    <div className="cover">
      {/* <Menu /> */}
      <img
        className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-[82vh]"
        src="https://images.pexels.com/photos/5473182/pexels-photo-5473182.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260"
        alt=""
      />
      <div className="relative bg-white rounded p-4 w-9/12 lg:h-80 z-20 lg:bottom-32 mx-auto">
        <h1 className="font-Euclid text-4xl">Hi</h1>
      </div>
    </div>
  );
}
