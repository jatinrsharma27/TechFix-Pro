'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

interface SearchResult {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  description?: string;
  url: string;
  icon: string;
  date?: string;
  priority?: string;
}

export default function AdminSearchPage() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const searchQuery = searchParams.get('q') || '';
    setQuery(searchQuery);
    if (searchQuery) {
      performSearch(searchQuery);
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  const performSearch = async (searchQuery: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/search?q=${encodeURIComponent(searchQuery)}&type=${filter}&limit=50`);
      if (response.ok) {
        const data = await response.json();
        setResults(data.results || []);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    if (query) {
      performSearch(query);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    router.push(result.url);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'contact': return 'bg-blue-100 text-blue-800';
      case 'employee': return 'bg-green-100 text-green-800';
      case 'user': return 'bg-purple-100 text-purple-800';
      case 'revenue': return 'bg-yellow-100 text-yellow-800';
      case 'system': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredResults = filter === 'all' ? results : results.filter(r => r.type === filter);

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Search Results {query && `for "${query}"`}
            </h1>
            <p className="text-gray-600 mt-1">
              {loading ? 'Searching...' : `${filteredResults.length} results found`}
            </p>
          </div>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Back
          </button>
        </div>

        {/* Filters */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'all', name: 'All Results', count: results.length },
              { id: 'contact', name: 'Requests', count: results.filter(r => r.type === 'contact').length },
              { id: 'employee', name: 'Employees', count: results.filter(r => r.type === 'employee').length },
              { id: 'user', name: 'Users', count: results.filter(r => r.type === 'user').length },
              { id: 'revenue', name: 'Revenue', count: results.filter(r => r.type === 'revenue').length },
              { id: 'system', name: 'System', count: results.filter(r => r.type === 'system').length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleFilterChange(tab.id)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  filter === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name} ({tab.count})
              </button>
            ))}
          </nav>
        </div>

        {/* Results */}
        <div className="bg-white rounded-lg border border-gray-200">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-2 text-gray-600">Searching...</p>
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
              <p>Try adjusting your search terms or filters</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredResults.map((result, index) => (
                <div
                  key={`${result.type}-${result.id}-${index}`}
                  onClick={() => handleResultClick(result)}
                  className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <span className="text-2xl">{result.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {result.title}
                        </h3>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(result.type)}`}>
                          {result.type.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{result.subtitle}</p>
                      {result.description && (
                        <p className="text-sm text-gray-500">{result.description}</p>
                      )}
                      {result.date && (
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(result.date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="flex-shrink-0">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
  );
}