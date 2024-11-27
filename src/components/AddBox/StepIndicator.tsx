interface StepIndicatorProps {
    currentStep: number;
    totalSteps: number;
  }
  
  export const StepIndicator = ({ currentStep, totalSteps }: StepIndicatorProps) => {
    return (
      <div className="flex items-center justify-center space-x-2 mb-6">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div
            key={index}
            className={`h-2 w-2 rounded-full transition-all ${
              index + 1 <= currentStep ? 'bg-primary' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };