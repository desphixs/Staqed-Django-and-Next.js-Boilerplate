// This little utility is a "secret weapon" in modern React development. It solves a specific problem: 
// Tailwind CSS conflicts. Usually, if you try to apply two different padding classes to the same element, 
// CSS might not pick the one you expect. This function makes sure the "last one wins" and allows you to turn classes on and off easily.

// ------------------------------
// We import 'clsx', which is a tiny utility that lets us construct class names conditionally.
// For example, it lets us say: "Apply the 'text-red-500' class ONLY if the 'hasError' variable is true."
// 'ClassValue' is just a TypeScript type that tells the editor what kind of data (strings, objects, arrays) this function can accept.
import { clsx, type ClassValue } from "clsx"

// We import 'twMerge' from 'tailwind-merge'. This is the most important part of the logic.
// Tailwind classes can conflict (like having 'px-2' and 'px-4' on the same div). 
// 'twMerge' intelligently looks at the string and makes sure the last class provided is the one that actually gets applied.
import { twMerge } from "tailwind-merge"

/**
 * This function 'cn' stands for 'Class Name'. 
 * It takes in any number of arguments (...inputs) which can be strings, objects, or even arrays of classes.
 */
export function cn(...inputs: ClassValue[]) {
  // STEP 1: 'clsx(inputs)' runs first. It takes all your logic (like conditional classes) 
  // and turns them into one long, clean string of text.
  
  // STEP 2: 'twMerge' takes that string and "cleans it up." 
  // If you accidentally passed in 'bg-blue-500' and 'bg-red-500', it sees the conflict 
  // and keeps only the most recent one so your styles don't break.
  
  // Finally, it returns the perfectly optimized string of class names to your component.
  return twMerge(clsx(inputs))
}