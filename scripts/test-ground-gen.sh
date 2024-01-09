DIST=temp
mkdir -p $DIST
OUT=$DIST/test-ground.js
rm $OUT
cat test/excel-mock.js >> $OUT
cat src/sql-parser.js >> $OUT
cat src/sql-utils.js >> $OUT
cat test/local-test.js >> $OUT
echo '// - - - - - - - - - - - -' >> $OUT
echo 'Done. output at ' $OUT