declare module 'fez-lisp' {
  export default class Lisp {
    constructor();
    evaluate(code: string): unknown;
  }
}
