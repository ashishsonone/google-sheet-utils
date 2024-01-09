function localTest(){
    const columnNameMap = buildColumnNameMap(['Name', 'Date of Birth'])
    console.log(columnNameMap)

    const whereExpression = "<WHERE>*B >= 'Blp'"
    const whereTree = JSON.parse(L_PARSE(whereExpression))
    console.log(whereTree)

    const out = runCompositeOp(whereTree.value, [34, 'Alpha'])
    console.log(out)

    // replaceColumnNameInWhereTree(whereTree, columnNameMap)

    // console.log(whereTree)
}

localTest()