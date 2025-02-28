import { useState } from 'react';
import { Workout } from '../types';

export function MyWorkouts() {
  const [workouts] = useState<Workout[]>([]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Meus Treinos</h1>
      {workouts.length === 0 ? (
        <div className="text-center text-gray-500 mt-8">
          <p>Você ainda não adicionou nenhum treino.</p>
          <p>Explore a aba Treinos para começar!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {workouts.map((workout) => (
            <div
              key={workout.id}
              className="bg-white rounded-lg shadow p-4"
            >
              <h2 className="text-xl font-semibold">{workout.title}</h2>
              <p className="text-gray-600">{workout.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}