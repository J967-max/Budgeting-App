import React from 'react';
import type { Envelope } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { MinusIcon } from './icons/MinusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { StarIcon } from './icons/StarIcon';
import { PencilIcon } from './icons/PencilIcon';
import { CalendarIcon } from './icons/CalendarIcon';

interface EnvelopeListItemProps {
  envelope: Envelope;
  onAdd: () => void;
  onSpend: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onToggleFavorite: () => void;
}

const EnvelopeListItem: React.FC<EnvelopeListItemProps> = ({ envelope, onAdd, onSpend, onDelete, onEdit, onToggleFavorite }) => {
  const { name, balance, budget, isFavorite, recurringTransactions } = envelope;

  const percentage = budget > 0 ? (balance / budget) * 100 : 0;
  
  const getProgressBarColor = () => {
    if (percentage > 50) return 'bg-green-500';
    if (percentage > 25) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 flex flex-col sm:flex-row items-center p-4 gap-4 transition-shadow hover:shadow-lg">
      <div className="flex-none">
        <button
            onClick={onToggleFavorite}
            className="text-gray-400 hover:text-yellow-500 transition-colors duration-200"
            aria-label={`Favorite ${name} envelope`}
        >
            <StarIcon className={`h-6 w-6 ${isFavorite ? 'text-yellow-400 fill-current' : ''}`} />
        </button>
      </div>

      <div className="flex-grow w-full">
        <div className="flex justify-between items-baseline gap-2">
            <div className="flex items-center gap-2 truncate">
              <h3 className="text-lg font-bold text-gray-800 truncate">{name}</h3>
              {recurringTransactions && recurringTransactions.length > 0 && (
                  <CalendarIcon className="h-4 w-4 text-gray-400 flex-shrink-0" title="Has recurring bills" />
              )}
            </div>
            <p className="text-lg font-semibold text-blue-600 tracking-tight flex-shrink-0">
                {formatCurrency(balance)}
            </p>
        </div>
        <div className="mt-1.5">
          <div className="bg-gray-200 rounded-full h-2 w-full">
            <div
              className={`h-2 rounded-full ${getProgressBarColor()} transition-all duration-500`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      <div className="flex-none flex items-center gap-2">
        <button
          onClick={onAdd}
          className="p-2 bg-green-100 text-green-800 rounded-full hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all"
          aria-label={`Add to ${name}`}
        >
          <PlusIcon className="h-5 w-5" />
        </button>
        <button
          onClick={onSpend}
          className="p-2 bg-red-100 text-red-800 rounded-full hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all"
           aria-label={`Spend from ${name}`}
        >
          <MinusIcon className="h-5 w-5" />
        </button>
        <button
          onClick={onEdit}
          className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-100 rounded-full transition-colors"
          aria-label={`Edit ${name}`}
        >
          <PencilIcon className="h-5 w-5" />
        </button>
        <button
              onClick={onDelete}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-100 rounded-full transition-colors"
              aria-label={`Delete ${name}`}
            >
              <TrashIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default EnvelopeListItem;