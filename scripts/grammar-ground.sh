DIST=temp
mkdir -p $DIST
OUT=$DIST/grammar-ground.js
rm $OUT
echo '' >> $OUT
cat src/sql-parser.js >> $OUT
echo '' >> $OUT
cat test/grammar-test.js >> $OUT
echo '// - - - - - - - - - - - -' >> $OUT
echo 'Done. output at ' $OUT