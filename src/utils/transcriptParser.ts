/**
 * Parser for various transcript formats (Teams VTT, plain text, etc.)
 */

export interface ParsedTranscript {
  fullText: string;
  segments: TranscriptSegment[];
  participants: string[];
  duration?: number;
  metadata?: {
    meetingDate?: Date;
    format: 'vtt' | 'text' | 'teams-copy';
  };
}

export interface TranscriptSegment {
  speaker: string;
  text: string;
  timestamp?: string;
  startTime?: number; // seconds
  endTime?: number; // seconds
}

/**
 * Parse Teams VTT format transcript
 *
 * Example VTT format:
 * WEBVTT
 *
 * 00:00:05.000 --> 00:00:08.000
 * <v Speaker Name>Text here</v>
 */
function parseVTT(vttContent: string): ParsedTranscript {
  const lines = vttContent.split('\n');
  const segments: TranscriptSegment[] = [];
  const participants = new Set<string>();

  let currentTimestamp: string | undefined;
  let startTime: number | undefined;
  let endTime: number | undefined;
  let maxTime = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Skip WEBVTT header and empty lines
    if (!line || line === 'WEBVTT') continue;

    // Parse timestamp line (e.g., "00:00:05.000 --> 00:00:08.000")
    const timestampMatch = line.match(/(\d{2}:\d{2}:\d{2}\.\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}\.\d{3})/);
    if (timestampMatch) {
      currentTimestamp = timestampMatch[1];
      startTime = parseVTTTime(timestampMatch[1]);
      endTime = parseVTTTime(timestampMatch[2]);
      maxTime = Math.max(maxTime, endTime);
      continue;
    }

    // Parse speaker and text (e.g., "<v John Doe>Hello everyone</v>")
    const speakerMatch = line.match(/<v\s+([^>]+)>(.+?)<\/v>/);
    if (speakerMatch && currentTimestamp) {
      const speaker = speakerMatch[1].trim();
      const text = speakerMatch[2].trim();

      participants.add(speaker);
      segments.push({
        speaker,
        text,
        timestamp: currentTimestamp,
        startTime,
        endTime
      });
      continue;
    }

    // Alternative format: speaker on separate line
    if (line.includes(':') && i + 1 < lines.length) {
      const parts = line.split(':');
      if (parts.length >= 2) {
        const potentialSpeaker = parts[0].trim();
        const restOfLine = parts.slice(1).join(':').trim();

        // Check if this looks like "Name: text" format
        if (potentialSpeaker.length < 50 && restOfLine) {
          participants.add(potentialSpeaker);
          segments.push({
            speaker: potentialSpeaker,
            text: restOfLine,
            timestamp: currentTimestamp,
            startTime,
            endTime
          });
        }
      }
    }
  }

  // Build full text
  const fullText = segments
    .map(s => `${s.speaker}: ${s.text}`)
    .join('\n');

  return {
    fullText,
    segments,
    participants: Array.from(participants),
    duration: maxTime > 0 ? Math.ceil(maxTime) : undefined,
    metadata: {
      format: 'vtt'
    }
  };
}

/**
 * Parse plain text transcript with speaker labels
 *
 * Example formats:
 * "Speaker Name: Text here"
 * "Speaker Name
 *  Text here"
 */
function parseTextTranscript(textContent: string): ParsedTranscript {
  const lines = textContent.split('\n');
  const segments: TranscriptSegment[] = [];
  const participants = new Set<string>();

  let currentSpeaker: string | null = null;
  let currentText = '';

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) {
      // Empty line - save current segment if exists
      if (currentSpeaker && currentText) {
        participants.add(currentSpeaker);
        segments.push({
          speaker: currentSpeaker,
          text: currentText.trim()
        });
        currentText = '';
      }
      continue;
    }

    // Check for "Speaker: Text" format
    const colonMatch = trimmedLine.match(/^([^:]+):\s*(.*)$/);
    if (colonMatch) {
      // Save previous segment
      if (currentSpeaker && currentText) {
        participants.add(currentSpeaker);
        segments.push({
          speaker: currentSpeaker,
          text: currentText.trim()
        });
      }

      currentSpeaker = colonMatch[1].trim();
      currentText = colonMatch[2].trim();
      continue;
    }

    // Check for standalone speaker name (short line, likely a name)
    if (trimmedLine.length < 50 && !trimmedLine.includes('.') && /^[A-ZÅÄÖ]/.test(trimmedLine)) {
      // Save previous segment
      if (currentSpeaker && currentText) {
        participants.add(currentSpeaker);
        segments.push({
          speaker: currentSpeaker,
          text: currentText.trim()
        });
      }

      currentSpeaker = trimmedLine;
      currentText = '';
      continue;
    }

    // Continuation of current speaker's text
    if (currentSpeaker) {
      currentText += (currentText ? ' ' : '') + trimmedLine;
    } else {
      // No speaker identified yet, assume first speaker
      currentSpeaker = 'Okänd talare';
      currentText = trimmedLine;
    }
  }

  // Save final segment
  if (currentSpeaker && currentText) {
    participants.add(currentSpeaker);
    segments.push({
      speaker: currentSpeaker,
      text: currentText.trim()
    });
  }

  // Build full text
  const fullText = segments
    .map(s => `${s.speaker}: ${s.text}`)
    .join('\n');

  return {
    fullText,
    segments,
    participants: Array.from(participants),
    metadata: {
      format: 'text'
    }
  };
}

/**
 * Parse Teams copy-paste format
 * Teams often uses format like:
 * "10:30 AM | Speaker Name
 *  Text here"
 */
function parseTeamsCopyPaste(content: string): ParsedTranscript {
  const lines = content.split('\n');
  const segments: TranscriptSegment[] = [];
  const participants = new Set<string>();

  let currentSpeaker: string | null = null;
  let currentTimestamp: string | null = null;
  let currentText = '';

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) {
      // Save current segment
      if (currentSpeaker && currentText) {
        participants.add(currentSpeaker);
        segments.push({
          speaker: currentSpeaker,
          text: currentText.trim(),
          timestamp: currentTimestamp || undefined
        });
        currentText = '';
      }
      continue;
    }

    // Check for Teams timestamp format "10:30 AM | Speaker Name"
    const teamsMatch = trimmedLine.match(/^(\d{1,2}:\d{2}\s*[AP]M)\s*\|\s*(.+)$/i);
    if (teamsMatch) {
      // Save previous segment
      if (currentSpeaker && currentText) {
        participants.add(currentSpeaker);
        segments.push({
          speaker: currentSpeaker,
          text: currentText.trim(),
          timestamp: currentTimestamp || undefined
        });
      }

      currentTimestamp = teamsMatch[1];
      currentSpeaker = teamsMatch[2].trim();
      currentText = '';
      continue;
    }

    // Continuation of text
    currentText += (currentText ? ' ' : '') + trimmedLine;
  }

  // Save final segment
  if (currentSpeaker && currentText) {
    participants.add(currentSpeaker);
    segments.push({
      speaker: currentSpeaker,
      text: currentText.trim(),
      timestamp: currentTimestamp || undefined
    });
  }

  // Build full text
  const fullText = segments
    .map(s => `${s.speaker}: ${s.text}`)
    .join('\n');

  return {
    fullText,
    segments,
    participants: Array.from(participants),
    metadata: {
      format: 'teams-copy'
    }
  };
}

/**
 * Auto-detect format and parse transcript
 */
export function parseTranscript(content: string): ParsedTranscript {
  const trimmed = content.trim();

  // Check for VTT format
  if (trimmed.startsWith('WEBVTT') || trimmed.includes('-->')) {
    return parseVTT(content);
  }

  // Check for Teams copy-paste format (has timestamps like "10:30 AM |")
  if (/\d{1,2}:\d{2}\s*[AP]M\s*\|/i.test(trimmed)) {
    return parseTeamsCopyPaste(content);
  }

  // Default to plain text parsing
  return parseTextTranscript(content);
}

/**
 * Convert VTT timestamp to seconds
 * Format: "00:00:05.000"
 */
function parseVTTTime(timeString: string): number {
  const parts = timeString.split(':');
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  const secondsParts = parts[2].split('.');
  const seconds = parseInt(secondsParts[0], 10);
  const milliseconds = parseInt(secondsParts[1], 10);

  return hours * 3600 + minutes * 60 + seconds + milliseconds / 1000;
}

/**
 * Validate parsed transcript
 */
export function validateTranscript(parsed: ParsedTranscript): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!parsed.fullText || parsed.fullText.length < 10) {
    errors.push('Transkriptionen är för kort (mindre än 10 tecken)');
  }

  if (parsed.segments.length === 0) {
    errors.push('Inga talsegment kunde identifieras');
  }

  if (parsed.participants.length === 0) {
    errors.push('Inga deltagare kunde identifieras');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Format transcript for display
 */
export function formatTranscriptForDisplay(parsed: ParsedTranscript): string {
  return parsed.segments
    .map(s => {
      const timestamp = s.timestamp ? `[${s.timestamp}] ` : '';
      return `${timestamp}${s.speaker}:\n${s.text}\n`;
    })
    .join('\n');
}
