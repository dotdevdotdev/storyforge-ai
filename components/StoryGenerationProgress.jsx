import React from 'react';
import LoadingSpinner from './LoadingSpinner';

const StoryGenerationProgress = ({ stage }) => {
  const stages = [
    { key: 'analyzing', message: 'Analyzing story parameters...' },
    { key: 'planning', message: 'Planning story structure...' },
    { key: 'writing', message: 'Crafting your story...' },
    { key: 'refining', message: 'Refining and polishing...' }
  ];

  const currentStageIndex = stages.findIndex(s => s.key === stage);
  
  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-semibold mb-4">Generating Your Story</h3>
      
      <div className="space-y-4">
        {stages.map((s, index) => (
          <div key={s.key} className="flex items-center">
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2 
              ${index <= currentStageIndex ? 'border-primary bg-primary/10' : 'border-gray-300'}`}>
              {index < currentStageIndex ? (
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              ) : index === currentStageIndex ? (
                <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
              ) : (
                <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
              )}
            </div>
            <div className={`ml-4 ${index <= currentStageIndex ? 'text-gray-900' : 'text-gray-500'}`}>
              {s.message}
            </div>
          </div>
        ))}
      </div>

      {stage === 'writing' && (
        <div className="mt-6">
          <LoadingSpinner message="Writing your masterpiece..." />
        </div>
      )}
    </div>
  );
};

export default StoryGenerationProgress;
