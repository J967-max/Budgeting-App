import React, { useState, useEffect } from 'react';
import type { Envelope, RecurringTransaction } from '../types';
import { TrashIcon } from './icons/TrashIcon';

interface EditEnvelopeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, name: string, budget: number) => void;
  envelope: Envelope | null;
  onAddRecurring: (envelopeId: string, transaction: Omit<RecurringTransaction, 'id'>) => void;
  onDeleteRecurring: (envelopeId: string, transactionId: string) => void;
}

const EditEnvelopeModal: React.FC<EditEnvelopeModalProps> = ({ isOpen, onClose, onSubmit, envelope, onAddRecurring, onDeleteRecurring }) => {
  const [name, setName] = useState('');
  const [budget, setBudget] = useState('');
  
  const [billName, setBillName] = useState('');
  const [billAmount, setBillAmount] = useState('');
  const [billDay, setBillDay] = useState('');

  useEffect(() => {
    if (envelope) {
      setName(envelope.name);
      setBudget(envelope.budget.toString());
    } else {
      setName('');
      setBudget('');
    }
  }, [envelope]);

  if (!isOpen || !envelope) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const budgetAmount = parseFloat(budget);
    if (name.trim() && !isNaN(budgetAmount) && budgetAmount >= 0) {
      onSubmit(envelope.id, name.trim(), budgetAmount);
    } else {
      alert("Please enter a valid name and a non-negative budget amount.");
    }
  };

  const handleAddBill = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(billAmount);
    const day = parseInt(billDay, 10);
    if (billName.trim() && !isNaN(amount) && amount > 0 && !isNaN(day) && day >= 1 && day <= 31) {
      onAddRecurring(envelope.id, { name: billName.trim(), amount, dayOfMonth: day });
      setBillName('');
      setBillAmount('');
      setBillDay('');
    } else {
      alert('Please enter a valid bill name, positive amount, and a day between 1 and 31.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg transform transition-all" onClick={e => e.stopPropagation()}>
        <div className="p-8 max-h-[90vh] overflow-y-auto">
          <h2 className="text-2xl font-bold text-gray-900">Edit Envelope</h2>
          <p className="mt-2 text-gray-600">Update the details for "{envelope.name}".</p>
          
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="edit-envelope-name" className="block text-sm font-medium text-gray-700">
                Category Name
              </label>
              <input
                type="text"
                id="edit-envelope-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="edit-budget-amount" className="block text-sm font-medium text-gray-700">
                Budget Amount
              </label>
              <div className="relative mt-1">
                 <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500 sm:text-sm">$</span>
                 </div>
                  <input
                    type="number"
                    id="edit-budget-amount"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="block w-full rounded-md border-gray-300 pl-7 pr-3 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="100.00"
                    min="0"
                    step="0.01"
                    required
                  />
              </div>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                type="submit"
                className="px-6 py-2 text-sm font-medium text-white rounded-lg bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </form>

          <div className="mt-6 border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-800">Recurring Monthly Bills</h3>
            <div className="mt-2 space-y-2 max-h-40 overflow-y-auto pr-2">
              {(envelope.recurringTransactions || []).length === 0 ? (
                <p className="text-sm text-gray-500">No recurring bills for this envelope.</p>
              ) : (
                (envelope.recurringTransactions || []).map(tx => (
                  <div key={tx.id} className="flex justify-between items-center bg-gray-50 p-2 rounded-md border">
                      <div>
                          <p className="font-semibold text-gray-700">{tx.name}</p>
                          <p className="text-sm text-gray-500">
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(tx.amount)} on day {tx.dayOfMonth}
                          </p>
                      </div>
                      <button 
                        onClick={() => onDeleteRecurring(envelope.id, tx.id)}
                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-full"
                        aria-label={`Delete ${tx.name} bill`}
                      >
                          <TrashIcon className="h-5 w-5" />
                      </button>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleAddBill} className="mt-4 pt-4 border-t">
              <h4 className="text-md font-medium text-gray-700 mb-2">Add New Bill</h4>
              <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
                <div className="md:col-span-3">
                  <label htmlFor="bill-name" className="block text-sm font-medium text-gray-600">Name</label>
                  <input type="text" id="bill-name" value={billName} onChange={e => setBillName(e.target.value)} placeholder="e.g., Netflix" className="mt-1 block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" required />
                </div>
                <div className="md:col-span-1">
                  <label htmlFor="bill-amount" className="block text-sm font-medium text-gray-600">Amount</label>
                  <input type="number" id="bill-amount" value={billAmount} onChange={e => setBillAmount(e.target.value)} placeholder="15.99" min="0.01" step="0.01" className="mt-1 block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" required />
                </div>
                <div className="md:col-span-1">
                  <label htmlFor="bill-day" className="block text-sm font-medium text-gray-600">Day</label>
                  <input type="number" id="bill-day" value={billDay} onChange={e => setBillDay(e.target.value)} placeholder="15" min="1" max="31" className="mt-1 block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" required />
                </div>
                <div className="md:col-span-1">
                  <button type="submit" className="w-full justify-center py-2 px-3 text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                    Add
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditEnvelopeModal;