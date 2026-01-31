import React, { useState, useRef } from 'react';
import { Upload, File, Link as LinkIcon, X, FileText, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (files: File[]) => void;
  onUrlSubmit: (url: string) => void;
  onTextSubmit: (title: string, content: string) => void;
  acceptedFileTypes?: string;
  maxFileSize?: number; // in MB
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  onUrlSubmit,
  onTextSubmit,
  acceptedFileTypes = '.pdf,.docx,.txt',
  maxFileSize = 10,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadMode, setUploadMode] = useState<'file' | 'url' | 'text'>('file');
  const [url, setUrl] = useState('');
  const [textTitle, setTextTitle] = useState('');
  const [textContent, setTextContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const handleFiles = (files: File[]) => {
    setError(null);

    // Validate file types
    const validFiles = files.filter(file => {
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      return acceptedFileTypes.includes(extension);
    });

    if (validFiles.length !== files.length) {
      setError(`Några filer hoppades över. Accepterade format: ${acceptedFileTypes}`);
    }

    // Validate file size
    const oversizedFiles = validFiles.filter(file => file.size > maxFileSize * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setError(`Några filer är för stora. Max storlek: ${maxFileSize}MB`);
      return;
    }

    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = () => {
    if (uploadMode === 'file' && selectedFiles.length > 0) {
      onFileSelect(selectedFiles);
      setSelectedFiles([]);
    } else if (uploadMode === 'url' && url) {
      onUrlSubmit(url);
      setUrl('');
    } else if (uploadMode === 'text' && textTitle && textContent) {
      onTextSubmit(textTitle, textContent);
      setTextTitle('');
      setTextContent('');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (filename: string) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-400" />;
      case 'docx':
      case 'doc':
        return <FileText className="w-5 h-5 text-blue-400" />;
      case 'txt':
        return <FileText className="w-5 h-5 text-gray-400" />;
      default:
        return <File className="w-5 h-5 text-gray-400" />;
    }
  };

  const canUpload =
    (uploadMode === 'file' && selectedFiles.length > 0) ||
    (uploadMode === 'url' && url.trim()) ||
    (uploadMode === 'text' && textTitle.trim() && textContent.trim());

  return (
    <div className="space-y-4">
      {/* Upload Mode Tabs */}
      <div className="flex gap-2 border-b border-gray-700">
        <button
          onClick={() => setUploadMode('file')}
          className={`px-4 py-2 font-medium transition-colors ${
            uploadMode === 'file'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          <Upload className="w-4 h-4 inline mr-2" />
          Ladda upp fil
        </button>
        <button
          onClick={() => setUploadMode('url')}
          className={`px-4 py-2 font-medium transition-colors ${
            uploadMode === 'url'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          <LinkIcon className="w-4 h-4 inline mr-2" />
          Från URL
        </button>
        <button
          onClick={() => setUploadMode('text')}
          className={`px-4 py-2 font-medium transition-colors ${
            uploadMode === 'text'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          <FileText className="w-4 h-4 inline mr-2" />
          Klistra in text
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-600/20 border border-red-600/50 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Upload Mode Content */}
      {uploadMode === 'file' && (
        <div className="space-y-4">
          {/* Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragging
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-gray-600 hover:border-gray-500 bg-gray-700/30'
            }`}
          >
            <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragging ? 'text-blue-400' : 'text-gray-400'}`} />
            <p className="text-gray-300 font-medium mb-1">
              Dra och släpp filer här
            </p>
            <p className="text-sm text-gray-400 mb-4">
              eller klicka för att välja filer
            </p>
            <p className="text-xs text-gray-500">
              Accepterade format: PDF, DOCX, TXT (max {maxFileSize}MB)
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedFileTypes}
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-300">Valda filer ({selectedFiles.length})</h4>
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg border border-gray-600"
                >
                  {getFileIcon(file.name)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{file.name}</p>
                    <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile(index);
                    }}
                    className="p-1 hover:bg-gray-600 rounded transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {uploadMode === 'url' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              URL till dokument
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/document.pdf"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            />
            <p className="text-xs text-gray-400 mt-2">
              Ange URL till en PDF, webbsida eller annat dokument som ska laddas ned och processas.
            </p>
          </div>
        </div>
      )}

      {uploadMode === 'text' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Titel
            </label>
            <input
              type="text"
              value={textTitle}
              onChange={(e) => setTextTitle(e.target.value)}
              placeholder="t.ex. Produktöversikt"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Innehåll
            </label>
            <textarea
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              rows={12}
              placeholder="Klistra in text här..."
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none resize-none font-mono text-sm"
            />
            <p className="text-xs text-gray-400 mt-2">
              Klistra in produktinformation, FAQ:er, eller annat textinnehåll direkt.
            </p>
          </div>
        </div>
      )}

      {/* Upload Button */}
      <div className="flex justify-end">
        <button
          onClick={handleUpload}
          disabled={!canUpload}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          {uploadMode === 'file' ? 'Ladda upp filer' : uploadMode === 'url' ? 'Hämta från URL' : 'Lägg till text'}
        </button>
      </div>
    </div>
  );
};
