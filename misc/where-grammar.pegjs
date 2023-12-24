// (5 > 3) AND ('*C' = 'Bangalore Cookies')
// L_OR(L_OP(">", "*B", 1), L_OP("=", "*A", "Bob"))
// ('*B' > 1) OR ('*A' = 'Bob')
// *A = 'Bob'

Exp
  = head:SingleExp _ op:ComboOperator _ tail:SingleExp {
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
  = _ [0-9]+ { return parseInt(text(), 10); }

_ "whitespace"
  = [ \t\n\r]*
  
Column
  = "*" str:[A-Z]+ { return "*" + str.join("")}

Text
  = "'" str:[A-Za-z\s* ]+ "'" {
    return str.join('')
  }