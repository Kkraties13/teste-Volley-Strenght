import { useState } from 'react';
import { Workout, VolleyPosition } from '../types';

const positions: { id: VolleyPosition; label: string }[] = [
  { id: 'libero', label: 'Líbero' },
  { id: 'setter', label: 'Levantador' },
  { id: 'outsideHitter', label: 'Ponteiro Passador' },
  { id: 'oppositeHitter', label: 'Ponteiro de Definição' },
  { id: 'middleBlocker', label: 'Central' },
  { id: 'rightSideHitter', label: 'Oposto' }
];

export function Workouts() {
  const [selectedPosition, setSelectedPosition] = useState<VolleyPosition | null>(null);
  const [workouts] = useState<Workout[]>([]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Treinos</h1>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Selecione sua posição:</h2>
        <div className="grid grid-cols-2 gap-2">
          {positions.map((position) => (
            <button
              key={position.id}
              className={`p-3 rounded-lg text-center transition-colors ${
                selectedPosition === position.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
              onClick={() => setSelectedPosition(position.id)}
            >
              {position.label}
            </button>
          ))}
        </div>
      </div>

      {selectedPosition && (
        <div className="space-y-4">
          {workouts
            .filter((w) => w.position === selectedPosition)
            .map((workout) => (
              <div
                key={workout.id}
                className="bg-white rounded-lg shadow p-4"
              >
                <h3 className="text-xl font-semibold">{workout.title}</h3>
                <p className="text-gray-600 mt-2">{workout.description}</p>
                <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Adicionar aos Meus Treinos
                </button>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}