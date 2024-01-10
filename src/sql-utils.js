/*
How to use

1. Go to Extensions menu -> AppScript -> Editor


2. Add the script id "1o2k7CgnuyaPD6nlp66C-NNsSd8XNbOvYIpAOZynMKaHpHd3A91UtTfud"
  in Libraries section

3. Open any code file and create a wrapper function to invoke the methods

function LIB(fname, ...args) {
  return sutils[fname](...args)
}

4. now we can use the method in cell formula
=LIB("SELECT", "A1:C3", "A,C")

*/


// - - - - - - - - - - - - - - - - - - - - -
//            USER DEFAULTS
// - - - - - - - - - - - - - - - - - - - - -
const SKIP_HEADER_COUNT = 'SKIP_HEADER_COUNT'
const CUSTOM_OPERATORS = 'CUSTOM_OPERATORS'

const nonce = new Date().toISOString()

ENABLE_DEBUG=true

function DEBUG(...args){
  if (ENABLE_DEBUG) console.log(...args)
}

function getNonce(){
  return nonce
}

const FALLBACK = {
  [SKIP_HEADER_COUNT] : 1,
}

function setDefault(k, v, time) {
  const currentHHMM = new Date().toLocaleTimeString().slice(0, 5)
  if (currentHHMM.indexOf(time) < 0){
    return `SET.ERROR @ Provide correct time HH:MM = ${currentHHMM}`
  }

  if (! (k in FALLBACK)) {
    return 'SET.ERROR @ Key not found'
  }

  var documentProperties = PropertiesService.getDocumentProperties();
  documentProperties.setProperty(k, JSON.stringify(v));
  return `SET.OK @ [${k}] = ${documentProperties.getProperty(k)}`
}

function removeDefault(k){
  var documentProperties = PropertiesService.getDocumentProperties();
  documentProperties.deleteProperty(k)
  return "REMOVE.OK @ " + new Date().toISOString()
}

function getAllDefaults(){
  var documentProperties = PropertiesService.getDocumentProperties();
  const defaults = documentProperties.getProperties()

  let out = ""
  for (let k in defaults) {
    if (k in FALLBACK) {
      out += `[${k}] : ${defaults[k]} \n`
    }
  }
  return "GETALL.OK @ \n" + out
}

function getDefault(k) {
  var documentProperties = PropertiesService.getDocumentProperties();
  return JSON.parse(documentProperties.getProperty(k) || null) || FALLBACK[k]
}


/* - - - - - - - - - - - - - - - - - - - - -
//            CUSTOM OPERATORS
// - - - - - - - - - - - - - - - - - - - - -

=setCustomOperator("isSubStr", "(x, y) => x.indexOf(y) >= 0", "12:27")

=invokeCustomOperator("isSubStr", "Apple", "pple")
TRUE

// =listCustomOperators("")
LIST_OP.OK @
1 : [mul] : (x, y) => x * y 
2 : [div] : (x, y) => x / y 
3 : [isSubStr] : (x, y) => x.indexOf(y) >= 0 

// - - - - - - - - - - - - - - - - - - - - -
*/
function setCustomOperator(op, lambdaString, time) {
  const currentHHMM = new Date().toLocaleTimeString().slice(0, 5)
  if (currentHHMM.indexOf(time) < 0){
    return `SET_OP.ERROR @ Provide correct time HH:MM = ${currentHHMM}`
  }

  var documentProperties = PropertiesService.getDocumentProperties();
  const operatorMap = JSON.parse(documentProperties.getProperty(CUSTOM_OPERATORS) || '{}')

  operatorMap[op] = lambdaString
  
  documentProperties.setProperty(CUSTOM_OPERATORS, JSON.stringify(operatorMap))
  return `SET_OP.OK @ ${op} ${new Date().toISOString()}`
}

function listCustomOperators() {
  var documentProperties = PropertiesService.getDocumentProperties();
  const operatorMap = JSON.parse(documentProperties.getProperty(CUSTOM_OPERATORS) || '{}')

  let out = ""
  let i = 1
  for (let k in operatorMap) {
    out += `${i} : [${k}] : ${operatorMap[k]} \n`
    i += 1
  }
  return "LIST_OP.OK @\n" + out
}

function invokeCustomOperator(op, x, y) {
  var documentProperties = PropertiesService.getDocumentProperties();
  const operatorMap = JSON.parse(documentProperties.getProperty(CUSTOM_OPERATORS) || '{}')

  const fString = operatorMap[op]
  if (! fString) {
    return `INVOKE.ERROR @ ${op} not found`
  }

  const f = eval(fString)
  return f(x, y)
}

// - - - - - - - - - - - - - - - - - - - - -
//            UTILS
// - - - - - - - - - - - - - - - - - - - - -

// *A -> 0, B -> 1, *C -> 2
function parseColumnIntoIndex(column) {
  if (column[0] == '*') {
    column = column.slice(1)
  }
  const index = column.trim().charCodeAt(0) - 'A'.charCodeAt(0)
  return index
}

// 0 -> A, 2 -> C
function parseColumnIndexIntoColumnCharacter(columnIndex){
  const out = String.fromCharCode(65 + columnIndex)
  return out
}

// A, B, D becomes => [0, 1, 3]
function parseSelectionStr(selectionStr) {
  const outColumns = []
  const tokens = selectionStr.toUpperCase().split(',')

  for (const t of tokens){
    outColumns.push(parseColumnIntoIndex(t))
  }

  return outColumns
}

// "*A.Name,*B,*C.Count of Cities"
// => [{index:0, name: "Name"}, {index: 1, name: 'B'}, {index: 3, name: 'Count of Cities'}]
function parseSelectV2String(selectionV2Str, headerT) {
  const firstHeaderRow = headerT && headerT[0] || null

  const selectionStrList = selectionV2Str.split(',')
  const selList = selectionStrList.map((x) => {
    const tokens = x.trim().split('.')
    const colName = tokens[0].toUpperCase()
    const colIndex = parseColumnIntoIndex(colName)
    const providedName = tokens[1] || null
    const headerName = firstHeaderRow && firstHeaderRow[colIndex] || null
    const name = providedName || headerName || colName
    return {
      index: colIndex,
      name
    }
  })

  return selList
}

const Operations = {
  '=' : eval("(x, y) => {return x == y}"),
  '>' : eval("(x, y) => {return x > y}"),
  '<' : eval("(x, y) => {return x < y}"),
  '>=' : eval("(x, y) => {return x >= y}"),
  '<=' : eval("(x, y) => {return x <= y}"),
}

// {type: 'COLUMN', value: 'A'}
// {type: 'PRIMITIVE', value: 'A'}
function getFieldValue(row, field) {
  if (field.type == 'PRIMITIVE') return field.value

  if (field.type == 'COLUMN') {
    const columnName = field.value
    const fieldIndex = parseColumnIntoIndex(columnName)
    return row[fieldIndex] 
  }

  return field
}

function runOp(row, op, x, y) {
  const valX = getFieldValue(row, x)
  const valY = getFieldValue(row, y)

  DEBUG(JSON.stringify({msg: `runOp`, op, valX, valY}))
  
  return Operations[op](valX, valY)
}

function splitHeaders(table, headerCount){
  const top = table.slice(0, headerCount)
  const bottom = table.slice(headerCount)
  return [top, bottom]
}

function prependHeaders(table, headerTable) {
  return [
    ...headerTable,
    ...table,
  ]
}

// assuming same height
// [['a', 'b']] + [['c']] = [['a', 'b', 'c']]
function stickHeadersSide(headerTable1, headerTable2, height) {
  const comboTable = []
  for (let i=0; i<height; i++) {
    comboTable.push([...headerTable1[i], ...headerTable2[i]])
  }
  return comboTable
}

function getWorkingHeaderCount(inputHeaderCount){
  if (inputHeaderCount === undefined) {
    return getDefault(SKIP_HEADER_COUNT)
  }
  return inputHeaderCount
}

// - - - - - - - - - - - - - - - - - - - - -
//            FINAL EXPOSED METHODS = LEFT_JOIN, SELECT, WHERE
// - - - - - - - - - - - - - - - - - - - - -


/*
Assumption: for each row in table1 (e.g employee, pk=companyId)
we'll use the first matching entry in table2(e.g company) for the pk specified (companyId) 

e.g LEFT_JOIN(SheetA!A1:C3, "*B", A2:C9, "*A", 1)

OR use with SELECT
=SELECT(LEFT_JOIN(Employees!A1:C5, "*B", A1:C3, "*A", 1), "*A,*C,*E")
*/

/**
 * LEFT_JOIN based on a column. Provided column of first table will be matched with pk of second table.
 * 
 * @param {A1:C10} table1 First table to join
 * @param {"*B"} pk1ColName column from first table e.g "*B"
 * @param {Sheets2!A1:D20} table2 Second table to join
 * @param {"*C"} pk2ColName pk of the second table e.g "*C"
 * @param {1} headerCount how many rows of headers in input table
 * @return {Table} Output Table.
 * @customfunction
 * 
 * e.g
 * =LEFT_JOIN(<students>, "*B", <schools>, "*A")
 */
function LEFT_JOIN(table1, pk1ColName, table2, pk2ColName, _hCount) {
  const hCount = getWorkingHeaderCount(_hCount)

  const [header1T, data1T] = splitHeaders(table1, hCount)
  const [header2T, data2T] = splitHeaders(table2, hCount)

  const pk1 = parseColumnIntoIndex(pk1ColName)
  const pk2 = parseColumnIntoIndex(pk2ColName)
  const t2Map = {}
  for (const row of data2T) {
    const k = row[pk2]
    t2Map[k] = row
  }

  const outTable = []
  for (const row of data1T) {
    const k = row[pk1]
    const t2Match = t2Map[k] || []

    const fullRow = [...row, ...t2Match]
    outTable.push(fullRow)
  }

  const comboHeaderTable = stickHeadersSide(header1T, header2T, hCount)
  return prependHeaders(outTable, comboHeaderTable)
}

/**
 * Select with rename option =SELECT(C2:D24, "*A,*B.Count of Videos")
 * 
 * @param {C2:D24} table Selection Range as input table.
 * @param {"*A,*B AS Name"} selectionString e.g "*A,*B.Count of Videos"
 * @param {1} headerCount OPTIONAL how many rows of headers in input table
 * @return {Table} Output Table.
 * @customfunction
 * 
 * =SELECT(GROUP_BY(Sheet3!A1:Z100, "*H", "COUNT *A"), "*A,*B.Count Of Videos")
 * =SELECT(C2:D24, "*A,*B.Count of Videos")
 *
 * // without headers available (headerCount=0)
 * =SELECT(C3:D24, "*A,*'Video Count' AS 'Count of Videos'", 0)
 */
function SELECT(table, selectionV2Str, headerCount) {
  const [headerT, dataT] = splitHeaders(table, getWorkingHeaderCount(headerCount))

  // {"type":"SELECT","value":[{"exp":{"type":"COLUMN","value":"name"},"rename":"MyName"}]}
  const selectTree = JSON.parse(L_PARSE("<SELECT>" + selectionV2Str))
  const columnNameMap = buildColumnNameMap(headerT[0] || [])
  const columnList = selectTree.value
  columnList.map((singleSelect) => replaceColumnNameInColumnExpr(singleSelect.exp, columnNameMap))

  // const outColList = parseSelectV2String(selectionV2Str, headerT)
  const outTable = []
  for (const fullRow of dataT) {
    const subRow = []
    for (const colInfo of columnList){
      subRow.push(getFieldValue(fullRow, colInfo.exp))
    }
    outTable.push(subRow)
  }

  const outHeaderRow = columnList.map((colInfo) => {
    const newName = colInfo.rename || getFieldValue(headerT[0], colInfo.exp)
    return newName
  })

  return prependHeaders(outTable, [outHeaderRow])
}

// - - - - - - - - - - - - - - - - - - - - -
//            OPERATOR FUNCTIONS for WHERE
// - - - - - - - - - - - - - - - - - - - - -

function runCompositeOp(opObject, row) {
  const x = opObject
  if (x.type == 'COMPARE') {
    return runOp(row, x.op, x.col1, x.col2)
  }
  if (x.type == 'OR') {
    return runCompositeOp(x.op1, row) || runCompositeOp(x.op2, row)
  }
  if (x.type == 'AND') {
    return runCompositeOp(x.op1, row) && runCompositeOp(x.op2, row)
  }

  throw new Error(`Invalid Composite Op Type ${x.type}`)
}


// A33
function getCellRefValue(cellRef){
  const value = SpreadsheetApp.getActiveSheet().getRange(cellRef).getValue();
  return value
}

function replaceCellRefInBaseClause(baseTree) {
  const col1 = baseTree.col1
  if (col1.type == 'CELLREF') {
    baseTree.col1 = {
      type: 'PRIMITIVE',
      value: getCellRefValue(col1.value)
    }
  }

  const col2 = baseTree.col2
  if (col2.type == 'CELLREF') {
    baseTree.col2 = {
      type: 'PRIMITIVE',
      value: getCellRefValue(col2.value)
    }
  }
}

function replaceCellRefInWhereTree(whereTree) {
  if (whereTree.type == 'AND' || whereTree.type == 'OR') {
    replaceCellRefInWhereTree(whereTree.op1)
    replaceCellRefInWhereTree(whereTree.op2)
  }
  else if (whereTree.type == 'COMPARE') {
    replaceCellRefInBaseClause(whereTree)
  }
  else {
    throw new Error(`Unsupported type ${whereTree.type}`)
  }
}


// 'Name' -> C or 'Name' (default)
function getColumnNameReplacement(inputCol, columnNameMap){
  const columnName = inputCol.toLowerCase().trim() // remove the first char (*) & normalize
  if (columnNameMap[columnName]) {
    return `${columnNameMap[columnName]}`
  }
  return inputCol
}

function replaceColumnNameInColumnExpr(colExpr, columnNameMap) {
  if (colExpr.type == 'COLUMN') {
    colExpr.value = getColumnNameReplacement(colExpr.value, columnNameMap)
  }
}

function replaceColumnNameInCompareClause(baseTree, columnNameMap) {
  replaceColumnNameInColumnExpr(baseTree.col1, columnNameMap)
  replaceColumnNameInColumnExpr(baseTree.col2, columnNameMap)
}


function replaceColumnNameInWhereTree(whereTree, columnNameMap) {
  if (whereTree.type == 'AND' || whereTree.type == 'OR') {
    replaceColumnNameInWhereTree(whereTree.op1, columnNameMap)
    replaceColumnNameInWhereTree(whereTree.op2, columnNameMap)
  }
  else if (whereTree.type == 'COMPARE') {
    replaceColumnNameInCompareClause(whereTree, columnNameMap)
  }
  else {
    throw new Error(`Unsupported type ${whereTree.type}`)
  }
}

function buildColumnNameMap(headerRow){
  const out = {}
  for (let i in headerRow) {
    const name = headerRow[i]
    const canonicalName = name.trim().toLowerCase()
    out[canonicalName] = parseColumnIndexIntoColumnCharacter(parseInt(i))
  }
  return out
}

/**
 * WHERE clause
 * 
 * @param {E2:H6} table Selection Range as input table.
 * @param {"*A = 2 AND *B='Bob'"} opHumanString where expression e.g "*A = 'Bob'"
 * @param {1} headerCount OPTIONAL how many rows of headers in input table
 * @return {Table} Output Table.
 * @customfunction
 * 
 * e.g
 * =SELECT(WHERE(E2:H6, "*A = 2 AND *B='Bob'", "*A,*D"))
 * =WHERE(E2:I6, "*E > 10")
 */
function WHERE(table, opHumanString, headerCount) {
  const opString = L_PARSE("<WHERE>"+opHumanString)
  const opObject = JSON.parse(opString).value
  replaceCellRefInWhereTree(opObject) // in-place changes
  const [headerT, dataT] = splitHeaders(table, getWorkingHeaderCount(headerCount))
  const columnNameMap = buildColumnNameMap(headerT[0] || [])
  replaceColumnNameInWhereTree(opObject, columnNameMap) // repalce *Name -> *C
  const fData = dataT.filter((row) => {
    return runCompositeOp(opObject, row)
  })
  return prependHeaders(fData, headerT)
}


/* - - - - - - - - - - - - - - - - - - - - -
//           GROUP BY
=GROUP_BY(<table>, "*A,*C", "SUM *B", "COUNT *D")
// - - - - - - - - - - - - - - - - - - - - -
*/

// "sum *B" "count *D"
// {"type":"Function","name":"COUNT","args":[{"type":"PRIMITIVE","value":3}]}
function runAggOp(aggOpFn, rows){
  console.log(aggOpFn)
  let op = aggOpFn.name
  let col = aggOpFn.args[0] // take the first argument
  op = op.trim().toUpperCase()
  console.log({op, col})
  if (op == 'SUM') {
    let total = 0
    for (let row of rows){
      const fieldVal = getFieldValue(row, col)
      total += fieldVal
    }
    return total
  }

  if (op == 'COUNT') {
    let total = 0
    for (let row of rows){
      const fieldVal = getFieldValue(row, col)
      if (fieldVal) {
        total += 1
      }
    }
    return total
  }

  throw new Error(`Agg Op ${op} not supported`)
}

/**
 * GROUP_BY clause
 * 
 * @param {A1:D10} table Selection Range as input table.
 * @param {"*B,*C"} columnsStr which colums to group by e.g "*B, *C"
 * @param {"$COUNT(1), $SUM(*D)"} aggExpr aggregate expression
 * @param {Integer} headerCount how many rows of headers in input table
 * @return {Table} Output Table.
 * @customfunction
 * 
 * e.g
 * =GROUP_BY(A1:D10, "*B,*Name,1", "$COUNT(*A), $SUM(*D)")
 */
function GROUP_BY(table, columnsStr, aggrExprStr, headerCount) {
  const aggrExpr = JSON.parse(L_PARSE("<AGG>" + aggrExprStr))
  const aggList = aggrExpr.value

  const columnExpr = JSON.parse(L_PARSE("<GROUP_BY>" + columnsStr))
  const columnList = columnExpr.value

  const [headerT, dataT] = splitHeaders(table, getWorkingHeaderCount(headerCount))

  // replace column name in columnList
  const columnNameMap = buildColumnNameMap(headerT[0])
  columnList.map((col) => replaceColumnNameInColumnExpr(col, columnNameMap))

  // replace column name in aggList
  aggList.map((aggFn) => {
    aggFn.args.map((col) => replaceColumnNameInColumnExpr(col, columnNameMap))
  })

  const groupByMap = {}
  for (let row of dataT) {
    const keyParts = []
    for (let col of columnList) {
      const colVal = getFieldValue(row, col)
      keyParts.push(colVal)
    }

    const key = JSON.stringify(keyParts)
    if (! (key in groupByMap )) {
      groupByMap[key] = {
        keyParts,
        elements: []
      }
    }

    groupByMap[key].elements.push(row)
  }

  const headerRow = headerT[0]
  const outHeaderRow = []
  for (let col of columnList) {
    if (headerRow) {
      const hVal = getFieldValue(headerT[0], col)
      outHeaderRow.push(hVal)
    }
    else {
      outHeaderRow.push(col)
    }
  }

  for (let aggFn of aggList) {
    // const outAgg = runAggOp(aggFn, groupByMap[key].elements)
    outHeaderRow.push(`${aggFn.name} ${aggFn.args[0].value}`)
    // outRow.push(outAgg)
  }

  const outTable = []

  for (let key in groupByMap) {
    const keyParts = groupByMap[key].keyParts

    const outRow = [...keyParts]
    // 
    for (let aggFn of aggList) {
      const outAgg = runAggOp(aggFn, groupByMap[key].elements)
      outRow.push(outAgg)
    }

    outTable.push(outRow)
  }

  return prependHeaders(outTable, [outHeaderRow])
}

/* - - - - - - - - - - - - - - - - - - - - -
//           ORDER_BY
=ORDER_BY(<table>, "*A ASC,*C DESC")

=ORDER_BY(C2:D24, "*B DESC,*A DESC")
// - - - - - - - - - - - - - - - - - - - - -
*/

function parseOrderClause(orderClause){
  const parts = orderClause.split(",")
  const orderConditionList = parts.map((x) => {
    const [column, order] = x.split(" ")
    return {
      'col': column,
      'ord': order
    }
  })
  return orderConditionList
}

function normalComp(v1, v2){
  if (v1 < v2) {
    return -1
  }
  else if (v1 > v2) {
    return 1
  }
  else {
    return 0
  }
}

function runOrderCondition(row1, row2, orderCondition) {
  const v1 = getFieldValue(row1, orderCondition.exp)
  const v2 = getFieldValue(row2, orderCondition.exp)

  const outAsc = normalComp(v1, v2)
  return orderCondition.order == 'ASC' ? outAsc : -outAsc
}

function runOrderConditionList(row1, row2, orderConditionList) {
  for (let cond of orderConditionList) {
    const out = runOrderCondition(row1, row2, cond)
    if (out != 0) return out
  }

  return 0
}

/**
 * ORDER_BY clause
 * 
 * @param {A1:C10} table Selection Range as input table.
 * @param {"*C DESC, *A ASC"} orderClause order clause e.g "*C DESC, *A ASC"
 * @param {1} headerCount OPTIONAL how many rows of headers in input table
 * @return {Table} Output Table.
 * @customfunction
 * 
 * e.g
 * =ORDER_BY(A1:C10, "*C DESC, *Name ASC")
 */
function ORDER_BY(table, orderClause, headerCount) {
  const [headerT, dataT] = splitHeaders(table, getWorkingHeaderCount(headerCount))

  const columnNameMap = buildColumnNameMap(headerT[0] || [])

  // {"type":"ORDER_BY","value":[{"exp":{"type":"COLUMN","value":"name"},"order":"DESC"}]}
  const orderTree = JSON.parse(L_PARSE("<ORDER_BY>"+orderClause))
  const orderConditionList = orderTree.value
  orderConditionList.map((orderCond) => replaceColumnNameInColumnExpr(orderCond.exp, columnNameMap))

  dataT.sort((row1, row2) => runOrderConditionList(row1, row2, orderConditionList))

  return prependHeaders(dataT, headerT)
}


/* - - - - - - - - - - - - - - - - - - - - -
//           L_PARSE where clause expression parser
// - - - - - - - - - - - - - - - - - - - - -
*/

function testPeg() {
  console.log(PegParserLib.parse("('*B' > 1) OR ('*A' = 'Bob')"))
}


/**
 * Parse the where clause expression
 * 
 * @param {"'*C' = 34"} expression input expression e.g `"(4 < 5) OR ('*C' = 'Bengaluru') OR *D > *E"`
 * @returns {String} Parsed expression object JSON
 * @customfunction
 * 
 */
function L_PARSE(expression) {
  return JSON.stringify(PegParserLib.parse(expression))
}



function test() {
  const table = [['name', 'age'], ['Alice',2], ['Bob',4]]

  const out2 = WHERE(table, "(*B > 1) AND (*A = 'Bob')") // L_OR(L_OP(">", "*B", 1), L_OP("=", "*A", "Bob")))
  console.log(out2)

  const out3 = WHERE(table, "*B>2") // L_OP(">", "*B", 2))
  console.log(out3)

  // return DEFAULTS[SKIP_HEADER_COUNT]
  console.log(L_OP(">", "*B", 2))

  const orderConditionList = parseOrderClause("*B DESC")
  console.log(orderConditionList)

  const out5 = runOrderConditionList(table[1], table[2], orderConditionList)
  console.log(out5)

  var cellA1 = SpreadsheetApp.getActiveSheet().getRange('A1').getValue();
  console.log(JSON.stringify({x: cellA1}))

  return out3
}