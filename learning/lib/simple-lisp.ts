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

/**
 * Simple Lisp interpreter for PAIP Chapter 1 exercises
 * Supports basic arithmetic, quote, list operations, and function definitions
 */

type LispValue = number | string | boolean | null | LispValue[];
type LispFunction = (...args: LispValue[]) => LispValue;
type LispEnvValue = LispValue | LispFunction;

interface LispEnvironment {
  [key: string]: LispEnvValue;
}

export class SimpleLisp {
  private env: LispEnvironment;
  private output: string[] = [];

  constructor() {
    this.env = this.createGlobalEnvironment();
  }

  private createGlobalEnvironment(): LispEnvironment {
    return {
      // Arithmetic operations
      '+': (...args: LispValue[]) => (args as number[]).reduce((a, b) => a + b, 0),
      '-': (...args: LispValue[]) => {
        const nums = args as number[];
        return nums.length === 1 ? -nums[0] : nums.reduce((a, b) => a - b);
      },
      '*': (...args: LispValue[]) => (args as number[]).reduce((a, b) => a * b, 1),
      '/': (...args: LispValue[]) => {
        const nums = args as number[];
        return nums.reduce((a, b) => a / b);
      },
      
      // Comparison operations
      '=': (a: LispValue, b: LispValue) => a === b,
      '<': (a: LispValue, b: LispValue) => (a as number) < (b as number),
      '>': (a: LispValue, b: LispValue) => (a as number) > (b as number),
      '<=': (a: LispValue, b: LispValue) => (a as number) <= (b as number),
      '>=': (a: LispValue, b: LispValue) => (a as number) >= (b as number),
      
      // List operations
      'list': (...args: LispValue[]) => args,
      'cons': (a: LispValue, b: LispValue) => [a, ...(Array.isArray(b) ? b : [b])],
      'car': (list: LispValue) => (list as LispValue[])[0],
      'cdr': (list: LispValue) => (list as LispValue[]).slice(1),
      'length': (list: LispValue) => Array.isArray(list) ? list.length : 0,
      'append': (...lists: LispValue[]) => 
        (lists as LispValue[][]).reduce((acc, list) => [...acc, ...list], []),
      
      // Type predicates
      'atom': (x: LispValue) => !Array.isArray(x),
      'null': (x: LispValue) => x === null || (Array.isArray(x) && x.length === 0),
      'numberp': (x: LispValue) => typeof x === 'number',
      'symbolp': (x: LispValue) => typeof x === 'string',
      
      // Boolean operations
      'and': (...args: LispValue[]) => args.every(x => x !== false && x !== null),
      'or': (...args: LispValue[]) => args.some(x => x !== false && x !== null),
      'not': (x: LispValue) => !x,
      
      // I/O operations
      'print': (...args: LispValue[]) => {
        const output = args.map(arg => this.stringify(arg)).join(' ');
        this.output.push(output);
        return null;
      },
      
      // Constants
      't': true,
      'nil': null,
    };
  }

  private stringify(value: LispValue): string {
    if (value === null) return 'NIL';
    if (value === true) return 'T';
    if (value === false) return 'NIL';
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'string') return value;
    if (Array.isArray(value)) {
      return '(' + value.map(v => this.stringify(v)).join(' ') + ')';
    }
    return String(value);
  }

  private parse(input: string): LispValue[] {
    const tokens = this.tokenize(input);
    const result: LispValue[] = [];
    let i = 0;

    while (i < tokens.length) {
      const [expr, nextIndex] = this.parseExpression(tokens, i);
      result.push(expr);
      i = nextIndex;
    }

    return result;
  }

  private tokenize(input: string): string[] {
    return input
      .replace(/\(/g, ' ( ')
      .replace(/\)/g, ' ) ')
      .replace(/'/g, " ' ")
      .trim()
      .split(/\s+/)
      .filter(token => token.length > 0);
  }

  private parseExpression(tokens: string[], index: number): [LispValue, number] {
    const token = tokens[index];

    if (token === '(') {
      const list: LispValue[] = [];
      let i = index + 1;

      while (i < tokens.length && tokens[i] !== ')') {
        const [expr, nextIndex] = this.parseExpression(tokens, i);
        list.push(expr);
        i = nextIndex;
      }

      if (i >= tokens.length) {
        throw new Error('Unmatched opening parenthesis');
      }

      return [list, i + 1];
    }

    if (token === ')') {
      throw new Error('Unexpected closing parenthesis');
    }

    if (token === "'") {
      const [expr, nextIndex] = this.parseExpression(tokens, index + 1);
      return [['quote', expr], nextIndex];
    }

    // Parse numbers
    if (!isNaN(Number(token))) {
      return [Number(token), index + 1];
    }

    // Parse symbols (strings) - keep as lowercase for now
    return [token.toLowerCase(), index + 1];
  }

  private evaluateExpression(expr: LispValue, env: LispEnvironment = this.env): LispValue {
    // Self-evaluating expressions
    if (typeof expr === 'number') return expr;
    if (expr === null || expr === true || expr === false) return expr;

    // Variable lookup
    if (typeof expr === 'string') {
      const value = env[expr];
      if (value === undefined) {
        throw new Error(`Undefined symbol: ${expr}`);
      }
      // Functions are stored in environment but not directly returned as values
      if (typeof value === 'function') {
        throw new Error(`Cannot use function ${expr} as value (missing parentheses?)`);
      }
      return value;
    }

    // List expressions
    if (Array.isArray(expr)) {
      if (expr.length === 0) return null;

      const first = expr[0];

      // Special forms
      if (first === 'quote') {
        return expr[1];
      }

      if (first === 'if') {
        const condition = this.evaluateExpression(expr[1], env);
        return condition ? this.evaluateExpression(expr[2], env) : this.evaluateExpression(expr[3], env);
      }

      if (first === 'defun') {
        const name = expr[1] as string;
        const params = expr[2] as string[];
        const body = expr.slice(3);
        env[name] = (...args: LispValue[]) => {
          const localEnv = { ...env };
          params.forEach((param, i) => {
            localEnv[param] = args[i];
          });
          let result: LispValue = null;
          for (const form of body) {
            result = this.evaluateExpression(form, localEnv);
          }
          return result;
        };
        return name;
      }

      // Function application
      let fn: LispEnvValue;
      if (typeof first === 'string') {
        fn = env[first];
      } else {
        fn = this.evaluateExpression(first, env);
      }
      
      if (typeof fn !== 'function') {
        throw new Error(`Not a function: ${this.stringify(first)}`);
      }

      const args = expr.slice(1).map(arg => this.evaluateExpression(arg, env));
      return fn(...args);
    }

    throw new Error(`Cannot evaluate: ${this.stringify(expr)}`);
  }

  public evaluate(code: string): { result: string; output: string } {
    this.output = [];

    try {
      const expressions = this.parse(code);
      let lastResult: LispValue = null;

      for (const expr of expressions) {
        lastResult = this.evaluateExpression(expr, this.env);
      }

      const result = this.stringify(lastResult);
      const output = this.output.length > 0 ? this.output.join('\n') + '\n' + result : result;

      return { result, output };
    } catch (error) {
      throw error;
    }
  }
}
