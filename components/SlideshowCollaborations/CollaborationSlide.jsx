import Image from 'next/legacy/image';
import { motion } from 'framer-motion';
import { useState } from 'react';

const CollaborationSlide = ({ url, description }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Prevent rendering if url is undefined
  if (!url) {
    console.warn('CollaborationSlide received undefined url prop');
    return null;
  }

  return (
    <div className="mt-5 lg:mt-12 flex flex-col flex-wrap justify-center lg:flex-row mb-24 lg:mb-6 h-full">
      <motion.div
        className={`relative bg-white p-4 mx-auto bg-cover rounded-lg shadow-xl justify-between transition-all duration-300 ${isHovered ? 'shadow-2xl' : ''}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        whileHover={{ scale: 1.05 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Image
          width={200}
          height={100}
          className="object-contain"
          src={url}
          alt={description || 'Collaboration logo'}
        />
        {description && (
          <motion.div
            className="mt-2 text-center text-gray-600 text-sm opacity-0"
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {description}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default CollaborationSlide;
