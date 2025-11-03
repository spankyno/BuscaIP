
import React from 'react';

interface WhoisDisplayProps {
  whoisData: string;
  isLoading: boolean;
}

const SkeletonLoader: React.FC = () => (
    <div className="space-y-3 animate-pulse">
      {[...Array(12)].map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          <div className="h-4 bg-gray-600 rounded w-1/4"></div>
          <div className="h-4 bg-gray-700 rounded w-3/4"></div>
        </div>
      ))}
    </div>
);


const WhoisDisplay: React.FC<WhoisDisplayProps> = ({ whoisData, isLoading }) => {
  return (
    <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 shadow-lg min-h-[300px] md:min-h-[400px] flex flex-col">
       <h2 className="text-xl font-semibold mb-3 text-teal-300">WHOIS Information</h2>
      <div className="bg-gray-900 flex-grow p-4 rounded-md overflow-auto font-mono text-xs text-gray-300">
        {isLoading ? (
          <SkeletonLoader />
        ) : (
          <pre>{whoisData || 'No WHOIS data available.'}</pre>
        )}
      </div>
    </div>
  );
};

export default WhoisDisplay;
