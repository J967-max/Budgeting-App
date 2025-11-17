import React from 'react';
import type { Envelope } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { MinusIcon } from './icons/MinusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { StarIcon } from './icons/StarIcon';
import { PencilIcon } from './icons/PencilIcon';
import { CalendarIcon } from './icons/CalendarIcon';

interface EnvelopeCardProps {
  envelope: Envelope;
  onAdd: () => void;
  onSpend: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onToggleFavorite: () => void;
}

const EnvelopeCard: React.FC<EnvelopeCardProps> = ({ envelope, onAdd, onSpend, onDelete, onEdit, onToggleFavorite }) => {
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
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 flex flex-col transition-transform duration-300 hover:scale-105 hover:shadow-xl">
      <div className="p-6 flex-grow">
        <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
                <button
                    onClick={onToggleFavorite}
                    className="text-gray-400 hover:text-yellow-500 transition-colors duration-200 flex-shrink-0"
                    aria-label={`Favorite ${name} envelope`}
                >
                    <StarIcon className={`h-6 w-6 ${isFavorite ? 'text-yellow-400 fill-current' : ''}`} />
                </button>
                <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-gray-800">{name}</h3>
                    {recurringTransactions && recurringTransactions.length > 0 && (
                        <CalendarIcon className="h-4 w-4 text-gray-400" title="Has recurring bills" />
                    )}
                </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onEdit}
                className="text-gray-400 hover:text-blue-500 transition-colors duration-200"
                aria-label={`Edit ${name} envelope`}
              >
                <PencilIcon className="h-5 w-5" />
              </button>
              <button
                onClick={onDelete}
                className="text-gray-400 hover:text-red-500 transition-colors duration-200"
                aria-label={`Delete ${name} envelope`}
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
        </div>
        <p className="text-3xl font-extrabold text-blue-600 mt-2 tracking-tight">
          {formatCurrency(balance)}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Remaining of {formatCurrency(budget)}
        </p>
        
        <div className="mt-4">
          <div className="bg-gray-200 rounded-full h-3 w-full">
            <div
              className={`h-3 rounded-full ${getProgressBarColor()} transition-all duration-500`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 p-4 grid grid-cols-2 gap-3 border-t border-gray-200">
        <button
          onClick={onAdd}
          className="flex items-center justify-center px-4 py-2 bg-green-100 text-green-800 font-semibold rounded-lg hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add
        </button>
        <button
          onClick={onSpend}
          className="flex items-center justify-center px-4 py-2 bg-red-100 text-red-800 font-semibold rounded-lg hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
        >
          <MinusIcon className="h-5 w-5 mr-2" />
          Spend
        </button>
      </div>
    </div>
  );
};

export default EnvelopeCard;