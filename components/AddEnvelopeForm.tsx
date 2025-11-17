
import React, { useState, useMemo } from 'react';

interface AddEnvelopeFormProps {
  onAddEnvelope: (name: string, budget: number) => void;
  prefilledEnvelopes: { name: string; budget: number }[];
  existingEnvelopeNames: Set<string>;
}

const AddEnvelopeForm: React.FC<AddEnvelopeFormProps> = ({ onAddEnvelope, prefilledEnvelopes, existingEnvelopeNames }) => {
  const [name, setName] = useState('');
  const [budget, setBudget] = useState('');
  const [isDropdownOpen, setDropdownOpen] = useState(false);

  const filteredSuggestions = useMemo(() => {
    const searchInput = name.toLowerCase();
    return prefilledEnvelopes.filter(p =>
      !existingEnvelopeNames.has(p.name.toLowerCase()) &&
      p.name.toLowerCase().includes(searchInput)
    );
  }, [name, prefilledEnvelopes, existingEnvelopeNames]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const budgetAmount = parseFloat(budget);
    if (name.trim() && !isNaN(budgetAmount) && budgetAmount > 0) {
      onAddEnvelope(name.trim(), budgetAmount);
      setName('');
      setBudget('');
    } else {
      alert("Please enter a valid name and a positive budget amount.");
    }
  };

  const handleSuggestionClick = (suggestion: { name: string; budget: number }) => {
    setName(suggestion.name);
    setBudget(suggestion.budget.toString());
    setDropdownOpen(false);
  };

  return (
    <form onSubmit={handleSubmit} className="grid sm:grid-cols-1 md:grid-cols-3 gap-4 items-end">
      <div className="md:col-span-1 relative">
        <label htmlFor="envelope-name" className="block text-sm font-medium text-gray-700">
          Category Name
        </label>
        <input
          type="text"
          id="envelope-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onFocus={() => setDropdownOpen(true)}
          onBlur={() => setTimeout(() => setDropdownOpen(false), 100)} // delay to allow click
          placeholder="Search categories or type a new one"
          className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          required
          autoComplete="off"
        />
        {isDropdownOpen && filteredSuggestions.length > 0 && (
          <ul
            className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
            onMouseDown={(e) => e.preventDefault()} // Prevents onBlur from firing on the input
          >
            {filteredSuggestions.map((suggestion) => (
              <li
                key={suggestion.name}
                className="px-4 py-2 text-gray-700 hover:bg-blue-50 cursor-pointer"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion.name}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="md:col-span-1">
        <label htmlFor="budget-amount" className="block text-sm font-medium text-gray-700">
          Budget Amount
        </label>
        <div className="relative mt-1">
           <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="text-gray-400 sm:text-sm">$</span>
           </div>
            <input
              type="number"
              id="budget-amount"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="0.00"
              className="block w-full rounded-md border-gray-600 bg-gray-800 text-white placeholder-gray-400 pl-7 pr-3 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              min="0.01"
              step="0.01"
              required
            />
        </div>
      </div>
      <div className="md:col-span-1">
        <button
          type="submit"
          className="w-full justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
        >
          Add Envelope
        </button>
      </div>
    </form>
  );
};

export default AddEnvelopeForm;