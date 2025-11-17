
import React, { useState, useEffect } from 'react';
import type { Envelope, TransactionType } from '../types';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (amount: number) => void;
  envelope: Envelope | null;
  type: TransactionType | null;
}

const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, onSubmit, envelope, type }) => {
  const [amount, setAmount] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setAmount('');
    }
  }, [isOpen]);

  if (!isOpen || !envelope || !type) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const transactionAmount = parseFloat(amount);
    if (!isNaN(transactionAmount) && transactionAmount > 0) {
      onSubmit(transactionAmount);
    } else {
      alert("Please enter a valid positive amount.");
    }
  };
  
  const title = type === 'add' ? 'Add Money' : 'Spend Money';
  const description = type === 'add' ? `How much are you adding to "${envelope.name}"?` : `How much did you spend from "${envelope.name}"?`;
  const buttonColor = type === 'add' ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' : 'bg-red-600 hover:bg-red-700 focus:ring-red-500';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all" onClick={e => e.stopPropagation()}>
        <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <p className="mt-2 text-gray-600">{description}</p>
          
          <form onSubmit={handleSubmit} className="mt-6">
            <div>
              <label htmlFor="transaction-amount" className="block text-sm font-medium text-gray-700">
                Amount
              </label>
              <div className="relative mt-1">
                 <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500 sm:text-sm">$</span>
                 </div>
                  <input
                    type="number"
                    id="transaction-amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="block w-full rounded-md border-gray-300 pl-7 pr-3 focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-lg py-2"
                    placeholder="50.00"
                    min="0.01"
                    step="0.01"
                    required
                    autoFocus
                  />
              </div>
            </div>
            <div className="mt-8 flex justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-6 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${buttonColor}`}
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TransactionModal;
