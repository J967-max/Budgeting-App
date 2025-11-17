import React, { useMemo, useState } from 'react';
import type { Envelope } from '../types';
import PieChart from './PieChart';
import { PencilIcon } from './icons/PencilIcon';
import { CheckIcon } from './icons/CheckIcon';
import { XIcon } from './icons/XIcon';

interface BudgetSummaryProps {
  envelopes: Envelope[];
  monthlyBudget: number | null;
  setMonthlyBudget: (value: number | null) => void;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const PIE_CHART_COLORS = [
  '#3b82f6', '#10b981', '#ef4444', '#f97316', '#8b5cf6', '#ec4899',
  '#6366f1', '#f59e0b', '#06b6d4', '#d946ef', '#22c55e', '#e11d48'
];

const BudgetSummary: React.FC<BudgetSummaryProps> = ({ envelopes, monthlyBudget, setMonthlyBudget }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(monthlyBudget?.toString() ?? '');

  const { totalBudget, totalBalance } = useMemo(() => {
    return envelopes.reduce(
      (acc, envelope) => {
        acc.totalBudget += envelope.budget;
        acc.totalBalance += envelope.balance;
        return acc;
      },
      { totalBudget: 0, totalBalance: 0 }
    );
  }, [envelopes]);

  const totalSpent = totalBudget - totalBalance;
  const remainingToBudget = monthlyBudget !== null ? monthlyBudget - totalBudget : null;

  const pieChartData = useMemo(() => {
    const data = envelopes.map((envelope, index) => ({
      name: envelope.name,
      value: envelope.budget,
      color: PIE_CHART_COLORS[index % PIE_CHART_COLORS.length],
    })).filter(item => item.value > 0);

    if (remainingToBudget !== null && remainingToBudget > 0) {
      data.push({
        name: 'Unallocated',
        value: remainingToBudget,
        color: '#9ca3af', // gray-400
      });
    }

    return data;
  }, [envelopes, remainingToBudget]);


  const handleSetBudget = () => {
    const value = parseFloat(inputValue);
    if (!isNaN(value) && value >= 0) {
      setMonthlyBudget(value);
    } else {
      setMonthlyBudget(null);
    }
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setInputValue(monthlyBudget?.toString() ?? '');
    setIsEditing(false);
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-lg border border-gray-200 h-full">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Budget Overview</h2>
      
      <div className="mb-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-600 text-center mb-2">Monthly Budget Goal</h3>
        {isEditing ? (
          <form onSubmit={(e) => { e.preventDefault(); handleSetBudget(); }} className="flex items-center gap-2">
            <span className="text-gray-500 sm:text-lg">$</span>
            <input 
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="block w-full rounded-md border-gray-300 pl-2 pr-2 focus:border-blue-500 focus:ring-blue-500 sm:text-lg font-bold text-center"
              autoFocus
              min="0"
              step="0.01"
              placeholder="3000.00"
            />
            <button type="submit" className="text-green-600 hover:text-green-800 p-1 rounded-full hover:bg-green-100">
                <CheckIcon className="h-5 w-5" />
            </button>
            <button type="button" onClick={handleCancel} className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-100">
                <XIcon className="h-5 w-5" />
            </button>
          </form>
        ) : (
          <div className="text-center group min-h-[44px] flex items-center justify-center">
            {monthlyBudget !== null ? (
              <div className="flex items-center justify-center gap-2 cursor-pointer" onClick={() => { setIsEditing(true); setInputValue(monthlyBudget.toString()); }}>
                <p className="text-3xl font-bold text-gray-800">{formatCurrency(monthlyBudget)}</p>
                <PencilIcon className="h-5 w-5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ) : (
              <button onClick={() => setIsEditing(true)} className="w-full text-center py-2 px-4 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                Set Monthly Budget
              </button>
            )}
          </div>
        )}
        {remainingToBudget !== null && (
             <div className="text-center mt-2 text-sm font-medium">
                {remainingToBudget > 0 && <p className="text-green-600">{formatCurrency(remainingToBudget)} left to budget.</p>}
                {remainingToBudget < 0 && <p className="text-red-600">{formatCurrency(Math.abs(remainingToBudget))} over-budgeted.</p>}
                {remainingToBudget === 0 && <p className="text-gray-600">All funds have been budgeted!</p>}
            </div>
        )}
      </div>

      <div className="flex flex-col gap-4 mb-8">
        <div className="p-4 bg-blue-50 rounded-lg text-center">
          <p className="text-sm font-medium text-blue-600">Total Budgeted</p>
          <p className="text-2xl font-bold text-blue-800">{formatCurrency(totalBudget)}</p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg text-center">
          <p className="text-sm font-medium text-green-600">Total Remaining</p>
          <p className="text-2xl font-bold text-green-800">{formatCurrency(totalBalance)}</p>
        </div>
        <div className="p-4 bg-yellow-50 rounded-lg text-center">
          <p className="text-sm font-medium text-yellow-600">Total Spent</p>
          <p className="text-2xl font-bold text-yellow-800">{formatCurrency(totalSpent)}</p>
        </div>
      </div>
      
      {pieChartData.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">Budget Allocation</h3>
          <div className="flex flex-col items-center justify-center gap-6">
              <div className="w-full max-w-[250px] mx-auto">
                <PieChart data={pieChartData} />
              </div>
              <div className="w-full">
                <ul className="space-y-2">
                  {pieChartData.map((item) => (
                    <li key={item.name} className="flex items-center text-sm">
                      <span className="inline-block w-4 h-4 rounded-full mr-3" style={{ backgroundColor: item.color }}></span>
                      <span className="font-medium text-gray-700 truncate" title={item.name}>{item.name}:</span>
                      <span className="ml-auto text-gray-600 pl-2">{formatCurrency(item.value)}</span>
                    </li>
                  ))}
                </ul>
              </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetSummary;