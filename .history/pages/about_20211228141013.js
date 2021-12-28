import React from 'react'
import { Header } from '../components/Header';


export default function about( {header} ) {
    return (
        <div className='cover'>
            <Header
                title={header.title}
                image={header.image}
            />
            <img
            className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
            src="https://images.pexels.com/photos/5473182/pexels-photo-5473182.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260"
            alt=""
        />
        </div>
    )
}
