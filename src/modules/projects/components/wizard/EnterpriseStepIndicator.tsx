interface Step {
  id: string;
  label: string;
  component: React.ComponentType;
}

interface EnterpriseStepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export function EnterpriseStepIndicator({ steps, currentStep }: EnterpriseStepIndicatorProps) {
  const progressPercentage = ((currentStep - 1) / (steps.length - 1)) * 100;
  
  return (
    <div className="flex items-center justify-between">
      {/* Compact Step Pills */}
      <div className="flex items-center space-x-3">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;
          
          return (
            <div 
              key={step.id} 
              className={`
                flex items-center px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300
                ${isActive 
                  ? 'bg-gray-900 text-white' 
                  : isCompleted 
                    ? 'bg-gray-100 text-gray-700 border border-gray-200' 
                    : 'bg-white text-gray-400 border border-gray-200'
                }
              `}
            >
              <span className="w-4 h-4 rounded-full flex items-center justify-center text-xs mr-2">
                {isCompleted ? (
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  stepNumber
                )}
              </span>
              <span>{step.label}</span>
            </div>
          );
        })}
      </div>
      
      {/* Simple Progress Info */}
      <div className="flex items-center text-xs text-gray-500">
        <span className="font-medium text-gray-700">Paso {currentStep}</span>
        <span className="mx-1">/</span>
        <span>{steps.length}</span>
        <div className="ml-3 w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gray-900 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <span className="ml-2 text-gray-600">{Math.round(progressPercentage)}%</span>
      </div>
    </div>
  );
}