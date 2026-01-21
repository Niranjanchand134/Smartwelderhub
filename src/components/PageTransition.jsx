import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * PageTransition Component
 * 
 * Provides a smooth fade transition when navigating between pages.
 * Prevents flash by maintaining content visibility during transitions.
 */
const PageTransition = ({ children }) => {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState('entering');

  useEffect(() => {
    if (location.pathname !== displayLocation.pathname) {
      setTransitionStage('exiting');
      
      // After fade out, update location and fade in
      const timer = setTimeout(() => {
        setDisplayLocation(location);
        setTransitionStage('entering');
      }, 200); // Match CSS transition duration

      return () => clearTimeout(timer);
    } else {
      setTransitionStage('entering');
    }
  }, [location, displayLocation]);

  return (
    <div 
      key={displayLocation.pathname}
      className={`page-transition page-transition-${transitionStage}`}
    >
      {children}
    </div>
  );
};

export default PageTransition;
