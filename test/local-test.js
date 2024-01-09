function localTest(){
    const columnNameMap = buildColumnNameMap(['Name', 'Date of Birth'])
    console.log(columnNameMap)

    const whereExpression = "<WHERE>(*B >= 'Blp')"
    const whereTree = JSON.parse(L_PARSE(whereExpression))
    console.log(whereTree)

    const out = runCompositeOp(whereTree.value, [34, 'Alpha'])
    console.log(out)

    const table = [['name', 'age'], ['Alice',2], ['Bob',4]]
    const out3 = WHERE(table, "*age < #C3") // L_OP(">", "*B", 2))
    console.log(out3)

    // replaceColumnNameInWhereTree(whereTree, columnNameMap)

    // console.log(whereTree)
}

localTest()