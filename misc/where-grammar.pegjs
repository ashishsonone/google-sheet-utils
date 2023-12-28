// (5 > 3) AND ('*C' = 'Bangalore Cookies')
// L_OR(L_OP(">", "*B", 1), L_OP("=", "*A", "Bob"))
// ('*B' > 1) OR ('*A' = 'Bob')
// *A = 'Bob'
// *B = TRUE
// 5 > 3 AND *B = 'Bob'

Exp
  = head:SingleExp _ op:ComboOperator _ tail:Exp {
  	return {type: op, op1: head, op2: tail}
  }
  / SingleExp

SingleExp
  = "(" e:Exp ")" {return e}
  / BaseExp
  / UnitExp

UnitExp
  = Integer
  / Text
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
  = ">"
  / "<"
  / "="
  
ComboOperator
  = "OR"
  / "AND"

Integer "integer"
  = [0-9]+ { return parseInt(text(), 10); }


_ "whitespace"
  = [ \t\n\r]*
  
Column
  = "*" str:Variable {return "*" + str}
 
CellRef
  = "#" str:Variable {return "#" + str}

Text
  = "'" str:[A-Za-z0-9*#_ ]+ "'" {
  	return str.join('')
  }

Variable
  = str:[A-Za-z0-9*#_]+ {return str.join('')}
