import { useEffect, useState } from "react";

type LoadingOverlayProps = {
  text: string;
  onComplete?: () => void;
  duration?: number;
};

export default function LoadingOverlay({ text, onComplete, duration = 800 }: LoadingOverlayProps) {
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index <= text.length) {
        setDisplayText(text.slice(0, index));
        index++;
      } else {
        clearInterval(interval);
        if (onComplete) {
          setTimeout(onComplete, duration);
        }
      }
    }, 80);
    return () => clearInterval(interval);
  }, [text, onComplete, duration]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--background-color)]">
      <span className="text-2xl text-[var(--text-secondary)] font-medium">
        {displayText}
        <span className="animate-pulse">|</span>
      </span>
    </div>
  );
}