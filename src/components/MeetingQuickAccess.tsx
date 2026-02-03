// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Search, FileText, MessageSquare, Briefcase, Tag, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { useMeetingAssistantStore } from '../store/meetingAssistantStore';
import { useCoachingStore } from '../store/coachingStore';

interface SearchResult {
  id: string;
  type: 'battlecard' | 'objection' | 'case' | 'offer';
  title: string;
  content: string;
  fullContent?: any;
}

export function MeetingQuickAccess() {
  const {
    battlecards,
    objectionHandlers,
    caseStudies,
    offers,
    initializeFromDb
  } = useCoachingStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [expandedResultId, setExpandedResultId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load coaching data on mount
  useEffect(() => {
    initializeFromDb();
  }, [initializeFromDb]);

  // Perform search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);

    const query = searchQuery.toLowerCase();
    const results: SearchResult[] = [];

    // Search battlecards
    battlecards.forEach(bc => {
      const competitorMatch = bc.competitor?.toLowerCase().includes(query);
      const contentMatch = bc.talkingPoints?.some((tp: string) =>
        tp.toLowerCase().includes(query)
      );

      if (competitorMatch || contentMatch) {
        results.push({
          id: bc.id,
          type: 'battlecard',
          title: bc.competitor || 'Untitled Battlecard',
          content: bc.talkingPoints?.join(' • ') || '',
          fullContent: bc
        });
      }
    });

    // Search objections
    objectionHandlers.forEach(obj => {
      const objectionMatch = obj.objection?.toLowerCase().includes(query);
      const responseMatch = obj.responses?.short?.toLowerCase().includes(query);

      if (objectionMatch || responseMatch) {
        results.push({
          id: obj.id,
          type: 'objection',
          title: obj.objection || 'Untitled Objection',
          content: obj.responses?.short || obj.responses?.detailed || '',
          fullContent: obj
        });
      }
    });

    // Search cases
    caseStudies.forEach(cs => {
      const customerMatch = cs.customer?.toLowerCase().includes(query);
      const industryMatch = cs.industry?.toLowerCase().includes(query);
      const challengeMatch = cs.challenge?.toLowerCase().includes(query);

      if (customerMatch || industryMatch || challengeMatch) {
        results.push({
          id: cs.id,
          type: 'case',
          title: cs.customer || 'Untitled Case',
          content: `${cs.industry || ''} - ${cs.challenge || ''}`,
          fullContent: cs
        });
      }
    });

    // Search offers
    offers.forEach(offer => {
      const nameMatch = offer.name?.toLowerCase().includes(query);
      const descMatch = offer.shortDescription?.toLowerCase().includes(query) ||
                        offer.fullDescription?.toLowerCase().includes(query);

      if (nameMatch || descMatch) {
        results.push({
          id: offer.id,
          type: 'offer',
          title: offer.name || 'Untitled Offer',
          content: offer.shortDescription || offer.fullDescription || '',
          fullContent: offer
        });
      }
    });

    setSearchResults(results);
    setIsLoading(false);
  }, [searchQuery, battlecards, objectionHandlers, caseStudies, offers]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const toggleExpand = (resultId: string) => {
    setExpandedResultId(expandedResultId === resultId ? null : resultId);
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'battlecard':
        return <FileText className="w-4 h-4 text-blue-600" />;
      case 'objection':
        return <MessageSquare className="w-4 h-4 text-orange-600" />;
      case 'case':
        return <Briefcase className="w-4 h-4 text-green-600" />;
      case 'offer':
        return <Tag className="w-4 h-4 text-purple-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const getResultColor = (type: string) => {
    switch (type) {
      case 'battlecard':
        return 'border-blue-200 hover:border-blue-400 bg-blue-50';
      case 'objection':
        return 'border-orange-200 hover:border-orange-400 bg-orange-50';
      case 'case':
        return 'border-green-200 hover:border-green-400 bg-green-50';
      case 'offer':
        return 'border-purple-200 hover:border-purple-400 bg-purple-50';
      default:
        return 'border-gray-200 hover:border-gray-400 bg-gray-50';
    }
  };

  const renderExpandedContent = (result: SearchResult) => {
    const content = result.fullContent;
    const isExpanded = expandedResultId === result.id;

    if (!isExpanded) return null;

    switch (result.type) {
      case 'battlecard':
        return (
          <div className="mt-3 pt-3 border-t border-gray-300 space-y-2">
            {content.talkingPoints && content.talkingPoints.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-gray-700 mb-1">Talking Points:</div>
                <ul className="space-y-1">
                  {content.talkingPoints.map((point: string, idx: number) => (
                    <li key={idx} className="text-xs text-gray-700 flex items-start space-x-2">
                      <span className="text-blue-600 flex-shrink-0">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );

      case 'objection':
        return (
          <div className="mt-3 pt-3 border-t border-gray-300 space-y-2">
            <div>
              <div className="text-xs font-semibold text-gray-700 mb-1">Short Response:</div>
              <p className="text-xs text-gray-700">{content.responses?.short}</p>
            </div>
            {content.responses?.detailed && (
              <div>
                <div className="text-xs font-semibold text-gray-700 mb-1">Detailed Response:</div>
                <p className="text-xs text-gray-700">{content.responses.detailed}</p>
              </div>
            )}
          </div>
        );

      case 'case':
        return (
          <div className="mt-3 pt-3 border-t border-gray-300 space-y-2">
            {content.challenge && (
              <div>
                <div className="text-xs font-semibold text-gray-700 mb-1">Challenge:</div>
                <p className="text-xs text-gray-700">{content.challenge}</p>
              </div>
            )}
            {content.solution && (
              <div>
                <div className="text-xs font-semibold text-gray-700 mb-1">Solution:</div>
                <p className="text-xs text-gray-700">{content.solution}</p>
              </div>
            )}
            {content.results && (
              <div>
                <div className="text-xs font-semibold text-gray-700 mb-1">Results:</div>
                <p className="text-xs text-gray-700">{content.results}</p>
              </div>
            )}
          </div>
        );

      case 'offer':
        return (
          <div className="mt-3 pt-3 border-t border-gray-300 space-y-2">
            {content.fullDescription && (
              <div>
                <div className="text-xs font-semibold text-gray-700 mb-1">Description:</div>
                <p className="text-xs text-gray-700">{content.fullDescription}</p>
              </div>
            )}
            {content.priceRange && (
              <div>
                <div className="text-xs font-semibold text-gray-700 mb-1">Price:</div>
                <p className="text-xs text-gray-700">
                  {content.priceRange.min} - {content.priceRange.max} {content.priceRange.currency}
                </p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Search className="w-4 h-4 text-gray-500" />
        <h4 className="text-sm font-semibold text-gray-700">
          Quick Access
        </h4>
      </div>

      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Sök battlecards, objections, cases..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
        />
        <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
      </div>

      {/* Search Results */}
      {searchQuery ? (
        isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-xs text-gray-500 mt-2">Söker...</p>
          </div>
        ) : searchResults.length > 0 ? (
          <div className="space-y-2">
            {searchResults.map((result) => {
              const isExpanded = expandedResultId === result.id;

              return (
                <div
                  key={result.id}
                  className={`p-3 border rounded-lg hover:shadow-md transition-all cursor-pointer ${getResultColor(result.type)}`}
                >
                  <div className="flex items-start space-x-2">
                    {getResultIcon(result.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h5 className="text-sm font-medium text-gray-900">
                          {result.title}
                        </h5>
                        <button
                          onClick={() => toggleExpand(result.id)}
                          className="p-1 hover:bg-white hover:bg-opacity-50 rounded flex-shrink-0"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-gray-600" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-600" />
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {result.content}
                      </p>
                      <div className="mt-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-white bg-opacity-60 text-gray-700">
                          {result.type}
                        </span>
                      </div>

                      {renderExpandedContent(result)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-xs text-gray-500">Inga resultat hittades för "{searchQuery}"</p>
          </div>
        )
      ) : (
        /* Default View - Stats */
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center space-x-2 p-3 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
              <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-gray-900">Battlecards</div>
                <div className="text-xs text-gray-600">{battlecards.length} tillgängliga</div>
              </div>
            </div>

            <div className="flex items-center space-x-2 p-3 bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-lg">
              <MessageSquare className="w-4 h-4 text-orange-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-gray-900">Objections</div>
                <div className="text-xs text-gray-600">{objectionHandlers.length} tillgängliga</div>
              </div>
            </div>

            <div className="flex items-center space-x-2 p-3 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg">
              <Briefcase className="w-4 h-4 text-green-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-gray-900">Cases</div>
                <div className="text-xs text-gray-600">{caseStudies.length} tillgängliga</div>
              </div>
            </div>

            <div className="flex items-center space-x-2 p-3 bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
              <Tag className="w-4 h-4 text-purple-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-gray-900">Offers</div>
                <div className="text-xs text-gray-600">{offers.length} tillgängliga</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <Search className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h5 className="text-sm font-medium text-indigo-900 mb-1">
                  Snabb åtkomst till svar
                </h5>
                <p className="text-xs text-indigo-700">
                  När kunden ställer en fråga, sök här för att snabbt hitta battlecards,
                  invändningshantering, eller case studies.
                </p>
                <div className="mt-2">
                  <p className="text-xs text-indigo-600">
                    <span className="font-medium">Tips:</span> Quick Tags triggar automatiskt relevant innehåll.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
