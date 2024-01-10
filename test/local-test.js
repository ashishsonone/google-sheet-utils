function localTest(){
    const columnNameMap = buildColumnNameMap(['Name', 'Date of Birth'])
    // console.log(columnNameMap)

    const whereExpression = "<WHERE>(*B >= 'Blp')"
    const whereTree = JSON.parse(L_PARSE(whereExpression))
    // console.log(whereTree)

    const out = runCompositeOp(whereTree.value, [34, 'Alpha'])
    // console.log(out)

    const table = [['name', 'age'], ['Alice',2], ['Bob',4], ['Alice', 10]]
    const table2 = [['StudentName', 'city'], ['Alice','Bombay'], ['Bob','Delhi']]

    const out3 = WHERE(table, "*age < #C3") // L_OP(">", "*B", 2))
    // console.log(out3)

    // replaceColumnNameInWhereTree(whereTree, columnNameMap)

    // const aggExpr = JSON.parse(L_PARSE("<AGG>$COUNT(*B)"))
    // console.log(aggExpr)
    // console.log(runAggOp(aggExpr.value[0], table.slice(1)))

    // const x = GROUP_BY(table, "*name", "$SUM(*age)")
    // console.log(x)

    const selectTree = JSON.parse(L_PARSE("<SELECT>*name AS MyName"))
    console.log(JSON.stringify(selectTree))

    const out4 = SELECT(table, "*name AS 'My Name', *B")
    // console.log(out4)

    const orderTree = JSON.parse(L_PARSE("<ORDER_BY>*name DESC"))
    // console.log(JSON.stringify(orderTree))

    const out5 = ORDER_BY(table, "*B ASC")
    // console.log(out5)

    const out6 = LEFT_JOIN(table, "*A", table2, "*StudentName")
    console.log(out6)
}

localTest()