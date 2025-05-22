// useOnce.js – guard a hook so its body executes only once even in StrictMode
import { useEffect, useRef } from 'react';

export default function useOnce(effect: () => void, deps: any[] = []) {
  const effectRef = useRef(effect);
  const ran = useRef(false);
  
  // Update the effect ref when the effect changes
  useEffect(() => {
    effectRef.current = effect;
  }, [effect]);
  
  // Run the effect only once per deps change
  useEffect(() => {
    ran.current = false;
  }, deps);
  
  // Execute the effect only once
  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    return effectRef.current();
  }, [ran.current, ...deps]);
}
