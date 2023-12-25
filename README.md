# Google Sheet Utils

SQL like functionaliity in google sheet
- LEFT_JOIN
- SELECT
- WHERE
- ORDER_BY
- GROUP_BY

# How to use
1. You need just 1 file - `sheet-utils.combined.js` (from dist folder)
2. Go to your google sheet where you want to use this
3. Open Menu: Extensions -> Apps Script
4. In Apps Script page
    - Click on "Editor" menu (on left). Create a new file and copy-paste the contents of `sheet-utils.combined.js`. Alternatively you could also upload the file using "+" button
5. Now you can try out the functions in your google sheet cell e.g `=SELECT(WHERE(A1:C5, "*C > 25"), "A.My Name,C.My Age")`

# [dev] How to deploy (to a sheet)

## one time prep
- Make sure clasp cli is setup and logged in.
- .clasp.json should contain the `scriptId` of the appscript project (associated with you google sheet)

## evertime you make changes
- Make changes to code in src/ directory
- Check status which files will be pushed `clasp status`
- Push using `clasp push`

# [dev] generate a single distributable js
```bash
# run from root of the project
bash scripts/gen-combined-js.sh
# outputs dist/sheet-utils.combined.js
```

# [dev] Setup Details
- google sheet link : https://docs.google.com/spreadsheets/d/1JYZ40tL7mxzdNvgtToPZkWctg1lI5-TJIOuzvhaXdxo/edit#gid=0
- script id : 1o2k7CgnuyaPD6nlp66C-NNsSd8XNbOvYIpAOZynMKaHpHd3A91UtTfud

# [dev] pegjs for parsing expressions
We're using https://pegjs.org/online to generate the parser code for where clause expressions like
`(5 > 3) AND ('*C' = 'Bangalore Cookies')` or `*A = 'Bob'`

Note: install [peggyjs](https://marketplace.visualstudio.com/items?itemName=PeggyJS.peggy-language) for syntax highlighting for .pegjs files

# TODO
- [ ] grammar
    - [x] relax strict need of parenthesis in AND/OR where expressions e.g `(*A=2) AND (*B='X')`, this is also allowed `*A=2 AND B='X`
    - [x] support TRUE/FALSE
- [x] write a nice read me
- [ ] write this in typescript
- [ ] write function doc (for each exposed functions)
    - [ ] what to expose - WHERE, SELECT, GROUP_BY, SORT_BY, LEFT_JOIN
    - [ ] and make others private
- [ ] support basic function calls in SELECT e.g SELECT A > 2
- [x] rename SELECT2, WHERE2 replacing the old ones 