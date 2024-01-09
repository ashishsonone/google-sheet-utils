DIST=temp
mkdir -p $DIST
OUT=$DIST/test-ground.js
rm $OUT
echo '' >> $OUT
cat test/excel-mock.js >> $OUT
echo '' >> $OUT
cat src/sql-parser.js >> $OUT
echo '' >> $OUT
cat src/sql-utils.js >> $OUT
echo '' >> $OUT
cat test/local-test.js >> $OUT
echo '// - - - - - - - - - - - -' >> $OUT
echo 'Done. output at ' $OUT