import React from 'react';

export function LinkifyText({ text }: { text: string }) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);

  return (
    <span className="whitespace-pre-wrap break-words leading-relaxed">
      {parts.map((part, i) => {
        if (part.match(urlRegex)) {
          const display = part.length > 20 ? part.substring(0, 20) + '...' : part;
          return (
            <a 
              key={i} 
              href={part} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-primary hover:text-primary/80 underline decoration-primary/30 underline-offset-2 transition-colors inline-flex items-center"
              onClick={(e) => e.stopPropagation()}
            >
              {display}
            </a>
          );
        }
        return <React.Fragment key={i}>{part}</React.Fragment>;
      })}
    </span>
  );
}
