
import React, { useState } from 'react';

interface FlashcardProps {
  term: string;
  definition: string;
}

const Flashcard: React.FC<FlashcardProps> = ({ term, definition }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className="w-full h-64 perspective-1000 cursor-pointer"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div
        className={`relative w-full h-full transform-style-3d transition-transform duration-700 ${isFlipped ? 'rotate-y-180' : ''}`}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front of the card */}
        <div className="absolute w-full h-full backface-hidden bg-white border border-gray-200 rounded-lg flex items-center justify-center p-4 shadow-lg">
          <h3 className="text-2xl font-bold text-center text-gray-900">{term}</h3>
        </div>

        {/* Back of the card */}
        <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-blue-600 border border-blue-500 rounded-lg flex items-center justify-center p-4 shadow-lg">
          <p className="text-lg text-center text-white">{definition}</p>
        </div>
      </div>
    </div>
  );
};

export default Flashcard;