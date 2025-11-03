import React from 'react';

interface HistoryListProps {
  history: string[];
  onSelect: (ip: string) => void;
  onClear: () => void;
  isLoading: boolean;
}

const HistoryList: React.FC<HistoryListProps> = ({ history, onSelect, onClear, isLoading }) => {
  if (history.length === 0) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto mt-6 animate-fade-in">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold text-gray-300">Search History</h3>
        <button
          onClick={onClear}
          className="text-sm text-gray-400 hover:text-red-400 transition-colors disabled:text-gray-600 disabled:cursor-not-allowed"
          disabled={isLoading}
          aria-label="Clear search history"
        >
          Clear
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {history.map((ip) => (
          <button
            key={ip}
            onClick={() => onSelect(ip)}
            disabled={isLoading}
            className="bg-gray-700 text-gray-200 text-sm font-mono px-3 py-1 rounded-md hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
          >
            {ip}
          </button>
        ))}
      </div>
    </div>
  );
};

export default HistoryList;
