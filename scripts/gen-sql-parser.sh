OUT=src/sql-parser.js
GRAMMAR=misc/where-grammar.pegjs
INPUT=temp/parser.js

npx peggy --format amd -o $INPUT $GRAMMAR

rm $OUT

echo 'PegParserLibGen=(function() {' >> $OUT
tail -n +5 $INPUT >> $OUT

echo 'PegParserLib=PegParserLibGen()' >> $OUT

echo "Exported $OUT"