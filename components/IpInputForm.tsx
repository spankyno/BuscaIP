import React, { useState, useEffect } from 'react';

interface IpInputFormProps {
  onSubmit: (ipAddress: string) => void;
  isLoading: boolean;
  initialIp?: string;
}

const IpInputForm: React.FC<IpInputFormProps> = ({ onSubmit, isLoading, initialIp }) => {
  const [ipAddress, setIpAddress] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if(initialIp) {
      setIpAddress(initialIp);
    }
  }, [initialIp]);

  const validateIp = (ip: string) => {
    // Regex for IPv4
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    
    // Comprehensive regex for IPv6 (including various notations like compressed and IPv4-mapped)
    const ipv6Regex = /^(?:(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){1,7}:|(?:[0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){1,5}(?::[0-9a-fA-F]{1,4}){1,2}|(?:[0-9a-fA-F]{1,4}:){1,4}(?::[0-9a-fA-F]{1,4}){1,3}|(?:[0-9a-fA-F]{1,4}:){1,3}(?::[0-9a-fA-F]{1,4}){1,4}|(?:[0-9a-fA-F]{1,4}:){1,2}(?::[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:(?:(?::[0-9a-fA-F]{1,4}){1,6})|:(?:(?::[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(?::[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(?:ffff(?::0{1,4}){0,1}:){0,1}(?:(?:25[0-5]|(?:2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(?:25[0-5]|(?:2[0-4]|1{0,1}[0-9]){0,1}[0-9])|(?:[0-9a-fA-F]{1,4}:){1,4}:(?:(?:25[0-5]|(?:2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(?:25[0-5]|(?:2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/i;

    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedIp = ipAddress.trim();
    if (!trimmedIp) {
      setError('IP address cannot be empty.');
      return;
    }
    if (!validateIp(trimmedIp)) {
      setError('Please enter a valid IPv4 or IPv6 address.');
      return;
    }
    setError(null);
    onSubmit(trimmedIp);
  };

  return (
    <div className="max-w-2xl mx-auto bg-gray-800/50 p-4 rounded-lg border border-gray-700 shadow-lg">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative w-full">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                </svg>
            </div>
            <input
              type="text"
              value={ipAddress}
              onChange={(e) => {
                setIpAddress(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Enter IP address e.g., 8.8.8.8 or 2001:4860:4860::8888"
              className="bg-gray-900 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5 placeholder-gray-400"
              disabled={isLoading}
              aria-label="IP Address Input"
            />
        </div>
        <button
          type="submit"
          className="w-full sm:w-auto flex items-center justify-center px-5 py-2.5 text-sm font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-900 disabled:bg-blue-900 disabled:cursor-not-allowed transition-colors duration-200"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Searching...
            </>
          ) : (
            'Lookup'
          )}
        </button>
      </form>
      {error && <p className="text-red-400 text-sm mt-2 text-center sm:text-left">{error}</p>}
    </div>
  );
};

export default IpInputForm;