// TimerContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const TimerContext = createContext();

export const TimerProvider = ({ children }) => {
  const [seconds, setSeconds] = useState(() => {
    return parseInt(localStorage.getItem('timerSeconds')) || 0;
  });
  const [isActive, setIsActive] = useState(() => {
    return localStorage.getItem('isActive') === 'true' || false;
  });
  const [ifClockedIn, setIfClockedIn] = useState(() => {
    return localStorage.getItem('clockedIn') === 'true' || false;
  });

  // Timer logic
  useEffect(() => {
    let interval;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds(prev => {
          const newSeconds = prev + 1;
          localStorage.setItem('timerSeconds', newSeconds);
          return newSeconds;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  // Persist state changes
  useEffect(() => {
    localStorage.setItem('clockedIn', ifClockedIn);
    localStorage.setItem('isActive', isActive);
  }, [ifClockedIn, isActive]);

  return (
    <TimerContext.Provider 
      value={{ 
        seconds, 
        setSeconds,
        isActive, 
        setIsActive,
        ifClockedIn,
        setIfClockedIn
      }}
    >
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = () => useContext(TimerContext);