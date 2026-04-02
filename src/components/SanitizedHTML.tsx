import React from 'react';
import DOMPurify from 'dompurify';

interface SanitizedHTMLProps {
  html: string;
  className?: string;
}

const SanitizedHTML: React.FC<SanitizedHTMLProps> = ({ html, className }) => {
  const sanitizedContent = DOMPurify.sanitize(html);
  
  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }} 
    />
  );
};

export default SanitizedHTML;