function localTest(){
    const columnNameMap = buildColumnNameMap(['Name', 'Date of Birth'])
    console.log(columnNameMap)

    const whereExpression = "<WHERE>(*B >= 'Blp')"
    const whereTree = JSON.parse(L_PARSE(whereExpression))
    console.log(whereTree)

    const out = runCompositeOp(whereTree.value, [34, 'Alpha'])
    console.log(out)

    const table = [['name', 'age'], ['Alice',2], ['Bob',4], ['Alice', 10]]
    const out3 = WHERE(table, "*age < #C3") // L_OP(">", "*B", 2))
    console.log(out3)

    // replaceColumnNameInWhereTree(whereTree, columnNameMap)

    // const aggExpr = JSON.parse(L_PARSE("<AGG>$COUNT(*B)"))
    // console.log(aggExpr)
    // console.log(runAggOp(aggExpr.value[0], table.slice(1)))

    const x = GROUP_BY(table, "*name", "$SUM(*age)")
    console.log(x)
}

localTest()