import React, { useState, useEffect } from 'react';
import { X, Database, Package, Upload, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ProductManager } from './ProductManager';
import { FileUpload } from './FileUpload';
import { DocumentList } from './DocumentList';
import type { Database as DB } from '../types/database';

type ProductProfile = DB['public']['Tables']['product_profiles']['Row'];
type KnowledgeBase = DB['public']['Tables']['knowledge_base']['Row'];
type KnowledgeBaseInsert = DB['public']['Tables']['knowledge_base']['Insert'];

interface KnowledgeBaseManagerProps {
  onClose: () => void;
}

export const KnowledgeBaseManager: React.FC<KnowledgeBaseManagerProps> = ({ onClose }) => {
  const { user } = useAuth();
  const [selectedProduct, setSelectedProduct] = useState<ProductProfile | null>(null);
  const [documents, setDocuments] = useState<KnowledgeBase[]>([]);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
  const [showProductManager, setShowProductManager] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    uploading: boolean;
    progress: number;
    message: string;
    type: 'info' | 'success' | 'error';
  } | null>(null);

  // Fetch documents when product changes
  useEffect(() => {
    if (selectedProduct) {
      fetchDocuments();
    } else {
      setDocuments([]);
    }
  }, [selectedProduct]);

  const fetchDocuments = async () => {
    if (!selectedProduct) return;

    setIsLoadingDocuments(true);
    try {
      const { data, error } = await supabase
        .from('knowledge_base')
        .select('*')
        .eq('product_id', selectedProduct.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (err: any) {
      console.error('Error fetching documents:', err);
      setUploadStatus({
        uploading: false,
        progress: 0,
        message: err.message || 'Kunde inte ladda dokument',
        type: 'error',
      });
    } finally {
      setIsLoadingDocuments(false);
    }
  };

  const handleProductSelect = async (productId: string) => {
    try {
      const { data, error } = await supabase
        .from('product_profiles')
        .select('*')
        .eq('id', productId)
        .single();

      if (error) throw error;
      setSelectedProduct(data);
      setShowProductManager(false);
    } catch (err: any) {
      console.error('Error selecting product:', err);
      setUploadStatus({
        uploading: false,
        progress: 0,
        message: err.message || 'Kunde inte välja produkt',
        type: 'error',
      });
    }
  };

  const processDocument = async (documentId: string) => {
    try {
      const response = await fetch('/api/process-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ documentId }),
      });

      if (!response.ok) {
        throw new Error('Failed to process document');
      }

      const result = await response.json();
      console.log('Document processed:', result);
    } catch (error) {
      console.error('Error processing document:', error);
      // Don't throw - let the document stay in pending state
    }
  };

  const handleFileUpload = async (files: File[]) => {
    if (!selectedProduct) {
      setUploadStatus({
        uploading: false,
        progress: 0,
        message: 'Välj en produkt först',
        type: 'error',
      });
      return;
    }

    setUploadStatus({
      uploading: true,
      progress: 0,
      message: `Laddar upp ${files.length} fil(er)...`,
      type: 'info',
    });

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Read file content (simple text extraction for now)
        const content = await readFileAsText(file);

        // Create knowledge base entry
        const entry: KnowledgeBaseInsert = {
          product_id: selectedProduct.id,
          source_type: getSourceType(file.name),
          file_name: file.name,
          file_size_bytes: file.size,
          title: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
          content: content,
          processing_status: 'pending',
          uploaded_by: user?.id,
        };

        const { data, error } = await supabase
          .from('knowledge_base')
          .insert([entry])
          .select()
          .single();

        if (error) throw error;

        // Trigger processing in background
        if (data) {
          processDocument(data.id);
        }

        // Update progress
        const progress = Math.round(((i + 1) / files.length) * 100);
        setUploadStatus({
          uploading: true,
          progress,
          message: `Uppladdning ${i + 1}/${files.length}...`,
          type: 'info',
        });
      }

      // Success
      setUploadStatus({
        uploading: false,
        progress: 100,
        message: `${files.length} fil(er) uppladdade! Bearbetning kommer ske i bakgrunden.`,
        type: 'success',
      });

      // Refresh document list
      await fetchDocuments();

      // Clear success message after 5 seconds
      setTimeout(() => setUploadStatus(null), 5000);
    } catch (err: any) {
      console.error('Error uploading files:', err);
      setUploadStatus({
        uploading: false,
        progress: 0,
        message: err.message || 'Uppladdning misslyckades',
        type: 'error',
      });
    }
  };

  const handleUrlUpload = async (url: string) => {
    if (!selectedProduct) {
      setUploadStatus({
        uploading: false,
        progress: 0,
        message: 'Välj en produkt först',
        type: 'error',
      });
      return;
    }

    setUploadStatus({
      uploading: true,
      progress: 50,
      message: 'Hämtar innehåll från URL...',
      type: 'info',
    });

    try {
      // Create knowledge base entry with URL
      const entry: KnowledgeBaseInsert = {
        product_id: selectedProduct.id,
        source_type: 'url',
        source_url: url,
        title: new URL(url).hostname,
        processing_status: 'pending',
        uploaded_by: user?.id,
      };

      const { data, error } = await supabase
        .from('knowledge_base')
        .insert([entry])
        .select()
        .single();

      if (error) throw error;

      // Trigger processing in background
      if (data) {
        processDocument(data.id);
      }

      setUploadStatus({
        uploading: false,
        progress: 100,
        message: 'URL tillagd! Innehållet kommer hämtas och bearbetas i bakgrunden.',
        type: 'success',
      });

      await fetchDocuments();
      setTimeout(() => setUploadStatus(null), 5000);
    } catch (err: any) {
      console.error('Error adding URL:', err);
      setUploadStatus({
        uploading: false,
        progress: 0,
        message: err.message || 'Kunde inte lägga till URL',
        type: 'error',
      });
    }
  };

  const handleTextUpload = async (title: string, content: string) => {
    if (!selectedProduct) {
      setUploadStatus({
        uploading: false,
        progress: 0,
        message: 'Välj en produkt först',
        type: 'error',
      });
      return;
    }

    setUploadStatus({
      uploading: true,
      progress: 50,
      message: 'Sparar text...',
      type: 'info',
    });

    try {
      const entry: KnowledgeBaseInsert = {
        product_id: selectedProduct.id,
        source_type: 'text',
        title: title,
        content: content,
        processing_status: 'pending',
        uploaded_by: user?.id,
      };

      const { data, error } = await supabase
        .from('knowledge_base')
        .insert([entry])
        .select()
        .single();

      if (error) throw error;

      // Trigger processing in background
      if (data) {
        processDocument(data.id);
      }

      setUploadStatus({
        uploading: false,
        progress: 100,
        message: 'Text tillagd! Bearbetning kommer ske i bakgrunden.',
        type: 'success',
      });

      await fetchDocuments();
      setTimeout(() => setUploadStatus(null), 5000);
    } catch (err: any) {
      console.error('Error adding text:', err);
      setUploadStatus({
        uploading: false,
        progress: 0,
        message: err.message || 'Kunde inte spara text',
        type: 'error',
      });
    }
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error('Kunde inte läsa fil'));
      reader.readAsText(file);
    });
  };

  const getSourceType = (filename: string): 'pdf' | 'docx' | 'text' | 'other' => {
    const extension = filename.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return 'pdf';
      case 'docx':
      case 'doc':
        return 'docx';
      case 'txt':
        return 'text';
      default:
        return 'other';
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 rounded-xl w-full max-w-7xl max-h-[90vh] flex flex-col border border-gray-700">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <div className="flex items-center gap-3">
              <Database className="w-6 h-6 text-blue-400" />
              <div>
                <h2 className="text-2xl font-semibold text-white">Kunskapsbas</h2>
                <p className="text-sm text-gray-400">Hantera material för AI-träning</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Product Selection */}
            <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-blue-400" />
                  <div>
                    <h3 className="text-sm font-medium text-white">Vald produkt</h3>
                    {selectedProduct ? (
                      <p className="text-sm text-gray-300">{selectedProduct.name}</p>
                    ) : (
                      <p className="text-sm text-gray-400">Ingen produkt vald</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setShowProductManager(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm"
                >
                  {selectedProduct ? 'Byt produkt' : 'Välj produkt'}
                </button>
              </div>
            </div>

            {/* Upload Status */}
            {uploadStatus && (
              <div
                className={`p-4 rounded-lg border flex items-start gap-3 ${
                  uploadStatus.type === 'success'
                    ? 'bg-green-600/20 border-green-600/50'
                    : uploadStatus.type === 'error'
                    ? 'bg-red-600/20 border-red-600/50'
                    : 'bg-blue-600/20 border-blue-600/50'
                }`}
              >
                {uploadStatus.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                ) : uploadStatus.type === 'error' ? (
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <Upload className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p
                    className={`text-sm font-medium ${
                      uploadStatus.type === 'success'
                        ? 'text-green-400'
                        : uploadStatus.type === 'error'
                        ? 'text-red-400'
                        : 'text-blue-400'
                    }`}
                  >
                    {uploadStatus.message}
                  </p>
                  {uploadStatus.uploading && (
                    <div className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 transition-all duration-300"
                        style={{ width: `${uploadStatus.progress}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* File Upload Section */}
            {selectedProduct && (
              <div className="bg-gray-700/30 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-blue-400" />
                  Ladda upp material
                </h3>
                <FileUpload
                  onFileSelect={handleFileUpload}
                  onUrlSubmit={handleUrlUpload}
                  onTextSubmit={handleTextUpload}
                />
              </div>
            )}

            {/* Documents Section */}
            <div className="bg-gray-700/30 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Database className="w-5 h-5 text-blue-400" />
                  Uppladdade dokument
                  {documents.length > 0 && (
                    <span className="text-sm font-normal text-gray-400">({documents.length})</span>
                  )}
                </h3>
                {selectedProduct && (
                  <button
                    onClick={fetchDocuments}
                    disabled={isLoadingDocuments}
                    className="p-2 hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
                    title="Uppdatera"
                  >
                    <RefreshCw className={`w-4 h-4 text-gray-400 ${isLoadingDocuments ? 'animate-spin' : ''}`} />
                  </button>
                )}
              </div>

              {isLoadingDocuments ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <DocumentList
                  documents={documents}
                  onRefresh={fetchDocuments}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Product Manager Modal */}
      {showProductManager && (
        <ProductManager
          onClose={() => setShowProductManager(false)}
          onSelectProduct={handleProductSelect}
          selectedProductId={selectedProduct?.id}
        />
      )}
    </>
  );
};
