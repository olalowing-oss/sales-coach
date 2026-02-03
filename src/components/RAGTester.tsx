import React, { useState, useEffect } from 'react';
import { X, Send, FileText, TrendingUp, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Product {
  id: string;
  name: string;
  description: string | null;
}

interface Source {
  title: string;
  excerpt: string;
}

interface RAGTesterProps {
  onClose: () => void;
}

export const RAGTester: React.FC<RAGTesterProps> = ({ onClose }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [answer, setAnswer] = useState('');
  const [sources, setSources] = useState<Source[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Example questions
  const exampleQuestions = [
    'Vad kostar AI Sales Coach Pro?',
    'Vilka funktioner ingår i produkten?',
    'Har ni några kundcase?',
    'Vad är skillnaden mellan olika prisplaner?',
    'Hur fungerar AI-baserad säljträning?',
  ];

  // Fetch user's accessible products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Get user's product assignments
        const { data: userProducts, error: upError } = await supabase
          .from('user_products')
          .select('product_id')
          .eq('is_active', true);

        if (upError) throw upError;

        const productIds = userProducts?.map(up => up.product_id) || [];

        if (productIds.length === 0) {
          setError('Du har ingen produktåtkomst. Tilldela en produkt i Admin UI först.');
          return;
        }

        // Get product details
        const { data: productsData, error: pError } = await supabase
          .from('product_profiles')
          .select('id, name, description')
          .in('id', productIds);

        if (pError) throw pError;

        setProducts(productsData || []);
        if (productsData && productsData.length > 0) {
          setSelectedProductId(productsData[0].id);
        }
      } catch (err: any) {
        console.error('Error fetching products:', err);
        setError('Kunde inte hämta produkter');
      }
    };

    fetchProducts();
  }, []);

  const handleAskQuestion = async () => {
    if (!question.trim() || !selectedProductId) return;

    setIsLoading(true);
    setError(null);
    setAnswer('');
    setSources([]);

    try {
      const response = await fetch('/api/answer-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question.trim(),
          productId: selectedProductId,
          context: ''
        }),
      });

      if (!response.ok) {
        throw new Error('Request failed');
      }

      const data = await response.json();

      // Set answer and sources from response
      setAnswer(data.answer || 'Inget svar tillgängligt');
      setSources(data.sources || []);

      if (!data.sources || data.sources.length === 0) {
        setError('Ingen relevant information hittades i kunskapsbasen');
      }

      setIsLoading(false);
    } catch (err: any) {
      console.error('RAG error:', err);
      setError(err.message || 'Kunde inte få svar från AI');
      setIsLoading(false);
    }
  };

  const handleExampleClick = (exampleQuestion: string) => {
    setQuestion(exampleQuestion);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAskQuestion();
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-95 z-50 overflow-y-auto">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <FileText className="text-blue-400" size={32} />
              Testa RAG-funktionen
            </h1>
            <p className="text-gray-400">
              Ställ frågor om dina produkter och se hur AI svarar med information från kunskapsbasen
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
          >
            <X size={24} />
          </button>
        </div>

        {/* Product Selector */}
        <div className="mb-6 bg-gray-800 rounded-lg p-4 border border-gray-700">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Välj produkt
          </label>
          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
          >
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
        </div>

        {/* Question Input */}
        <div className="mb-6 bg-gray-800 rounded-lg p-6 border border-gray-700">
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Din fråga
          </label>
          <div className="flex gap-3">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="T.ex. Vad kostar er lösning?"
              className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 resize-none"
              rows={3}
            />
            <button
              onClick={handleAskQuestion}
              disabled={isLoading || !question.trim() || !selectedProductId}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Söker...
                </>
              ) : (
                <>
                  <Send size={20} />
                  Fråga
                </>
              )}
            </button>
          </div>

          {/* Example Questions */}
          <div className="mt-4">
            <p className="text-xs text-gray-400 mb-2">Exempelfrågor:</p>
            <div className="flex flex-wrap gap-2">
              {exampleQuestions.map((eq, idx) => (
                <button
                  key={idx}
                  onClick={() => handleExampleClick(eq)}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded-full transition-colors"
                >
                  {eq}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-900 bg-opacity-50 border border-red-700 rounded-lg text-red-200">
            {error}
          </div>
        )}

        {/* Answer */}
        {answer && (
          <div className="mb-6 bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              Svar från AI
              {isLoading && <span className="text-sm text-gray-400">(svarar...)</span>}
            </h2>
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-200 whitespace-pre-wrap leading-relaxed">
                {answer}
                {isLoading && <span className="inline-block w-2 h-5 ml-1 bg-blue-400 animate-pulse"></span>}
              </p>
            </div>
          </div>
        )}

        {/* Sources */}
        {sources.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="text-green-400" size={20} />
              Källor från kunskapsbasen ({sources.length})
            </h2>
            <div className="space-y-4">
              {sources.map((source, idx) => (
                <div
                  key={idx}
                  className="bg-gray-700 rounded-lg p-4 border border-gray-600"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-white">
                      {idx + 1}. {source.title}
                    </h3>
                  </div>
                  <p className="text-gray-300 text-sm line-clamp-3">
                    {source.excerpt}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-6 bg-blue-900 bg-opacity-30 border border-blue-700 rounded-lg p-4">
          <h3 className="text-blue-300 font-medium mb-2">ℹ️ Hur fungerar RAG?</h3>
          <ul className="text-blue-200 text-sm space-y-1 list-disc list-inside">
            <li>Din fråga omvandlas till en vector (embedding)</li>
            <li>Systemet söker efter semantiskt liknande dokument i kunskapsbasen</li>
            <li>De mest relevanta dokumenten används som kontext till AI:n</li>
            <li>AI:n genererar ett svar baserat ENDAST på informationen i dessa dokument</li>
            <li>Relevans-procenten visar hur väl dokumentet matchar din fråga</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
