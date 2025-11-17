import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Envelope, TransactionType, RecurringTransaction } from './types';
import Header from './components/Header';
import EnvelopeCard from './components/EnvelopeCard';
import EnvelopeListItem from './components/EnvelopeListItem';
import AddEnvelopeForm from './components/AddEnvelopeForm';
import TransactionModal from './components/TransactionModal';
import ConfirmationModal from './components/ConfirmationModal';
import EditEnvelopeModal from './components/EditEnvelopeModal';
import BudgetSummary from './components/BudgetSummary';
import { CurrencyIcon } from './components/icons/CurrencyIcon';
import { GridIcon } from './components/icons/GridIcon';
import { ListIcon } from './components/icons/ListIcon';
import { RefreshIcon } from './components/icons/RefreshIcon';
import { StarIcon } from './components/icons/StarIcon';

type ViewMode = 'card' | 'list';

const PREFILLED_ENVELOPES = [
  { name: 'Car Insurance', budget: 120 },
  { name: 'Car Maintenance', budget: 50 },
  { name: 'Coffee Shops', budget: 40 },
  { name: 'Credit Card Payment', budget: 150 },
  { name: 'Dining Out', budget: 200 },
  { name: 'Emergency Fund', budget: 100 },
  { name: 'Entertainment', budget: 100 },
  { name: 'Fitness/Gym', budget: 40 },
  { name: 'Gas/Fuel', budget: 150 },
  { name: 'Gifts', budget: 50 },
  { name: 'Groceries', budget: 400 },
  { name: 'Health Insurance', budget: 300 },
  { name: 'Hobbies', budget: 50 },
  { name: 'Home Maintenance', budget: 100 },
  { name: 'Internet', budget: 60 },
  { name: 'Investments', budget: 200 },
  { name: 'Medication/Pharmacy', budget: 50 },
  { name: 'Personal Care', budget: 50 },
  { name: 'Pet Care', budget: 75 },
  { name: 'Phone Bill', budget: 80 },
  { name: 'Public Transit', budget: 50 },
  { name: 'Rent/Mortgage', budget: 1500 },
  { name: 'Savings', budget: 250 },
  { name: 'Shopping (Clothing, etc)', budget: 150 },
  { name: 'Student Loans', budget: 200 },
  { name: 'Subscriptions', budget: 30 },
  { name: 'Utilities', budget: 200 },
].sort((a, b) => a.name.localeCompare(b.name));


const App: React.FC = () => {
  const [envelopes, setEnvelopes] = useLocalStorage<Envelope[]>('envelopes', []);
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    envelope: Envelope | null;
    type: TransactionType | null;
  }>({ isOpen: false, envelope: null, type: null });
  const [editModalState, setEditModalState] = useState<{
    isOpen: boolean;
    envelope: Envelope | null;
  }>({ isOpen: false, envelope: null });
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useLocalStorage<ViewMode>('viewMode', 'card');
  const [isNewMonthConfirmOpen, setNewMonthConfirmOpen] = useState(false);
  const [deleteConfirmState, setDeleteConfirmState] = useState<{
    isOpen: boolean;
    envelopeId: string | null;
  }>({ isOpen: false, envelopeId: null });
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [monthlyBudget, setMonthlyBudget] = useLocalStorage<number | null>('monthlyBudget', null);

  useEffect(() => {
    const today = new Date();
    const currentMonthYear = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

    const envelopesToUpdate = envelopes.filter(env => 
        env.recurringTransactions && 
        env.recurringTransactions.length > 0 && 
        env.lastProcessed !== currentMonthYear
    );

    if (envelopesToUpdate.length > 0) {
        setEnvelopes(prevEnvelopes => 
            prevEnvelopes.map(env => {
                const needsUpdate = envelopesToUpdate.some(e => e.id === env.id);
                if (needsUpdate && env.recurringTransactions) {
                    const totalDeductions = env.recurringTransactions.reduce((sum, tx) => sum + tx.amount, 0);
                    return {
                        ...env,
                        balance: Math.max(0, env.balance - totalDeductions),
                        lastProcessed: currentMonthYear,
                    };
                }
                return env;
            })
        );
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only on initial mount


  const handleAddEnvelope = useCallback((name: string, budget: number) => {
    if (envelopes.some(env => env.name.toLowerCase() === name.toLowerCase())) {
      alert(`An envelope named "${name}" already exists.`);
      return;
    }
    const newEnvelope: Envelope = {
      id: crypto.randomUUID(),
      name,
      budget,
      balance: budget,
      isFavorite: false,
      recurringTransactions: [],
    };
    setEnvelopes(prev => [...prev, newEnvelope]);
  }, [setEnvelopes, envelopes]);

  const handleOpenModal = useCallback((envelope: Envelope, type: TransactionType) => {
    setModalState({ isOpen: true, envelope, type });
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalState({ isOpen: false, envelope: null, type: null });
  }, []);

  const handleTransaction = useCallback((amount: number) => {
    if (!modalState.envelope || !modalState.type) return;
    setEnvelopes(prevEnvelopes =>
      prevEnvelopes.map(env => {
        if (env.id === modalState.envelope?.id) {
          const newBalance =
            modalState.type === 'add' ? env.balance + amount : env.balance - amount;
          return { ...env, balance: Math.max(0, newBalance) };
        }
        return env;
      })
    );
    handleCloseModal();
  }, [modalState, setEnvelopes, handleCloseModal]);
  
  const handleRequestDelete = useCallback((id: string) => {
    setDeleteConfirmState({ isOpen: true, envelopeId: id });
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (!deleteConfirmState.envelopeId) return;
    setEnvelopes(prev => prev.filter(env => env.id !== deleteConfirmState.envelopeId));
  }, [deleteConfirmState.envelopeId, setEnvelopes]);

  const handleCancelDelete = useCallback(() => {
    setDeleteConfirmState({ isOpen: false, envelopeId: null });
  }, []);

  const handleOpenEditModal = useCallback((envelope: Envelope) => {
    setEditModalState({ isOpen: true, envelope });
  }, []);

  const handleCloseEditModal = useCallback(() => {
    setEditModalState({ isOpen: false, envelope: null });
  }, []);

  const handleUpdateEnvelope = useCallback((id: string, name: string, budget: number) => {
    if (envelopes.some(env => env.id !== id && env.name.toLowerCase() === name.toLowerCase())) {
        alert(`An envelope named "${name}" already exists.`);
        return;
    }
    setEnvelopes(prev =>
        prev.map(env => {
            if (env.id === id) {
                const oldBudget = env.budget;
                const balanceRatio = oldBudget > 0 ? env.balance / oldBudget : 1;
                const newBalance = Math.round(budget * balanceRatio * 100) / 100;
                return {
                    ...env,
                    name,
                    budget,
                    balance: Math.min(newBalance, budget),
                };
            }
            return env;
        })
    );
    handleCloseEditModal();
  }, [envelopes, setEnvelopes, handleCloseEditModal]);

  const handleAddRecurringTransaction = useCallback((envelopeId: string, transaction: Omit<RecurringTransaction, 'id'>) => {
    setEnvelopes(prev => prev.map(env => {
        if (env.id === envelopeId) {
            const newTransaction: RecurringTransaction = { ...transaction, id: crypto.randomUUID() };
            const updatedTransactions = [...(env.recurringTransactions || []), newTransaction];
            return { ...env, recurringTransactions: updatedTransactions };
        }
        return env;
    }));
  }, [setEnvelopes]);

  const handleDeleteRecurringTransaction = useCallback((envelopeId: string, transactionId: string) => {
      setEnvelopes(prev => prev.map(env => {
          if (env.id === envelopeId) {
              const updatedTransactions = (env.recurringTransactions || []).filter(tx => tx.id !== transactionId);
              return { ...env, recurringTransactions: updatedTransactions };
          }
          return env;
      }));
  }, [setEnvelopes]);


  const handleToggleFavorite = useCallback((id: string) => {
    setEnvelopes(prev =>
      prev.map(env =>
        env.id === id ? { ...env, isFavorite: !env.isFavorite } : env
      )
    );
  }, [setEnvelopes]);

  const handleStartNewMonth = useCallback(() => {
    setEnvelopes(prev =>
      prev.map(env => ({
        ...env,
        balance: env.budget,
      }))
    );
  }, [setEnvelopes]);

  const existingEnvelopeNames = useMemo(() => 
    new Set(envelopes.map(env => env.name.toLowerCase())), 
    [envelopes]
  );

  const displayedEnvelopes = useMemo(() => {
    return envelopes
      .filter(env => {
        const matchesFavorite = !showOnlyFavorites || env.isFavorite;
        const matchesSearch = env.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFavorite && matchesSearch;
      })
      .sort((a, b) => {
        if (a.isFavorite && !b.isFavorite) return -1;
        if (!a.isFavorite && b.isFavorite) return 1;
        return a.name.localeCompare(b.name);
      });
  }, [envelopes, searchQuery, showOnlyFavorites]);

  const hasFilters = searchQuery || showOnlyFavorites;

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <div className="p-6 bg-white rounded-2xl shadow-lg border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Create New Envelope</h2>
            <AddEnvelopeForm 
              onAddEnvelope={handleAddEnvelope} 
              prefilledEnvelopes={PREFILLED_ENVELOPES}
              existingEnvelopeNames={existingEnvelopeNames}
            />
          </div>

          <div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
              <h2 className="text-2xl font-bold text-gray-800">Your Envelopes</h2>
              <div className="flex items-center gap-4 flex-wrap">
                  <button
                      onClick={() => setNewMonthConfirmOpen(true)}
                      className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                      <RefreshIcon className="h-4 w-4" />
                      <span>Start New Month</span>
                  </button>
                  <div className="relative flex-grow md:flex-grow-0">
                      <input
                          type="text"
                          placeholder="Search..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="block w-full md:w-32 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                  </div>
                  <button
                      onClick={() => setShowOnlyFavorites(prev => !prev)}
                      className={`p-2 rounded-md transition-colors ${showOnlyFavorites ? 'bg-yellow-100 text-yellow-500 shadow' : 'text-gray-600 hover:bg-gray-200'}`}
                      aria-label="Show only favorites"
                  >
                      <StarIcon className={`h-5 w-5 ${showOnlyFavorites ? 'fill-current' : ''}`} />
                  </button>
                  <div className="flex items-center bg-gray-200 rounded-lg p-1">
                      <button onClick={() => setViewMode('card')} className={`p-2 rounded-md transition-colors ${viewMode === 'card' ? 'bg-white text-blue-600 shadow' : 'text-gray-600 hover:bg-gray-300'}`} aria-label="Card View">
                          <GridIcon className="h-5 w-5"/>
                      </button>
                      <button onClick={() => setViewMode('list')} className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white text-blue-600 shadow' : 'text-gray-600 hover:bg-gray-300'}`} aria-label="List View">
                          <ListIcon className="h-5 w-5"/>
                      </button>
                  </div>
              </div>
            </div>
            {displayedEnvelopes.length === 0 ? (
              <div className="text-center py-16 px-6 bg-white rounded-2xl shadow-lg border border-gray-200">
                <CurrencyIcon className="mx-auto h-16 w-16 text-blue-400" />
                <h3 className="mt-4 text-xl font-semibold text-gray-700">
                  {envelopes.length === 0 ? "No Envelopes Yet" : "No Envelopes Found"}
                </h3>
                <p className="mt-2 text-gray-500">
                  {envelopes.length === 0 ? (
                    "Create your first budget envelope above to get started."
                  ) : hasFilters ? (
                    <>
                      Try adjusting your search or filters.{" "}
                      <button 
                        onClick={() => { setSearchQuery(''); setShowOnlyFavorites(false); }} 
                        className="text-blue-600 hover:underline"
                      >
                        Clear filters
                      </button>
                    </>
                  ) : ""}
                </p>
              </div>
            ) : (
              <>
                {viewMode === 'card' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {displayedEnvelopes.map(envelope => (
                      <EnvelopeCard
                        key={envelope.id}
                        envelope={envelope}
                        onAdd={() => handleOpenModal(envelope, 'add')}
                        onSpend={() => handleOpenModal(envelope, 'spend')}
                        onDelete={() => handleRequestDelete(envelope.id)}
                        onEdit={() => handleOpenEditModal(envelope)}
                        onToggleFavorite={() => handleToggleFavorite(envelope.id)}
                      />
                    ))}
                  </div>
                ) : (
                   <div className="space-y-3">
                      {displayedEnvelopes.map(envelope => (
                          <EnvelopeListItem
                              key={envelope.id}
                              envelope={envelope}
                              onAdd={() => handleOpenModal(envelope, 'add')}
                              onSpend={() => handleOpenModal(envelope, 'spend')}
                              onDelete={() => handleRequestDelete(envelope.id)}
                              onEdit={() => handleOpenEditModal(envelope)}
                              onToggleFavorite={() => handleToggleFavorite(envelope.id)}
                          />
                      ))}
                   </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-1 lg:sticky lg:top-8">
          <BudgetSummary envelopes={envelopes} monthlyBudget={monthlyBudget} setMonthlyBudget={setMonthlyBudget} />
        </aside>
      </main>

      {/* Modals */}
      <TransactionModal
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        onSubmit={handleTransaction}
        envelope={modalState.envelope}
        type={modalState.type}
      />
      <EditEnvelopeModal
        isOpen={editModalState.isOpen}
        onClose={handleCloseEditModal}
        onSubmit={handleUpdateEnvelope}
        envelope={editModalState.envelope}
        onAddRecurring={handleAddRecurringTransaction}
        onDeleteRecurring={handleDeleteRecurringTransaction}
      />
      <ConfirmationModal
        isOpen={isNewMonthConfirmOpen}
        onClose={() => setNewMonthConfirmOpen(false)}
        onConfirm={handleStartNewMonth}
        title="Start New Month?"
        message="This will reset the balance of all your envelopes to their budgeted amounts. This action cannot be undone."
      />
      <ConfirmationModal
        isOpen={deleteConfirmState.isOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Envelope?"
        message="Are you sure you want to permanently delete this envelope? This action cannot be undone."
      />
    </div>
  );
};

export default App;