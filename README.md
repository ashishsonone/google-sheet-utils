# Google Sheet Utils
A very basic SQL like functionality in google sheet

Supported functions:
- SELECT
- WHERE
- ORDER_BY
- GROUP_BY
- LEFT_JOIN

# Demo video
[Demo video Link](https://youtu.be/AxDwPOe4Xwg)

<a href="https://youtu.be/AxDwPOe4Xwg"><img src="https://img.youtube.com/vi/AxDwPOe4Xwg/maxresdefault.jpg" height=400></a>

# Demo google sheet
[Sheet Utils Demo Sheet](https://docs.google.com/spreadsheets/d/12xaK4kUavxLsKTN-yimtWjsoAlZacLruIlQkzW4W7CU/edit#gid=0)

- Make a copy and use it to play around
- It contains 2 tables : students and schools
- It also showcases a few demo queries showing how to use the functions

# How to use
1. You need just 1 file - `sheet-utils.combined.js` (from dist folder)
2. Go to your google sheet where you want to use this
3. Open Menu: Extensions -> Apps Script
4. In Apps Script page
    - Click on "Editor" menu (on left). Create a new file and copy-paste the contents of `sheet-utils.combined.js`. Alternatively you could also upload the file using "+" button
5. Now you can try out the functions in your google sheet cell e.g `=WHERE(A1:C5, "*C > 25")`

# Function docs
## SELECT
select columns from the input table. Optionally rename it.

Note: By default, assumes that the first row in selection is a header row. It uses it to output the column names accordingly.

A is the first column, B second, and so on

e.g select columns A & C
`=SELECT(A1:C10, "*A,*C")`

e.g same as before, but now rename column A to "My Name"
`=SELECT(A1:C10, "*A.My Name, *C")`

Note: As convention, column names are to be prefixed with asterisk(*) to differentiate b/w string value and column name.

## WHERE
supports 3 operators : less than (<), greater than (>), equal (=). 
conditions can be combined using `AND`, `OR`

Value can be either
- column name e.g `*A`
- integer number e.g `25` (float not yet supported in parser)
- string value (in single quotes) e.g `'Mumbai'` or `'Bob'`
- boolean value literals e.g `TRUE` `FALSE`

Examples:
- `WHERE(A1:C10, "*A > 10")`
- `WHERE(A1:C10, "*A = 'Mumbai' AND *C < 10)`
- `WHERE(A1:C10, "*A = TRUE)`

## ORDER_BY
orders the table based on certain column(s) either ascending (ASC) or descending (DESC)

e.g - students table containing 3 columns `Name, Location, Age`. We want to order students by decresing age, if same age sorted by name (ascending)

- `SORT_BY(A1:C10, "*C DESC, *A ASC")`


## GROUP_BY
group the table based on certain column(s), and calculate upto 2 aggregate values. In future versions, this limit will be removed

Note: currently supported aggregate functions : `SUM`, `COUNT`. More to come in future versions.

e.g students table `Name, Location, Type, Points`. Group students by location+type and calculate number of students and total points in each group

- `GROUP_BY(A1:D10, "*B,*C", "COUNT *A, SUM *D")`

we can combine the SELECT function here to rename the output columns nicely
- `SELECT(GROUP_BY(A1:D10, "*B,*C", "COUNT *A, SUM *D"), "*A, *B, *C.Total Students, *D.Total Points")`

## LEFT_JOIN
this is used to join 2 tables together based on a common column

e.g Students table - `name, school id, age`. School table - `school id, school name, location`. We want to join the the two tables (based on school id) so that for each student we can see the school details

- `=LEFT_JOIN(<students>, "*B", <schools>, "*A")`

here `*B` is school id in students table, and "*A" is school id in school table.

post this we can combine `SELECT` OR `WHERE` to further tune the output

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
    - [ ] suport function invocation in where e.g `IS_EVEN(x)`, `COMPARE(x, 'Mumbai')`
    - [ ] support named columns `*Age=33`
    - [ ] support float numbers
- [x] rename SELECT2, WHERE2 replacing the old ones
- [x] write a nice read me
    [x] explain each function with examples
- [x] add a demo google sheet
- [ ] write this in typescript
- [ ] write function doc (for each exposed functions)
    - [ ] exposed functions - WHERE, SELECT, GROUP_BY, SORT_BY, LEFT_JOIN
    - [ ] and make others private
- [ ] support named column in queries (taken from header row)
- [ ] support basic function calls in SELECT e.g SELECT A > 2
- [ ] support more aggregate functions (AVG, MIN, MAX, etc). Remove limit of max 2 aggregates.
- [ ] support user defined custom functions in where, aggregate clauses
- [ ] [not a priority] full sql dialect instead of separate invocation for select, group, where. e.g `SELECT A, B WHERE C > 100 ORDER BY A DESC`
- [ ] Error handling. Proper information about what went wrong.
- [x] Record a demo video and publish on youtube
