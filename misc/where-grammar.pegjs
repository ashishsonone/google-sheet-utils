// (5 > 3) AND ('*C' = 'Bangalore Cookies')
// L_OR(L_OP(">", "*B", 1), L_OP("=", "*A", "Bob"))
// ('*B' > 1) OR ('*A' = 'Bob')
// *A = 'Bob'
// *B = TRUE
// 5 > 3 AND *B = 'Bob'
// *C > 3.54
// (*Backup_1 > 113 AND *B = 'BENGALURU') OR (*C=TRUE AND #AC33 > 10)
// matchGlob("%s%", *D)
// $matchGlob('3', $abs(-33.3)) > 3
// $matchGlob('3', 4.3) >= *Alpha
// <SELECT>(*Name = 'A'), *C
// <WHERE>(*Name = 'A') AND *C = 3
// <WHERE>(*Name = 'A') AND (*C = 3) OR $f(*Name, *Age)
// <SELECT>*C AS KuchBhi
// <SELECT>*C, *'Date of Birth', $fun(3, *C, *'Name')
// <SELECT>*'Date of Birth' AS 'Kuch naya date', #C3
// <WHERE>*'Date of Birth' = 'Kuch naya date' AND #C3 > 3
// <AGG>$SUM(*D),$COUNT(3)
// <GROUP_BY>*A,*Name,1
// <ORDER_BY>*B DESC, *Name ASC
Exp
 = "<WHERE>" x:WhereExp {
 	return {
 	  type: 'WHERE',
      value: x
     }
    }
  / "<SELECT>" first:SelectExp rest:(_ "," _ SelectExp _)* {
  	  const outArgs = [first]
      if (rest) outArgs.push(...rest.map((x) => x[3]))
  	  return {
        	type: 'SELECT',
            value: outArgs
        }
  }
  / "<AGG>" first:FunctionCall rest:(_ "," _ FunctionCall _)* {
  	  const outArgs = [first]
      if (rest) outArgs.push(...rest.map((x) => x[3]))
  	  return {
        	type: 'AGG',
            value: outArgs
        }
  }
  / "<GROUP_BY>" first:GroupByArg rest:(_ "," _ GroupByArg _)* {
  	  const outArgs = [first]
      if (rest) outArgs.push(...rest.map((x) => x[3]))
  	  return {
        	type: 'GROUP_BY',
            value: outArgs
        }
  }
  / "<ORDER_BY>" first:OrderByExp rest:(_ "," _ OrderByExp _)* {
  	  const outArgs = [first]
      if (rest) outArgs.push(...rest.map((x) => x[3]))
  	  return {
        	type: 'ORDER_BY',
            value: outArgs
        }
  }

OrderByExp
  = col:Column _ order:OrderEnum {
  	return {exp: col, order}
  }

OrderEnum
   = "ASC"
   / "DESC"

SelectExp
  = x:SingleExp y:(_ "AS" _ RenameString )? {
  	 const out = {exp: x}
     if (y) out.rename = y[3]
     return out
  }

GroupByArg
	= Column
    / x:Primitive { return {type: 'PRIMITIVE', value: x}}

RenameString
  = Text
  / Variable

WhereExp
  = head:SingleExp _ op:ComboOperator _ tail:WhereExp {
  	return {type: op, op1: head, op2: tail}
  }
  / SingleExp

SingleExp
  = "(" e:WhereExp ")" {return e}
  / CompareExp
  / UnitExp

UnitExp
  = x: Primitive { return {type: 'PRIMITIVE', value: x}}
  / FunctionCall
  / CellRef
  / Column

Primitive
  = Float
  / Integer
  / Text
  / Boolean

CompareExp
  = head:UnitExp _ op:CompareOperator _ tail:UnitExp {
  	return {type: 'COMPARE', op, col1: head, col2: tail}
  }

CompareOperator
  = ">="
  / "<="
  / ">"
  / "<"
  / "="

ComboOperator
  = "OR"
  / "AND"

Integer "integer"
  = [-0-9]+ { return parseInt(text(), 10); }

Float
  = x:Integer "." y:Integer { return parseFloat(x + "." + y); }

Boolean
  = "TRUE" { return true}
  / "FALSE" { return false}

_ "whitespace"
  = [ \t\n\r]*
  
Column
  = "*" str:RenameString {return {type: 'COLUMN', value: str}}
 
CellRef
  = "#" str:Variable {return {type: 'CELLREF', value: str}}

Text
  = "'" str:[^']+ "'" {
  	return str.join('')
  }

Variable
  = str:[A-Za-z0-9*#_]+ {return str.join('')}

FunctionCall
  = "$" fn:Variable "(" args:(_ UnitExp (_ "," _ UnitExp _)* )? ")" {
    args = args || []
    const outArgs = []
    if (args[1]) outArgs.push(args[1])
    if (args[2]) outArgs.push(...args[2].map((x) => x[3]))
    return {
      type: 'Function',
      name: fn,
      args: outArgs
    }
  }