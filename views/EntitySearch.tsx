import React, { useState } from 'react';
import { Search, Loader2, Database, AlertCircle } from 'lucide-react';
import { EntityProfile } from '../types';
import { searchEntitiesNaturalLanguage } from '../services/geminiService';
import RiskBadge from '../components/RiskBadge';

interface EntitySearchProps {
  database: EntityProfile[];
}

const EntitySearch: React.FC<EntitySearchProps> = ({ database }) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<{ matches: EntityProfile[], reason: string } | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setResults(null);

    const result = await searchEntitiesNaturalLanguage(query, database);
    
    // Filter database based on IDs returned by AI
    const matchedEntities = database.filter(entity => result.matchedIds.includes(entity.id));
    
    setResults({
      matches: matchedEntities,
      reason: result.reason
    });
    setIsLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-slate-800 mb-3">AI Entity Search</h2>
        <p className="text-slate-500 max-w-lg mx-auto">
          Search your client database using natural language. Vague descriptions or partial memories are supported.
        </p>
      </div>

      <form onSubmit={handleSearch} className="relative mb-12">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='e.g., "Find that tech company with low risk score" or "The shipping firm in Panama"'
            className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-lg bg-white text-slate-900"
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-6 h-6" />
        </div>
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="absolute right-2 top-2 bottom-2 px-6 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Search'}
        </button>
      </form>

      {results && (
        <div className="space-y-6 animate-fade-in">
          {/* AI Reasoning */}
          <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-lg flex items-start space-x-3">
             <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
               <Database className="w-5 h-5" />
             </div>
             <div>
               <h4 className="font-semibold text-indigo-900 text-sm uppercase tracking-wide mb-1">AI Reasoning</h4>
               <p className="text-indigo-800">{results.reason}</p>
             </div>
          </div>

          {/* Results List */}
          {results.matches.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {results.matches.map((entity) => (
                <div key={entity.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow flex flex-col md:flex-row justify-between items-start md:items-center">
                  <div>
                    <div className="flex items-center space-x-3 mb-1">
                      <h3 className="text-lg font-bold text-slate-800">{entity.name}</h3>
                      <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded uppercase font-semibold">{entity.type}</span>
                    </div>
                    <div className="text-sm text-slate-500 space-y-1">
                       <p>ID: {entity.id} • Registered: {new Date(entity.createdAt).toLocaleDateString()}</p>
                       <p>{JSON.stringify(entity.details).slice(0, 100)}...</p>
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0 flex flex-col items-end space-y-2">
                    <RiskBadge level={entity.riskLevel} score={entity.riskScore} />
                    <span className="text-xs text-slate-400 capitalize">{entity.status.replace('_', ' ')}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
              <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No matching entities found.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EntitySearch;