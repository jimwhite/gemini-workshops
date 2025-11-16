/**
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

type LispScratchpadProps = {
  starterCode?: string;
  onExecute?: (code: string, output: string, error: string | null) => void;
  onCodeChange?: (code: string) => void;
};

export default function LispScratchpad({ 
  starterCode = '', 
  onExecute,
  onCodeChange
}: LispScratchpadProps) {
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const jsclRef = useRef<any>(null);

  // Initialize JSCL on mount
  useEffect(() => {
    async function loadJSCL() {
      try {
        // Wait for JSCL to be available from CDN
        const maxAttempts = 50; // 5 seconds
        let attempts = 0;
        
        while (attempts < maxAttempts) {
          // @ts-ignore - JSCL loads from CDN
          if (typeof window.jscl !== 'undefined') {
            // @ts-ignore
            jsclRef.current = window.jscl;
            setIsLoading(false);
            console.log('✅ JSCL (Common Lisp) loaded successfully');
            return;
          }
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }
        
        throw new Error('JSCL failed to load within timeout period');
      } catch (err) {
        console.error('Failed to load JSCL:', err);
        setError('Failed to initialize Lisp environment');
        setIsLoading(false);
      }
    }

    loadJSCL();
  }, []);

  const runCode = async () => {
    if (!jsclRef.current) {
      setError('Lisp environment not ready');
      return;
    }

    setIsRunning(true);
    setError(null);
    setOutput('');

    try {
      const jscl = jsclRef.current;
      
      // Capture output by redirecting *standard-output*
      let capturedOutput = '';
      
      // Store original console.log
      const originalLog = console.log;
      
      // Override console.log to capture output
      console.log = (...args: any[]) => {
        capturedOutput += args.map(arg => 
          typeof arg === 'string' ? arg : JSON.stringify(arg)
        ).join(' ') + '\n';
      };

      try {
        // Evaluate the Lisp code
        const result = jscl.evaluateString(code);
        
        // Add result to output if it's not undefined/nil
        if (result !== undefined && result !== null) {
          capturedOutput += String(result);
        }
        
        setOutput(capturedOutput || '(no output)');
        onExecute?.(code, capturedOutput, null);
      } finally {
        // Restore console.log
        console.log = originalLog;
      }
      
    } catch (err: any) {
      const errorMsg = err.message || 'Execution error';
      setError(errorMsg);
      onExecute?.(code, '', errorMsg);
    } finally {
      setIsRunning(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Ctrl/Cmd + Enter to run
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      runCode();
    }
    
    // Tab support in textarea
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.target as HTMLTextAreaElement;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      setCode(code.substring(0, start) + '    ' + code.substring(end));
      
      // Move cursor after inserted spaces
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 4;
      }, 0);
    }
  };

  return (
    <div className="flex flex-col h-full border rounded-lg bg-slate-50">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-purple-800 text-white rounded-t-lg">
        <span className="text-sm font-medium">🔮 Lisp Workspace</span>
        <div className="flex gap-2">
          <Button
            onClick={runCode}
            disabled={isLoading || isRunning}
            size="sm"
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isRunning ? '⏳ Running...' : '▶️ Run (Ctrl+Enter)'}
          </Button>
          <Button
            onClick={() => {
              setCode(starterCode);
              setOutput('');
              setError(null);
            }}
            size="sm"
            variant="outline"
            className="text-purple-200 border-purple-600 hover:bg-purple-700"
          >
            🔄 Reset
          </Button>
        </div>
      </div>

      {/* Code editor */}
      <div className="flex-1 p-3">
        <Textarea
          value={code}
          onChange={(e) => {
            const newCode = e.target.value;
            // If current code is still the starter code and user is typing,
            // clear it and use only what they typed (like placeholder behavior)
            if (code === starterCode && newCode.length > code.length) {
              const typedChar = newCode.charAt(newCode.length - 1);
              setCode(typedChar);
              onCodeChange?.(typedChar);
            } else {
              setCode(newCode);
              onCodeChange?.(newCode);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={isLoading ? "Loading Lisp..." : starterCode}
          disabled={isLoading}
          className="font-mono text-sm h-full resize-none bg-white"
          style={{ minHeight: '200px' }}
        />
      </div>

      {/* Output area */}
      {(output || error) && (
        <div className="border-t p-3 bg-slate-900 text-white rounded-b-lg">
          <div className="text-xs font-medium mb-1 text-slate-400">OUTPUT:</div>
          {error ? (
            <pre className="text-xs text-red-400 font-mono whitespace-pre-wrap">{error}</pre>
          ) : (
            <pre className="text-xs text-purple-400 font-mono whitespace-pre-wrap">{output || '(no output)'}</pre>
          )}
        </div>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <div className="border-t p-3 bg-purple-50 text-purple-800 text-sm">
          ⏳ Loading Lisp environment... (first time only, ~5-10 seconds)
        </div>
      )}
    </div>
  );
}
