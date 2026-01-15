
import React, { useState, useEffect } from 'react';
import { Recipe, Step } from '../types';

interface CookingModeProps {
  recipe: Recipe;
  onClose: () => void;
}

const CookingMode: React.FC<CookingModeProps> = ({ recipe, onClose }) => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isActive, setIsActive] = useState(false);

  const currentStep = recipe.steps[currentStepIdx];

  useEffect(() => {
    let timer: any;
    if (isActive && timeLeft !== null && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => (prev !== null ? prev - 1 : 0));
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      // Optional: alert or sound
    }
    return () => clearInterval(timer);
  }, [isActive, timeLeft]);

  const startTimer = (seconds: number) => {
    setTimeLeft(seconds);
    setIsActive(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col p-6 overflow-y-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-bold text-orange-600">Modo Cocina</h2>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
          <i className="fa-solid fa-xmark text-2xl"></i>
        </button>
      </div>

      <div className="mb-4">
        <div className="flex space-x-1 mb-6">
          {recipe.steps.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-1.5 flex-1 rounded-full ${idx <= currentStepIdx ? 'bg-orange-500' : 'bg-slate-200'}`}
            ></div>
          ))}
        </div>
        <p className="text-slate-400 font-medium uppercase text-xs tracking-wider mb-2">Paso {currentStepIdx + 1} de {recipe.steps.length}</p>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <h3 className="text-3xl font-light text-slate-800 leading-tight mb-8">
          {currentStep.description}
        </h3>

        {currentStep.durationSeconds && (
          <div className="bg-orange-50 p-6 rounded-3xl mb-8 flex flex-col items-center">
            <div className="text-5xl font-mono font-bold text-orange-600 mb-4">
              {timeLeft !== null ? formatTime(timeLeft) : formatTime(currentStep.durationSeconds)}
            </div>
            {!isActive ? (
              <button 
                onClick={() => startTimer(timeLeft ?? currentStep.durationSeconds ?? 0)}
                className="bg-orange-500 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-orange-200"
              >
                {timeLeft === 0 ? 'Reiniciar' : 'Iniciar Temporizador'}
              </button>
            ) : (
              <button 
                onClick={() => setIsActive(false)}
                className="bg-slate-500 text-white px-8 py-3 rounded-full font-bold"
              >
                Pausar
              </button>
            )}
          </div>
        )}
      </div>

      <div className="mt-auto pt-8 flex space-x-4">
        <button 
          disabled={currentStepIdx === 0}
          onClick={() => { setCurrentStepIdx(prev => prev - 1); setIsActive(false); setTimeLeft(null); }}
          className="flex-1 py-4 px-6 border border-slate-200 rounded-2xl font-bold text-slate-600 disabled:opacity-30"
        >
          Anterior
        </button>
        <button 
          onClick={() => {
            if (currentStepIdx < recipe.steps.length - 1) {
              setCurrentStepIdx(prev => prev + 1);
              setIsActive(false);
              setTimeLeft(null);
            } else {
              onClose();
            }
          }}
          className="flex-[2] py-4 px-6 bg-orange-600 text-white rounded-2xl font-bold shadow-xl shadow-orange-200"
        >
          {currentStepIdx === recipe.steps.length - 1 ? 'Finalizar' : 'Siguiente'}
        </button>
      </div>
    </div>
  );
};

export default CookingMode;
