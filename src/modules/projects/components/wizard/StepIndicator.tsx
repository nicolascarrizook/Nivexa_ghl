interface Step {
  id: string;
  label: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < currentStep;
        const isCurrent = stepNumber === currentStep;
        const isLast = index === steps.length - 1;

        return (
          <div key={step.id} className="flex items-center flex-1">
            {/* Step Circle */}
            <div className="flex items-center">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  transition-all duration-300 relative
                  ${isCompleted || isCurrent
                    ? 'bg-gray-100 text-white  -500/30' 
                    : 'bg-gray-800 text-gray-400 border border-gray-700'
                  }
                  ${isCurrent ? 'ring-2 ring-red-500/50 ring-offset-2 ring-offset-gray-900' : ''}
                `}
              >
                {isCompleted ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="text-sm font-medium">{stepNumber}</span>
                )}
              </div>
              
              {/* Step Label */}
              <div className="ml-3 hidden md:block">
                <p className={`
                  text-sm font-normal transition-colors duration-300
                  ${isCurrent ? 'text-primary' : isCompleted ? 'text-secondary' : 'text-tertiary'}
                `}>
                  {step.label}
                </p>
              </div>
            </div>

            {/* Connector Line */}
            {!isLast && (
              <div className="flex-1 mx-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className={`
                      h-0.5 w-full transition-all duration-500
                      ${isCompleted ? 'bg-gray-100' : 'bg-gray-700'}
                    `} />
                  </div>
                  {isCompleted && (
                    <div 
                      className="absolute inset-0 flex items-center"
                      style={{
                        animation: 'slideRight 0.5s ease-out forwards'
                      }}
                    >
                      <div className="h-0.5 w-full bg-gradient-to-r from-red-500 to-red-400" />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}

      <style jsx>{`
        @keyframes slideRight {
          from {
            transform: scaleX(0);
            transform-origin: left;
          }
          to {
            transform: scaleX(1);
            transform-origin: left;
          }
        }
      `}</style>
    </div>
  );
}