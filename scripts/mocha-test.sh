DIST=temp
mkdir -p $DIST
OUT=$DIST/mocha-ground.test.js
rm $OUT
echo '' >> $OUT
cat test/excel-mock.js >> $OUT
echo '' >> $OUT
cat src/sql-parser.js >> $OUT
echo '' >> $OUT
cat src/sql-utils.js >> $OUT
echo '' >> $OUT
cat test/mocha-test.js >> $OUT
echo '// - - - - - - - - - - - -' >> $OUT
echo 'Done. output at ' $OUT