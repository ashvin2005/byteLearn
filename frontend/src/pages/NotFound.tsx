// import React from 'react';
import FuzzyText from '../../src/components/FuzzyText';

const NotFound = () => {
  return (
    <div className='h-screen w-full flex items-center justify-center p-12  font-medium'>
      <FuzzyText 
        baseIntensity={0.25} 
        hoverIntensity={0.7} 
        // enableHover={enableHover}
      >
          404 - Page Not Found
      </FuzzyText>
    </div>
  );
};

export default NotFound;

