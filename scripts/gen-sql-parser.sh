OUT=src/sql-parser.js
INPUT=$HOME/Downloads/parser.js

rm $OUT

echo "PegParserLib=" >> $OUT
tail -n +4 $INPUT >> $OUT

echo "Exported $OUT"