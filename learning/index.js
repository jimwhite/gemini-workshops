import { compile, enhance, parse, LISP, UTILS, verify } from 'fez-lisp'
import { readFileSync, writeFileSync } from 'fs'
export const dev = (source, types) => {
  try {
    const parsed = parse(source)
    const { evaluated, type, error } = UTILS.debug(parsed, true, types)
    if (error == null) {
      if (type) {
        UTILS.logType(type)
      }
      UTILS.logResult(LISP.serialise(evaluated))
    } else UTILS.logError(error.message)
  } catch (error) {
    UTILS.logError(error.message)
  }
}
export const run = (source) => {
  try {
    const parsed = parse(source)
    const { evaluated, error } = UTILS.debug(parsed, false)
    if (error == null) {
      UTILS.logResult(LISP.serialise(evaluated))
    } else UTILS.logError(error.message)
  } catch (error) {
    UTILS.logError(error.message)
  }
}
export const check = (source, types) => {
  try {
    const parsed = parse(source)
    const error = verify(parsed, types)
    if (error != null) UTILS.logError(error)
  } catch (error) {
    UTILS.logError(error.message)
  }
}
export const comp = (source) => compile(enhance(parse(source)))
const file = readFileSync('./src/main.lisp', 'utf-8')
const [src, typ] = UTILS.extractTypes(file)
switch (process.argv[2]) {
  case 'check':
    check(src, typ)
    break
  case 'run':
    run(src, typ)
    break
  case 'comp':
    writeFileSync(
      './src/main.js',
      'var _ = ' + comp(src) + '; console.log(_)'
    )
    break
  case 'dev':
  default:
    dev(src, typ)
    break
}