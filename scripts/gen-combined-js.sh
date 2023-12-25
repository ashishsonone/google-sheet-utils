DIST=dist
SRC=src
OUT=$DIST/sheet-utils.combined.js
rm $OUT
cat $SRC/sql-parser.js >> $OUT
cat $SRC/sql-utils.js >> $OUT
echo 'Done. output at ' $OUT