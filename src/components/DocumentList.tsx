import React, { useState } from 'react';
import { FileText, Trash2, Eye, Link as LinkIcon, Clock, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

type KnowledgeBase = Database['public']['Tables']['knowledge_base']['Row'];

interface DocumentListProps {
  documents: KnowledgeBase[];
  onRefresh: () => void;
  onViewDocument?: (document: KnowledgeBase) => void;
}

export const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  onRefresh,
  onViewDocument,
}) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async (documentId: string) => {
    if (!confirm('Är du säker på att du vill ta bort detta dokument?')) {
      return;
    }

    setDeletingId(documentId);
    setError(null);

    try {
      const { error: deleteError } = await supabase
        .from('knowledge_base')
        .delete()
        .eq('id', documentId);

      if (deleteError) throw deleteError;

      onRefresh();
    } catch (err: any) {
      console.error('Error deleting document:', err);
      setError(err.message || 'Kunde inte ta bort dokument');
    } finally {
      setDeletingId(null);
    }
  };

  const getSourceIcon = (sourceType: string) => {
    switch (sourceType) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-400" />;
      case 'docx':
        return <FileText className="w-5 h-5 text-blue-400" />;
      case 'url':
        return <LinkIcon className="w-5 h-5 text-green-400" />;
      case 'text':
        return <FileText className="w-5 h-5 text-gray-400" />;
      default:
        return <FileText className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'processing':
        return <Loader className="w-4 h-4 text-blue-400 animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Klar';
      case 'processing':
        return 'Bearbetar...';
      case 'failed':
        return 'Misslyckades';
      case 'pending':
        return 'Väntar';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-600/20 text-green-400 border-green-600/50';
      case 'processing':
        return 'bg-blue-600/20 text-blue-400 border-blue-600/50';
      case 'failed':
        return 'bg-red-600/20 text-red-400 border-red-600/50';
      case 'pending':
        return 'bg-yellow-600/20 text-yellow-400 border-yellow-600/50';
      default:
        return 'bg-gray-600/20 text-gray-400 border-gray-600/50';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('sv-SE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFileSize = (bytes: number | null): string => {
    if (!bytes) return '-';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getChunkInfo = (doc: KnowledgeBase): string => {
    if (doc.total_chunks > 1) {
      return `Del ${doc.chunk_index + 1} av ${doc.total_chunks}`;
    }
    return '';
  };

  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400 text-lg mb-2">Inga dokument ännu</p>
        <p className="text-gray-500 text-sm">Ladda upp dokument för att börja bygga kunskapsbasen</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-600/20 border border-red-600/50 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      <div className="space-y-3">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="p-4 bg-gray-700/50 rounded-lg border border-gray-600 hover:border-gray-500 transition-all"
          >
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className="flex-shrink-0 mt-1">
                {getSourceIcon(doc.source_type)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Title */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-white truncate">
                      {doc.title || doc.file_name || 'Namnlöst dokument'}
                    </h4>
                    {doc.file_name && doc.title && (
                      <p className="text-xs text-gray-400 truncate">{doc.file_name}</p>
                    )}
                  </div>

                  {/* Status Badge */}
                  <div className={`flex items-center gap-1.5 px-2 py-1 rounded border text-xs font-medium ${getStatusColor(doc.processing_status)}`}>
                    {getStatusIcon(doc.processing_status)}
                    <span>{getStatusText(doc.processing_status)}</span>
                  </div>
                </div>

                {/* Summary */}
                {doc.summary && (
                  <p className="text-sm text-gray-300 mb-2 line-clamp-2">
                    {doc.summary}
                  </p>
                )}

                {/* Error Message */}
                {doc.processing_status === 'failed' && doc.processing_error && (
                  <div className="mb-2 p-2 bg-red-600/10 border border-red-600/30 rounded text-xs text-red-400">
                    {doc.processing_error}
                  </div>
                )}

                {/* Metadata */}
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  {/* Source Type */}
                  <span className="capitalize">{doc.source_type}</span>

                  {/* File Size */}
                  {doc.file_size_bytes && (
                    <>
                      <span>•</span>
                      <span>{formatFileSize(doc.file_size_bytes)}</span>
                    </>
                  )}

                  {/* Chunk Info */}
                  {doc.total_chunks > 1 && (
                    <>
                      <span>•</span>
                      <span>{getChunkInfo(doc)}</span>
                    </>
                  )}

                  {/* Date */}
                  <span>•</span>
                  <span>{formatDate(doc.created_at)}</span>

                  {/* Source URL */}
                  {doc.source_url && (
                    <>
                      <span>•</span>
                      <a
                        href={doc.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 hover:underline"
                      >
                        Källa
                      </a>
                    </>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                {onViewDocument && (
                  <button
                    onClick={() => onViewDocument(doc)}
                    className="p-2 hover:bg-gray-600 rounded-lg transition-colors"
                    title="Visa dokument"
                  >
                    <Eye className="w-4 h-4 text-gray-400" />
                  </button>
                )}

                <button
                  onClick={() => handleDelete(doc.id)}
                  disabled={deletingId === doc.id}
                  className="p-2 hover:bg-red-600/20 rounded-lg transition-colors disabled:opacity-50"
                  title="Ta bort"
                >
                  {deletingId === doc.id ? (
                    <Loader className="w-4 h-4 text-red-400 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4 text-red-400" />
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
