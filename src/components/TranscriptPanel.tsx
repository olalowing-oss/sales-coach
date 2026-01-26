import React, { useEffect, useRef } from 'react';
import { MessageSquare } from 'lucide-react';
import { TranscriptSegment } from '../types';

interface TranscriptPanelProps {
  segments: TranscriptSegment[];
  interimText: string;
  isListening: boolean;
}

export const TranscriptPanel: React.FC<TranscriptPanelProps> = ({
  segments,
  interimText,
  isListening
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll till botten när ny text kommer
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [segments, interimText]);

  const formatTime = (timestamp: number): string => {
    const totalSeconds = Math.floor(timestamp / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gray-800 rounded-xl overflow-hidden flex flex-col h-[600px]">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-700 flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-blue-400" />
        <h2 className="font-semibold">Transkription</h2>
        <span className="ml-auto text-sm text-gray-500">
          {segments.length} segment
        </span>
      </div>

      {/* Transcript content */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3"
      >
        {segments.length === 0 && !interimText && !isListening && (
          <div className="text-center text-gray-500 py-12">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>Klicka på "Starta samtal" för att börja</p>
            <p className="text-sm mt-2">Transkriptionen visas här i realtid</p>
          </div>
        )}

        {segments.length === 0 && !interimText && isListening && (
          <div className="text-center text-gray-500 py-12">
            <div className="flex justify-center mb-4">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
            <p>Lyssnar på samtalet...</p>
            <p className="text-sm mt-2">Börja prata så transkriberas det automatiskt</p>
          </div>
        )}

        {/* Finala segment */}
        {segments.map((segment) => (
          <div 
            key={segment.id}
            className="group"
          >
            <div className="flex items-start gap-3">
              <span className="text-xs text-gray-500 pt-1 w-12 flex-shrink-0">
                {formatTime(segment.timestamp)}
              </span>
              <div className="flex-1">
                <p className="text-gray-200 leading-relaxed">
                  {segment.text}
                </p>
                {/* Confidence indicator */}
                <div className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs text-gray-500">
                    Konfidens: {Math.round(segment.confidence * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Interim text (visas under transkribering) */}
        {interimText && (
          <div className="flex items-start gap-3">
            <span className="text-xs text-gray-500 pt-1 w-12 flex-shrink-0">
              --:--
            </span>
            <div className="flex-1">
              <p className="text-gray-400 italic leading-relaxed">
                {interimText}
                <span className="inline-block w-2 h-4 bg-blue-400 ml-1 animate-pulse"></span>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer with stats */}
      <div className="px-4 py-2 border-t border-gray-700 text-xs text-gray-500 flex items-center justify-between">
        <span>
          {segments.reduce((acc, s) => acc + s.text.split(' ').length, 0)} ord
        </span>
        {segments.length > 0 && (
          <span>
            Längd: {formatTime(segments[segments.length - 1]?.timestamp || 0)}
          </span>
        )}
      </div>
    </div>
  );
};
