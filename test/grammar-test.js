expression="<WHERE>(*'Date(Cold)' > '2023-09-25') AND (*'Date(Cold)' < '2023-09-30')"
out=PegParserLib.parse(expression)
console.log(out)