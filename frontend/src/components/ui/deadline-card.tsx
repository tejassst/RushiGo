import React from 'react';

type Deadline = {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  priority: 'high' | 'medium' | 'low';
  source: string;
  status: 'pending' | 'completed' | 'deleted';
};

type Props = {
  deadline: Deadline;
  onSwipeLeft: (id: number) => void;
  onSwipeRight: (id: number) => void;
  style?: React.CSSProperties;
  key?: React.Key;
};

export const DeadlineCard: React.FC<Props> = ({ deadline, onSwipeLeft, onSwipeRight, style }) => {
  return (
    <div style={style} className="w-80 bg-white rounded-xl shadow p-4">
      <h3 className="font-semibold text-lg mb-1">{deadline.title}</h3>
      <p className="text-sm text-gray-600 mb-2">{deadline.description}</p>
      <div className="text-sm text-gray-500 mb-3">{deadline.date} • {deadline.time}</div>
      <div className="flex gap-2">
        <button onClick={() => onSwipeLeft(deadline.id)} className="px-3 py-1 bg-yellow-100 rounded">Keep</button>
        <button onClick={() => onSwipeRight(deadline.id)} className="px-3 py-1 bg-green-100 rounded">Complete</button>
      </div>
    </div>
  );
};

export default DeadlineCard;
