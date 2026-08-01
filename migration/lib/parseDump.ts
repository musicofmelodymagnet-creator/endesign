import fs from 'fs'

let cachedSql: string | null = null

function readDump(dumpPath: string): string {
  if (!cachedSql) {
    cachedSql = fs.readFileSync(dumpPath, 'utf8')
  }
  return cachedSql
}

function splitTuples(valuesStr: string): string[] {
  const tuples: string[] = []
  let depth = 0
  let inStr = false
  let start = -1
  for (let i = 0; i < valuesStr.length; i++) {
    const c = valuesStr[i]
    if (inStr) {
      if (c === '\\') {
        i++
        continue
      }
      if (c === "'") inStr = false
      continue
    }
    if (c === "'") {
      inStr = true
      continue
    }
    if (c === '(') {
      if (depth === 0) start = i + 1
      depth++
    } else if (c === ')') {
      depth--
      if (depth === 0) {
        tuples.push(valuesStr.slice(start, i))
      }
    }
  }
  return tuples
}

function splitFields(tupleStr: string): (string | null)[] {
  const fields: string[] = []
  let inStr = false
  let cur = ''
  for (let i = 0; i < tupleStr.length; i++) {
    const c = tupleStr[i]
    if (inStr) {
      if (c === '\\') {
        cur += c + tupleStr[i + 1]
        i++
        continue
      }
      if (c === "'") {
        inStr = false
        cur += c
        continue
      }
      cur += c
      continue
    }
    if (c === "'") {
      inStr = true
      cur += c
      continue
    }
    if (c === ',') {
      fields.push(cur)
      cur = ''
      continue
    }
    cur += c
  }
  fields.push(cur)

  // mysqldump backslash-escapes \, ', ", \n and \r uniformly inside single-quoted
  // string literals. Un-escape in a single left-to-right pass so combinations like
  // \\" (an escaped backslash followed by an escaped quote) don't get mangled by
  // sequential whole-string replaces.
  const unescape = (s: string) =>
    s.replace(/\\(.)/g, (_, ch: string) => {
      if (ch === 'n') return '\n'
      if (ch === 'r') return ''
      return ch // \\ -> \, \' -> ', \" -> ", anything else -> itself
    })

  return fields.map((f) => {
    f = f.trim()
    if (f === 'NULL') return null
    if (f.startsWith("'") && f.endsWith("'")) {
      return unescape(f.slice(1, -1))
    }
    return f
  })
}

/** Parses every `INSERT INTO \`tableName\` ... VALUES (...), (...);` statement in a mysqldump file into raw row tuples. */
export function parseTable(dumpPath: string, tableName: string): (string | null)[][] {
  const sql = readDump(dumpPath)
  const marker = 'INSERT INTO `' + tableName + '`'
  let searchFrom = 0
  const statements: string[] = []

  while (true) {
    const idx = sql.indexOf(marker, searchFrom)
    if (idx === -1) break
    let i = idx
    let inStr = false
    let depth = 0
    for (; i < sql.length; i++) {
      const c = sql[i]
      if (inStr) {
        if (c === '\\') {
          i++
          continue
        }
        if (c === "'") inStr = false
        continue
      }
      if (c === "'") {
        inStr = true
        continue
      }
      if (c === '(') depth++
      else if (c === ')') depth--
      else if (c === ';' && depth === 0) break
    }
    statements.push(sql.slice(idx, i))
    searchFrom = i + 1
  }

  let allTuples: string[] = []
  for (const stmt of statements) {
    const valuesIdx = stmt.indexOf('VALUES')
    const valuesStr = stmt.slice(valuesIdx + 6)
    allTuples = allTuples.concat(splitTuples(valuesStr))
  }

  return allTuples.map(splitFields)
}

/** Extracts the `CREATE TABLE` column order so callers can build name->index maps without hardcoding positions. */
export function parseColumns(dumpPath: string, tableName: string): string[] {
  const sql = readDump(dumpPath)
  const marker = 'CREATE TABLE `' + tableName + '`'
  const start = sql.indexOf(marker)
  if (start === -1) throw new Error(`Table ${tableName} not found in dump`)
  const end = sql.indexOf(') ENGINE', start)
  const body = sql.slice(start, end)
  const columns: string[] = []
  const lineRe = /^\s*`([a-zA-Z0-9_]+)`/gm
  let match: RegExpExecArray | null
  while ((match = lineRe.exec(body))) {
    columns.push(match[1])
  }
  return columns
}

export type RowMapper<T> = (row: (string | null)[], col: (name: string) => (string | null)) => T

export function parseTableAsObjects<T>(dumpPath: string, tableName: string, mapper: RowMapper<T>): T[] {
  const columns = parseColumns(dumpPath, tableName)
  const rows = parseTable(dumpPath, tableName)
  return rows.map((row) => mapper(row, (name: string) => row[columns.indexOf(name)] ?? null))
}
