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

Exp
  = head:SingleExp _ op:ComboOperator _ tail:Exp {
  	return {type: op, op1: head, op2: tail}
  }
  / SingleExp

SingleExp
  = "(" e:Exp ")" {return e}
  / BaseExp

UnitExp
  = Float
  / Integer
  / Text
  / FunctionCall
  / Column
  / CellRef
  / Boolean

Boolean
  = "TRUE" { return true}
  / "FALSE" { return false}

BaseExp
  = head:UnitExp _ op:CompareOperator _ tail:UnitExp {
  	return {type: 'BASE', op, col1: head, col2: tail}
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

_ "whitespace"
  = [ \t\n\r]*
  
Column
  = "*" str:Variable {return "*" + str}
 
CellRef
  = "#" str:Variable {return "#" + str}

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