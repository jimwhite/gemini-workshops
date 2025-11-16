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

import PythonScratchpad from './PythonScratchpad';
import LispScratchpad from './LispScratchpad';

type CodeScratchpadProps = {
  language: 'python' | 'lisp';
  starterCode?: string;
  onExecute?: (code: string, output: string, error: string | null) => void;
  onCodeChange?: (code: string) => void;
};

export default function CodeScratchpad({
  language,
  starterCode,
  onExecute,
  onCodeChange
}: CodeScratchpadProps) {
  if (language === 'lisp') {
    return (
      <LispScratchpad
        starterCode={starterCode}
        onExecute={onExecute}
        onCodeChange={onCodeChange}
      />
    );
  }
  
  return (
    <PythonScratchpad
      starterCode={starterCode}
      onExecute={onExecute}
      onCodeChange={onCodeChange}
    />
  );
}
