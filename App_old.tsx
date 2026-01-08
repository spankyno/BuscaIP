import React, { useState, useCallback, useEffect } from 'react';
import { GeoData } from './types';
import { getGeoData } from './services/ipGeoService';
import { getWhoisInfo } from './services/geminiService';
import IpInputForm from './components/IpInputForm';
import MapDisplay from './components/MapDisplay';
import WhoisDisplay from './components/WhoisDisplay';
import HistoryList from './components/HistoryList';

const App: React.FC = () => {
  const [geoData, setGeoData] = useState<GeoData | null>(null);
  const [whoisData, setWhoisData] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('ipHistory');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (e) {
      console.error("Could not parse history from localStorage", e);
      localStorage.removeItem('ipHistory');
    }
  }, []);

  const fetchIpInfo = useCallback(async (ipAddress: string = '') => {
    setIsLoading(true);
    setError(null);
    // Immediately clear previous results when a new search starts
    if (ipAddress) {
      setGeoData(null);
      setWhoisData('');
    }

    try {
      const geo = await getGeoData(ipAddress);
      setGeoData(geo);
      const whoisPromise = getWhoisInfo(geo.query);
      
      // Update history on success
      setHistory(prevHistory => {
        const filteredHistory = prevHistory.filter(h => h !== geo.query);
        const newHistory = [geo.query, ...filteredHistory].slice(0, 10); // Keep last 10
        localStorage.setItem('ipHistory', JSON.stringify(newHistory));
        return newHistory;
      });

      const whois = await whoisPromise;
      setWhoisData(whois);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      setGeoData(null); // Clear data on error
      setWhoisData('');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    // Fetch user's own IP info on initial load
    fetchIpInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLookup = (ipAddress: string) => {
    // Prevent duplicate lookups if already loading
    if (isLoading) return;
    fetchIpInfo(ipAddress);
  };
  
  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('ipHistory');
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <main className="container mx-auto px-4 py-8 md:py-12">
        <header className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">
            Aitor Sánchez Gutiérrez IP
          </h1>
          <p className="mt-2 text-lg text-gray-400">
            IP Geolocation & WHOIS Lookup
          </p>
        </header>

        <IpInputForm onSubmit={handleLookup} isLoading={isLoading} initialIp={geoData?.query} />
        
        <HistoryList
          history={history}
          onSelect={handleLookup}
          onClear={handleClearHistory}
          isLoading={isLoading}
        />

        {error && (
          <div className="mt-8 text-center bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded-lg">
            <p><strong>Error:</strong> {error}</p>
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <MapDisplay geoData={geoData} isLoading={isLoading} />
          <WhoisDisplay whoisData={whoisData} isLoading={isLoading} />
        </div>
      </main>
       <footer className="text-center py-6 text-gray-500 text-sm">
        <p>GeoIP by ipwho.is, WHOIS by RIPE Database, Map by OpenStreetMap. Developed by Aitor.</p>
      </footer>
    </div>
  );
};

export default App;
