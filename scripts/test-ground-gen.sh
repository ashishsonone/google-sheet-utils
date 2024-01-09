DIST=test
SRC=src
OUT=$DIST/test-ground.js
rm $OUT
cat $SRC/sql-parser.js >> $OUT
cat $SRC/sql-utils.js >> $OUT
cat $SRC/local-test.js >> $OUT
echo '// - - - - - - - - - - - -' >> $OUT
echo 'Done. output at ' $OUT