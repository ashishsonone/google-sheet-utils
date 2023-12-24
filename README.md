# Google Sheet Utils

SQL like functionaliity in google sheet
- LEFT_JOIN
- SELECT
- WHERE
- ORDER_BY
- GROUP_BY

# How to deploy
- Make sure clasp cli is setup and logged in
- Make changes to code in src/ directory
- Push using `clasp push` command

# Setup Details
- google sheet link : https://docs.google.com/spreadsheets/d/1JYZ40tL7mxzdNvgtToPZkWctg1lI5-TJIOuzvhaXdxo/edit#gid=0
- script id : 1o2k7CgnuyaPD6nlp66C-NNsSd8XNbOvYIpAOZynMKaHpHd3A91UtTfud

# Use of pegjs for parsing expressions
We're using https://pegjs.org/online to generate the parser code for where clause expressions like
`(5 > 3) AND ('*C' = 'Bangalore Cookies')` or `*A = 'Bob'`

Note: install [peggyjs](https://marketplace.visualstudio.com/items?itemName=PeggyJS.peggy-language) for syntax highlighting for .pegjs files

# TODO
- [ ] grammar
    - [x] relax strict need of parenthesis in AND/OR where expressions e.g `(*A=2) AND (*B='X')`, this is also allowed `*A=2 AND B='X`
    - [x] support TRUE/FALSE
- [ ] write a nice read me
- [ ] write this in typescript
- [ ] write function doc (for each exposed functions)
    - [ ] what to expose - WHERE2, SELECT2, GROUP_BY, SORT_BY, LEFT_JOIN, L_PARSE
    - [ ] and make others private
- [ ] support basic function calls in SELECT e.g SELECT A > 2
- [ ] rename SELECT2, WHERE2 replacing the old ones 