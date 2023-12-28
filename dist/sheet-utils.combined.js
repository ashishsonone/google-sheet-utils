// 2023-12--sheet-peg-parser.js
// to be put into app script as Parser.gs

PegParserLib = (function() {
 "use strict";

 function peg$subclass(child, parent) {
   function ctor() { this.constructor = child; }
   ctor.prototype = parent.prototype;
   child.prototype = new ctor();
 }

 function peg$SyntaxError(message, expected, found, location) {
   this.message  = message;
   this.expected = expected;
   this.found    = found;
   this.location = location;
   this.name     = "SyntaxError";

   if (typeof Error.captureStackTrace === "function") {
     Error.captureStackTrace(this, peg$SyntaxError);
   }
 }

 peg$subclass(peg$SyntaxError, Error);

 peg$SyntaxError.buildMessage = function(expected, found) {
   var DESCRIBE_EXPECTATION_FNS = {
         literal: function(expectation) {
           return "\"" + literalEscape(expectation.text) + "\"";
         },

         "class": function(expectation) {
           var escapedParts = "",
               i;

           for (i = 0; i < expectation.parts.length; i++) {
             escapedParts += expectation.parts[i] instanceof Array
               ? classEscape(expectation.parts[i][0]) + "-" + classEscape(expectation.parts[i][1])
               : classEscape(expectation.parts[i]);
           }

           return "[" + (expectation.inverted ? "^" : "") + escapedParts + "]";
         },

         any: function(expectation) {
           return "any character";
         },

         end: function(expectation) {
           return "end of input";
         },

         other: function(expectation) {
           return expectation.description;
         }
       };

   function hex(ch) {
     return ch.charCodeAt(0).toString(16).toUpperCase();
   }

   function literalEscape(s) {
     return s
       .replace(/\\/g, '\\\\')
       .replace(/"/g,  '\\"')
       .replace(/\0/g, '\\0')
       .replace(/\t/g, '\\t')
       .replace(/\n/g, '\\n')
       .replace(/\r/g, '\\r')
       .replace(/[\x00-\x0F]/g,          function(ch) { return '\\x0' + hex(ch); })
       .replace(/[\x10-\x1F\x7F-\x9F]/g, function(ch) { return '\\x'  + hex(ch); });
   }

   function classEscape(s) {
     return s
       .replace(/\\/g, '\\\\')
       .replace(/\]/g, '\\]')
       .replace(/\^/g, '\\^')
       .replace(/-/g,  '\\-')
       .replace(/\0/g, '\\0')
       .replace(/\t/g, '\\t')
       .replace(/\n/g, '\\n')
       .replace(/\r/g, '\\r')
       .replace(/[\x00-\x0F]/g,          function(ch) { return '\\x0' + hex(ch); })
       .replace(/[\x10-\x1F\x7F-\x9F]/g, function(ch) { return '\\x'  + hex(ch); });
   }

   function describeExpectation(expectation) {
     return DESCRIBE_EXPECTATION_FNS[expectation.type](expectation);
   }

   function describeExpected(expected) {
     var descriptions = new Array(expected.length),
         i, j;

     for (i = 0; i < expected.length; i++) {
       descriptions[i] = describeExpectation(expected[i]);
     }

     descriptions.sort();

     if (descriptions.length > 0) {
       for (i = 1, j = 1; i < descriptions.length; i++) {
         if (descriptions[i - 1] !== descriptions[i]) {
           descriptions[j] = descriptions[i];
           j++;
         }
       }
       descriptions.length = j;
     }

     switch (descriptions.length) {
       case 1:
         return descriptions[0];

       case 2:
         return descriptions[0] + " or " + descriptions[1];

       default:
         return descriptions.slice(0, -1).join(", ")
           + ", or "
           + descriptions[descriptions.length - 1];
     }
   }

   function describeFound(found) {
     return found ? "\"" + literalEscape(found) + "\"" : "end of input";
   }

   return "Expected " + describeExpected(expected) + " but " + describeFound(found) + " found.";
 };

 function peg$parse(input, options) {
   options = options !== void 0 ? options : {};

   var peg$FAILED = {},

       peg$startRuleFunctions = { Exp: peg$parseExp },
       peg$startRuleFunction  = peg$parseExp,

       peg$c0 = function(head, op, tail) {
             return {type: op, op1: head, op2: tail}
         },
       peg$c1 = "(",
       peg$c2 = peg$literalExpectation("(", false),
       peg$c3 = ")",
       peg$c4 = peg$literalExpectation(")", false),
       peg$c5 = function(e) {return e},
       peg$c6 = "TRUE",
       peg$c7 = peg$literalExpectation("TRUE", false),
       peg$c8 = function() { return true},
       peg$c9 = "FALSE",
       peg$c10 = peg$literalExpectation("FALSE", false),
       peg$c11 = function() { return false},
       peg$c12 = function(head, op, tail) {
             return {type: 'BASE', op, col1: head, col2: tail}
         },
       peg$c13 = ">",
       peg$c14 = peg$literalExpectation(">", false),
       peg$c15 = "<",
       peg$c16 = peg$literalExpectation("<", false),
       peg$c17 = "=",
       peg$c18 = peg$literalExpectation("=", false),
       peg$c19 = "OR",
       peg$c20 = peg$literalExpectation("OR", false),
       peg$c21 = "AND",
       peg$c22 = peg$literalExpectation("AND", false),
       peg$c23 = peg$otherExpectation("integer"),
       peg$c24 = /^[0-9]/,
       peg$c25 = peg$classExpectation([["0", "9"]], false, false),
       peg$c26 = function() { return parseInt(text(), 10); },
       peg$c27 = peg$otherExpectation("whitespace"),
       peg$c28 = /^[ \t\n\r]/,
       peg$c29 = peg$classExpectation([" ", "\t", "\n", "\r"], false, false),
       peg$c30 = "*",
       peg$c31 = peg$literalExpectation("*", false),
       peg$c32 = function(str) {return "*" + str},
       peg$c33 = "#",
       peg$c34 = peg$literalExpectation("#", false),
       peg$c35 = function(str) {return "#" + str},
       peg$c36 = "'",
       peg$c37 = peg$literalExpectation("'", false),
       peg$c38 = /^[A-Za-z0-9*#_ ]/,
       peg$c39 = peg$classExpectation([["A", "Z"], ["a", "z"], ["0", "9"], "*", "#", "_", " "], false, false),
       peg$c40 = function(str) {
             return str.join('')
         },
       peg$c41 = /^[A-Za-z0-9*#_]/,
       peg$c42 = peg$classExpectation([["A", "Z"], ["a", "z"], ["0", "9"], "*", "#", "_"], false, false),
       peg$c43 = function(str) {return str.join('')},

       peg$currPos          = 0,
       peg$savedPos         = 0,
       peg$posDetailsCache  = [{ line: 1, column: 1 }],
       peg$maxFailPos       = 0,
       peg$maxFailExpected  = [],
       peg$silentFails      = 0,

       peg$result;

   if ("startRule" in options) {
     if (!(options.startRule in peg$startRuleFunctions)) {
       throw new Error("Can't start parsing from rule \"" + options.startRule + "\".");
     }

     peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
   }

   function text() {
     return input.substring(peg$savedPos, peg$currPos);
   }

   function location() {
     return peg$computeLocation(peg$savedPos, peg$currPos);
   }

   function expected(description, location) {
     location = location !== void 0 ? location : peg$computeLocation(peg$savedPos, peg$currPos)

     throw peg$buildStructuredError(
       [peg$otherExpectation(description)],
       input.substring(peg$savedPos, peg$currPos),
       location
     );
   }

   function error(message, location) {
     location = location !== void 0 ? location : peg$computeLocation(peg$savedPos, peg$currPos)

     throw peg$buildSimpleError(message, location);
   }

   function peg$literalExpectation(text, ignoreCase) {
     return { type: "literal", text: text, ignoreCase: ignoreCase };
   }

   function peg$classExpectation(parts, inverted, ignoreCase) {
     return { type: "class", parts: parts, inverted: inverted, ignoreCase: ignoreCase };
   }

   function peg$anyExpectation() {
     return { type: "any" };
   }

   function peg$endExpectation() {
     return { type: "end" };
   }

   function peg$otherExpectation(description) {
     return { type: "other", description: description };
   }

   function peg$computePosDetails(pos) {
     var details = peg$posDetailsCache[pos], p;

     if (details) {
       return details;
     } else {
       p = pos - 1;
       while (!peg$posDetailsCache[p]) {
         p--;
       }

       details = peg$posDetailsCache[p];
       details = {
         line:   details.line,
         column: details.column
       };

       while (p < pos) {
         if (input.charCodeAt(p) === 10) {
           details.line++;
           details.column = 1;
         } else {
           details.column++;
         }

         p++;
       }

       peg$posDetailsCache[pos] = details;
       return details;
     }
   }

   function peg$computeLocation(startPos, endPos) {
     var startPosDetails = peg$computePosDetails(startPos),
         endPosDetails   = peg$computePosDetails(endPos);

     return {
       start: {
         offset: startPos,
         line:   startPosDetails.line,
         column: startPosDetails.column
       },
       end: {
         offset: endPos,
         line:   endPosDetails.line,
         column: endPosDetails.column
       }
     };
   }

   function peg$fail(expected) {
     if (peg$currPos < peg$maxFailPos) { return; }

     if (peg$currPos > peg$maxFailPos) {
       peg$maxFailPos = peg$currPos;
       peg$maxFailExpected = [];
     }

     peg$maxFailExpected.push(expected);
   }

   function peg$buildSimpleError(message, location) {
     return new peg$SyntaxError(message, null, null, location);
   }

   function peg$buildStructuredError(expected, found, location) {
     return new peg$SyntaxError(
       peg$SyntaxError.buildMessage(expected, found),
       expected,
       found,
       location
     );
   }

   function peg$parseExp() {
     var s0, s1, s2, s3, s4, s5;

     s0 = peg$currPos;
     s1 = peg$parseSingleExp();
     if (s1 !== peg$FAILED) {
       s2 = peg$parse_();
       if (s2 !== peg$FAILED) {
         s3 = peg$parseComboOperator();
         if (s3 !== peg$FAILED) {
           s4 = peg$parse_();
           if (s4 !== peg$FAILED) {
             s5 = peg$parseExp();
             if (s5 !== peg$FAILED) {
               peg$savedPos = s0;
               s1 = peg$c0(s1, s3, s5);
               s0 = s1;
             } else {
               peg$currPos = s0;
               s0 = peg$FAILED;
             }
           } else {
             peg$currPos = s0;
             s0 = peg$FAILED;
           }
         } else {
           peg$currPos = s0;
           s0 = peg$FAILED;
         }
       } else {
         peg$currPos = s0;
         s0 = peg$FAILED;
       }
     } else {
       peg$currPos = s0;
       s0 = peg$FAILED;
     }
     if (s0 === peg$FAILED) {
       s0 = peg$parseSingleExp();
     }

     return s0;
   }

   function peg$parseSingleExp() {
     var s0, s1, s2, s3;

     s0 = peg$currPos;
     if (input.charCodeAt(peg$currPos) === 40) {
       s1 = peg$c1;
       peg$currPos++;
     } else {
       s1 = peg$FAILED;
       if (peg$silentFails === 0) { peg$fail(peg$c2); }
     }
     if (s1 !== peg$FAILED) {
       s2 = peg$parseExp();
       if (s2 !== peg$FAILED) {
         if (input.charCodeAt(peg$currPos) === 41) {
           s3 = peg$c3;
           peg$currPos++;
         } else {
           s3 = peg$FAILED;
           if (peg$silentFails === 0) { peg$fail(peg$c4); }
         }
         if (s3 !== peg$FAILED) {
           peg$savedPos = s0;
           s1 = peg$c5(s2);
           s0 = s1;
         } else {
           peg$currPos = s0;
           s0 = peg$FAILED;
         }
       } else {
         peg$currPos = s0;
         s0 = peg$FAILED;
       }
     } else {
       peg$currPos = s0;
       s0 = peg$FAILED;
     }
     if (s0 === peg$FAILED) {
       s0 = peg$parseBaseExp();
       if (s0 === peg$FAILED) {
         s0 = peg$parseUnitExp();
       }
     }

     return s0;
   }

   function peg$parseUnitExp() {
     var s0;

     s0 = peg$parseInteger();
     if (s0 === peg$FAILED) {
       s0 = peg$parseText();
       if (s0 === peg$FAILED) {
         s0 = peg$parseColumn();
         if (s0 === peg$FAILED) {
           s0 = peg$parseCellRef();
           if (s0 === peg$FAILED) {
             s0 = peg$parseBoolean();
           }
         }
       }
     }

     return s0;
   }

   function peg$parseBoolean() {
     var s0, s1;

     s0 = peg$currPos;
     if (input.substr(peg$currPos, 4) === peg$c6) {
       s1 = peg$c6;
       peg$currPos += 4;
     } else {
       s1 = peg$FAILED;
       if (peg$silentFails === 0) { peg$fail(peg$c7); }
     }
     if (s1 !== peg$FAILED) {
       peg$savedPos = s0;
       s1 = peg$c8();
     }
     s0 = s1;
     if (s0 === peg$FAILED) {
       s0 = peg$currPos;
       if (input.substr(peg$currPos, 5) === peg$c9) {
         s1 = peg$c9;
         peg$currPos += 5;
       } else {
         s1 = peg$FAILED;
         if (peg$silentFails === 0) { peg$fail(peg$c10); }
       }
       if (s1 !== peg$FAILED) {
         peg$savedPos = s0;
         s1 = peg$c11();
       }
       s0 = s1;
     }

     return s0;
   }

   function peg$parseBaseExp() {
     var s0, s1, s2, s3, s4, s5;

     s0 = peg$currPos;
     s1 = peg$parseUnitExp();
     if (s1 !== peg$FAILED) {
       s2 = peg$parse_();
       if (s2 !== peg$FAILED) {
         s3 = peg$parseCompareOperator();
         if (s3 !== peg$FAILED) {
           s4 = peg$parse_();
           if (s4 !== peg$FAILED) {
             s5 = peg$parseUnitExp();
             if (s5 !== peg$FAILED) {
               peg$savedPos = s0;
               s1 = peg$c12(s1, s3, s5);
               s0 = s1;
             } else {
               peg$currPos = s0;
               s0 = peg$FAILED;
             }
           } else {
             peg$currPos = s0;
             s0 = peg$FAILED;
           }
         } else {
           peg$currPos = s0;
           s0 = peg$FAILED;
         }
       } else {
         peg$currPos = s0;
         s0 = peg$FAILED;
       }
     } else {
       peg$currPos = s0;
       s0 = peg$FAILED;
     }

     return s0;
   }

   function peg$parseCompareOperator() {
     var s0;

     if (input.charCodeAt(peg$currPos) === 62) {
       s0 = peg$c13;
       peg$currPos++;
     } else {
       s0 = peg$FAILED;
       if (peg$silentFails === 0) { peg$fail(peg$c14); }
     }
     if (s0 === peg$FAILED) {
       if (input.charCodeAt(peg$currPos) === 60) {
         s0 = peg$c15;
         peg$currPos++;
       } else {
         s0 = peg$FAILED;
         if (peg$silentFails === 0) { peg$fail(peg$c16); }
       }
       if (s0 === peg$FAILED) {
         if (input.charCodeAt(peg$currPos) === 61) {
           s0 = peg$c17;
           peg$currPos++;
         } else {
           s0 = peg$FAILED;
           if (peg$silentFails === 0) { peg$fail(peg$c18); }
         }
       }
     }

     return s0;
   }

   function peg$parseComboOperator() {
     var s0;

     if (input.substr(peg$currPos, 2) === peg$c19) {
       s0 = peg$c19;
       peg$currPos += 2;
     } else {
       s0 = peg$FAILED;
       if (peg$silentFails === 0) { peg$fail(peg$c20); }
     }
     if (s0 === peg$FAILED) {
       if (input.substr(peg$currPos, 3) === peg$c21) {
         s0 = peg$c21;
         peg$currPos += 3;
       } else {
         s0 = peg$FAILED;
         if (peg$silentFails === 0) { peg$fail(peg$c22); }
       }
     }

     return s0;
   }

   function peg$parseInteger() {
     var s0, s1, s2;

     peg$silentFails++;
     s0 = peg$currPos;
     s1 = [];
     if (peg$c24.test(input.charAt(peg$currPos))) {
       s2 = input.charAt(peg$currPos);
       peg$currPos++;
     } else {
       s2 = peg$FAILED;
       if (peg$silentFails === 0) { peg$fail(peg$c25); }
     }
     if (s2 !== peg$FAILED) {
       while (s2 !== peg$FAILED) {
         s1.push(s2);
         if (peg$c24.test(input.charAt(peg$currPos))) {
           s2 = input.charAt(peg$currPos);
           peg$currPos++;
         } else {
           s2 = peg$FAILED;
           if (peg$silentFails === 0) { peg$fail(peg$c25); }
         }
       }
     } else {
       s1 = peg$FAILED;
     }
     if (s1 !== peg$FAILED) {
       peg$savedPos = s0;
       s1 = peg$c26();
     }
     s0 = s1;
     peg$silentFails--;
     if (s0 === peg$FAILED) {
       s1 = peg$FAILED;
       if (peg$silentFails === 0) { peg$fail(peg$c23); }
     }

     return s0;
   }

   function peg$parse_() {
     var s0, s1;

     peg$silentFails++;
     s0 = [];
     if (peg$c28.test(input.charAt(peg$currPos))) {
       s1 = input.charAt(peg$currPos);
       peg$currPos++;
     } else {
       s1 = peg$FAILED;
       if (peg$silentFails === 0) { peg$fail(peg$c29); }
     }
     while (s1 !== peg$FAILED) {
       s0.push(s1);
       if (peg$c28.test(input.charAt(peg$currPos))) {
         s1 = input.charAt(peg$currPos);
         peg$currPos++;
       } else {
         s1 = peg$FAILED;
         if (peg$silentFails === 0) { peg$fail(peg$c29); }
       }
     }
     peg$silentFails--;
     if (s0 === peg$FAILED) {
       s1 = peg$FAILED;
       if (peg$silentFails === 0) { peg$fail(peg$c27); }
     }

     return s0;
   }

   function peg$parseColumn() {
     var s0, s1, s2;

     s0 = peg$currPos;
     if (input.charCodeAt(peg$currPos) === 42) {
       s1 = peg$c30;
       peg$currPos++;
     } else {
       s1 = peg$FAILED;
       if (peg$silentFails === 0) { peg$fail(peg$c31); }
     }
     if (s1 !== peg$FAILED) {
       s2 = peg$parseVariable();
       if (s2 !== peg$FAILED) {
         peg$savedPos = s0;
         s1 = peg$c32(s2);
         s0 = s1;
       } else {
         peg$currPos = s0;
         s0 = peg$FAILED;
       }
     } else {
       peg$currPos = s0;
       s0 = peg$FAILED;
     }

     return s0;
   }

   function peg$parseCellRef() {
     var s0, s1, s2;

     s0 = peg$currPos;
     if (input.charCodeAt(peg$currPos) === 35) {
       s1 = peg$c33;
       peg$currPos++;
     } else {
       s1 = peg$FAILED;
       if (peg$silentFails === 0) { peg$fail(peg$c34); }
     }
     if (s1 !== peg$FAILED) {
       s2 = peg$parseVariable();
       if (s2 !== peg$FAILED) {
         peg$savedPos = s0;
         s1 = peg$c35(s2);
         s0 = s1;
       } else {
         peg$currPos = s0;
         s0 = peg$FAILED;
       }
     } else {
       peg$currPos = s0;
       s0 = peg$FAILED;
     }

     return s0;
   }

   function peg$parseText() {
     var s0, s1, s2, s3;

     s0 = peg$currPos;
     if (input.charCodeAt(peg$currPos) === 39) {
       s1 = peg$c36;
       peg$currPos++;
     } else {
       s1 = peg$FAILED;
       if (peg$silentFails === 0) { peg$fail(peg$c37); }
     }
     if (s1 !== peg$FAILED) {
       s2 = [];
       if (peg$c38.test(input.charAt(peg$currPos))) {
         s3 = input.charAt(peg$currPos);
         peg$currPos++;
       } else {
         s3 = peg$FAILED;
         if (peg$silentFails === 0) { peg$fail(peg$c39); }
       }
       if (s3 !== peg$FAILED) {
         while (s3 !== peg$FAILED) {
           s2.push(s3);
           if (peg$c38.test(input.charAt(peg$currPos))) {
             s3 = input.charAt(peg$currPos);
             peg$currPos++;
           } else {
             s3 = peg$FAILED;
             if (peg$silentFails === 0) { peg$fail(peg$c39); }
           }
         }
       } else {
         s2 = peg$FAILED;
       }
       if (s2 !== peg$FAILED) {
         if (input.charCodeAt(peg$currPos) === 39) {
           s3 = peg$c36;
           peg$currPos++;
         } else {
           s3 = peg$FAILED;
           if (peg$silentFails === 0) { peg$fail(peg$c37); }
         }
         if (s3 !== peg$FAILED) {
           peg$savedPos = s0;
           s1 = peg$c40(s2);
           s0 = s1;
         } else {
           peg$currPos = s0;
           s0 = peg$FAILED;
         }
       } else {
         peg$currPos = s0;
         s0 = peg$FAILED;
       }
     } else {
       peg$currPos = s0;
       s0 = peg$FAILED;
     }

     return s0;
   }

   function peg$parseVariable() {
     var s0, s1, s2;

     s0 = peg$currPos;
     s1 = [];
     if (peg$c41.test(input.charAt(peg$currPos))) {
       s2 = input.charAt(peg$currPos);
       peg$currPos++;
     } else {
       s2 = peg$FAILED;
       if (peg$silentFails === 0) { peg$fail(peg$c42); }
     }
     if (s2 !== peg$FAILED) {
       while (s2 !== peg$FAILED) {
         s1.push(s2);
         if (peg$c41.test(input.charAt(peg$currPos))) {
           s2 = input.charAt(peg$currPos);
           peg$currPos++;
         } else {
           s2 = peg$FAILED;
           if (peg$silentFails === 0) { peg$fail(peg$c42); }
         }
       }
     } else {
       s1 = peg$FAILED;
     }
     if (s1 !== peg$FAILED) {
       peg$savedPos = s0;
       s1 = peg$c43(s1);
     }
     s0 = s1;

     return s0;
   }

   peg$result = peg$startRuleFunction();

   if (peg$result !== peg$FAILED && peg$currPos === input.length) {
     return peg$result;
   } else {
     if (peg$result !== peg$FAILED && peg$currPos < input.length) {
       peg$fail(peg$endExpectation());
     }

     throw peg$buildStructuredError(
       peg$maxFailExpected,
       peg$maxFailPos < input.length ? input.charAt(peg$maxFailPos) : null,
       peg$maxFailPos < input.length
         ? peg$computeLocation(peg$maxFailPos, peg$maxFailPos + 1)
         : peg$computeLocation(peg$maxFailPos, peg$maxFailPos)
     );
   }
 }

 return {
   SyntaxError: peg$SyntaxError,
   parse:       peg$parse
 };
})();
/*
How to use

1. Go to Extensions menu -> AppScript -> Editor


2. Add the script id "1o2k7CgnuyaPD6nlp66C-NNsSd8XNbOvYIpAOZynMKaHpHd3A91UtTfud"
  in Libraries section

3. Open any code file and create a wrapper function to invoke the methods

function LIB(fname, ...args) {
  return sutils[fname](...args)
}

4. now we can use the method in cell formula
=LIB("SELECT", "A1:C3", "A,C")

*/


// - - - - - - - - - - - - - - - - - - - - -
//            USER DEFAULTS
// - - - - - - - - - - - - - - - - - - - - -

const SKIP_HEADER_COUNT = 'SKIP_HEADER_COUNT'
const CUSTOM_OPERATORS = 'CUSTOM_OPERATORS'

const nonce = new Date().toISOString()

function getNonce(){
  return nonce
}

const FALLBACK = {
  [SKIP_HEADER_COUNT] : 1,
}

function setDefault(k, v, time) {
  const currentHHMM = new Date().toLocaleTimeString().slice(0, 5)
  if (currentHHMM.indexOf(time) < 0){
    return `SET.ERROR @ Provide correct time HH:MM = ${currentHHMM}`
  }

  if (! (k in FALLBACK)) {
    return 'SET.ERROR @ Key not found'
  }

  var documentProperties = PropertiesService.getDocumentProperties();
  documentProperties.setProperty(k, JSON.stringify(v));
  return `SET.OK @ [${k}] = ${documentProperties.getProperty(k)}`
}

function removeDefault(k){
  var documentProperties = PropertiesService.getDocumentProperties();
  documentProperties.deleteProperty(k)
  return "REMOVE.OK @ " + new Date().toISOString()
}

function getAllDefaults(){
  var documentProperties = PropertiesService.getDocumentProperties();
  const defaults = documentProperties.getProperties()

  let out = ""
  for (let k in defaults) {
    if (k in FALLBACK) {
      out += `[${k}] : ${defaults[k]} \n`
    }
  }
  return "GETALL.OK @ \n" + out
}

function getDefault(k) {
  var documentProperties = PropertiesService.getDocumentProperties();
  return JSON.parse(documentProperties.getProperty(k) || null) || FALLBACK[k]
}


/* - - - - - - - - - - - - - - - - - - - - -
//            CUSTOM OPERATORS
// - - - - - - - - - - - - - - - - - - - - -

=setCustomOperator("isSubStr", "(x, y) => x.indexOf(y) >= 0", "12:27")

=invokeCustomOperator("isSubStr", "Apple", "pple")
TRUE

// =listCustomOperators("")
LIST_OP.OK @
1 : [mul] : (x, y) => x * y 
2 : [div] : (x, y) => x / y 
3 : [isSubStr] : (x, y) => x.indexOf(y) >= 0 

// - - - - - - - - - - - - - - - - - - - - -
*/
function setCustomOperator(op, lambdaString, time) {
  const currentHHMM = new Date().toLocaleTimeString().slice(0, 5)
  if (currentHHMM.indexOf(time) < 0){
    return `SET_OP.ERROR @ Provide correct time HH:MM = ${currentHHMM}`
  }

  var documentProperties = PropertiesService.getDocumentProperties();
  const operatorMap = JSON.parse(documentProperties.getProperty(CUSTOM_OPERATORS) || '{}')

  operatorMap[op] = lambdaString
  
  documentProperties.setProperty(CUSTOM_OPERATORS, JSON.stringify(operatorMap))
  return `SET_OP.OK @ ${op} ${new Date().toISOString()}`
}

function listCustomOperators() {
  var documentProperties = PropertiesService.getDocumentProperties();
  const operatorMap = JSON.parse(documentProperties.getProperty(CUSTOM_OPERATORS) || '{}')

  let out = ""
  let i = 1
  for (let k in operatorMap) {
    out += `${i} : [${k}] : ${operatorMap[k]} \n`
    i += 1
  }
  return "LIST_OP.OK @\n" + out
}

function invokeCustomOperator(op, x, y) {
  var documentProperties = PropertiesService.getDocumentProperties();
  const operatorMap = JSON.parse(documentProperties.getProperty(CUSTOM_OPERATORS) || '{}')

  const fString = operatorMap[op]
  if (! fString) {
    return `INVOKE.ERROR @ ${op} not found`
  }

  const f = eval(fString)
  return f(x, y)
}

// - - - - - - - - - - - - - - - - - - - - -
//            UTILS
// - - - - - - - - - - - - - - - - - - - - -

// *A -> 0, B -> 1, *C -> 2
function parseColumnIntoIndex(column) {
  if (column[0] == '*') {
    column = column.slice(1)
  }
  const index = column.trim().charCodeAt(0) - 'A'.charCodeAt(0)
  return index
}

// A, B, D becomes => [0, 1, 3]
function parseSelectionStr(selectionStr) {
  const outColumns = []
  const tokens = selectionStr.toUpperCase().split(',')

  for (const t of tokens){
    outColumns.push(parseColumnIntoIndex(t))
  }

  return outColumns
}

// "*A.Name,*B,*C.Count of Cities"
// => [{index:0, name: "Name"}, {index: 1, name: 'B'}, {index: 3, name: 'Count of Cities'}]
function parseSelectV2String(selectionV2Str, headerT) {
  const firstHeaderRow = headerT && headerT[0] || null

  const selectionStrList = selectionV2Str.split(',')
  const selList = selectionStrList.map((x) => {
    const tokens = x.trim().split('.')
    const colName = tokens[0].toUpperCase()
    const colIndex = parseColumnIntoIndex(colName)
    const providedName = tokens[1] || null
    const headerName = firstHeaderRow && firstHeaderRow[colIndex] || null
    const name = providedName || headerName || colName
    return {
      index: colIndex,
      name
    }
  })

  return selList
}

const Operations = {
  '=' : eval("(x, y) => {return x == y}"),
  '>' : eval("(x, y) => {return x > y}"),
  '<' : eval("(x, y) => {return x < y}"),
}

function getFieldValue(row, field) {
  if (typeof(field) == typeof('')) {
    if (field.startsWith('*')) {
      const columnName = field.slice(1)
      const fieldIndex = parseColumnIntoIndex(columnName)
      return row[fieldIndex] 
    }
  }

  return field
}

function runOp(row, op, x, y) {
  const valX = getFieldValue(row, x)
  const valY = getFieldValue(row, y)
  
  return Operations[op](valX, valY)
}

function splitHeaders(table, headerCount){
  const top = table.slice(0, headerCount)
  const bottom = table.slice(headerCount)
  return [top, bottom]
}

function prependHeaders(table, headerTable) {
  return [
    ...headerTable,
    ...table,
  ]
}

// assuming same height
// [['a', 'b']] + [['c']] = [['a', 'b', 'c']]
function stickHeadersSide(headerTable1, headerTable2, height) {
  const comboTable = []
  for (let i=0; i<height; i++) {
    comboTable.push([...headerTable1[i], ...headerTable2[i]])
  }
  return comboTable
}

function getWorkingHeaderCount(inputHeaderCount){
  if (inputHeaderCount === undefined) {
    return getDefault(SKIP_HEADER_COUNT)
  }
  return inputHeaderCount
}

// - - - - - - - - - - - - - - - - - - - - -
//            FINAL EXPOSED METHODS = LEFT_JOIN, SELECT, WHERE
// - - - - - - - - - - - - - - - - - - - - -


/*
Assumption: for each row in table1 (e.g employee, pk=companyId)
we'll use the first matching entry in table2(e.g company) for the pk specified (companyId) 

e.g LEFT_JOIN(SheetA!A1:C3, "*B", A2:C9, "*A", 1)

OR use with SELECT
=SELECT(LEFT_JOIN(Employees!A1:C5, "*B", A1:C3, "*A", 1), "*A,*C,*E")
*/

/**
 * LEFT_JOIN based on a column. Provided column of first table will be matched with pk of second table.
 * 
 * @param {A1:C10} table1 First table to join
 * @param {"*B"} pk1ColName column from first table e.g "*B"
 * @param {Sheets2!A1:D20} table2 Second table to join
 * @param {"*C"} pk2ColName pk of the second table e.g "*C"
 * @param {1} headerCount how many rows of headers in input table
 * @return {Table} Output Table.
 * @customfunction
 * 
 * e.g
 * =LEFT_JOIN(<students>, "*B", <schools>, "*A")
 */
function LEFT_JOIN(table1, pk1ColName, table2, pk2ColName, _hCount) {
  const hCount = getWorkingHeaderCount(_hCount)

  const [header1T, data1T] = splitHeaders(table1, hCount)
  const [header2T, data2T] = splitHeaders(table2, hCount)

  const pk1 = parseColumnIntoIndex(pk1ColName)
  const pk2 = parseColumnIntoIndex(pk2ColName)
  const t2Map = {}
  for (const row of data2T) {
    const k = row[pk2]
    t2Map[k] = row
  }

  const outTable = []
  for (const row of data1T) {
    const k = row[pk1]
    const t2Match = t2Map[k] || []

    const fullRow = [...row, ...t2Match]
    outTable.push(fullRow)
  }

  const comboHeaderTable = stickHeadersSide(header1T, header2T, hCount)
  return prependHeaders(outTable, comboHeaderTable)
}

/**
 * Select with rename option =SELECT(C2:D24, "*A,*B.Count of Videos")
 * 
 * @param {C2:D24} table Selection Range as input table.
 * @param {"*A,*B"} selectionString e.g "*A,*B.Count of Videos"
 * @param {1} headerCount OPTIONAL how many rows of headers in input table
 * @return {Table} Output Table.
 * @customfunction
 * 
 * =SELECT(GROUP_BY(Sheet3!A1:Z100, "*H", "COUNT *A"), "*A,*B.Count Of Videos")
 * =SELECT(C2:D24, "*A,*B.Count of Videos")
 *
 * // without headers available (headerCount=0)
 * =SELECT(C3:D24, "*A,*B.Count of Videos", 0)
 */
function SELECT(table, selectionV2Str, headerCount) {
  const [headerT, dataT] = splitHeaders(table, getWorkingHeaderCount(headerCount))

  const outColList = parseSelectV2String(selectionV2Str, headerT)
  const outTable = []
  for (const fullRow of dataT) {
    const subRow = []
    for (const colInfo of outColList){
      subRow.push(fullRow[colInfo.index])
    }
    outTable.push(subRow)
  }

  const outHeaderRow = outColList.map((colInfo) => colInfo.name)

  return prependHeaders(outTable, [outHeaderRow])
}

// - - - - - - - - - - - - - - - - - - - - -
//            OPERATOR FUNCTIONS for WHERE
// - - - - - - - - - - - - - - - - - - - - -

function runCompositeOp(opObject, row) {
  const x = opObject
  if (x.type == 'BASE') {
    return runOp(row, x.op, x.col1, x.col2)
  }
  if (x.type == 'OR') {
    return runCompositeOp(x.op1, row) || runCompositeOp(x.op2, row)
  }
  if (x.type == 'AND') {
    return runCompositeOp(x.op1, row) && runCompositeOp(x.op2, row)
  }

  throw new Error(`Invalid Composite Op Type ${x.type}`)
}

function L_OP(op, col1, col2){
  return JSON.stringify({
    type: 'BASE',
    op, col1, col2
  })
}

function L_AND(op1, op2){
  return JSON.stringify({
    type: 'AND',
    op1: JSON.parse(op1),
    op2: JSON.parse(op2)
  })
}

function L_OR(op1, op2){
  return JSON.stringify({
    type: 'OR',
    op1: JSON.parse(op1),
    op2: JSON.parse(op2)
  })
}

// #A33
function getCellRefValue(inputCellRef){
  const cellRef = inputCellRef.slice(1) // remove the first char (#)
  const value = SpreadsheetApp.getActiveSheet().getRange(cellRef).getValue();
  return value
}

function replaceCellRefInBaseClause(baseTree) {
  const col1 = baseTree.col1
  if (typeof(col1) == typeof('')) {
    if (col1[0] == '#') {
      baseTree.col1 = getCellRefValue(col1)
    }
  }

  const col2 = baseTree.col2
  if (typeof(col2) == typeof('')) {
    if (col2[0] == '#') {
      baseTree.col2 = getCellRefValue(col2)
    }
  }
}

function replaceCellRefInWhereTree(whereTree) {
  if (whereTree.type == 'AND' || whereTree.type == 'OR') {
    replaceCellRefInWhereTree(whereTree.op1)
    replaceCellRefInWhereTree(whereTree.op2)
  }
  else if (whereTree.type == 'BASE') {
    replaceCellRefInBaseClause(whereTree)
  }
  else {
    throw new Error(`Unsupported type ${whereTree.type}`)
  }
}

/**
 * WHERE clause
 * 
 * @param {E2:H6} table Selection Range as input table.
 * @param {"*A = 2 AND *B='Bob'"} opHumanString where expression e.g "*A = 'Bob'"
 * @param {1} headerCount OPTIONAL how many rows of headers in input table
 * @return {Table} Output Table.
 * @customfunction
 * 
 * e.g
 * =SELECT(WHERE(E2:H6, "*A = 2 AND *B='Bob'", "*A,*D"))
 * =WHERE(E2:I6, "*E > 10")
 */
function WHERE(table, opHumanString, headerCount) {
  const opString = L_PARSE(opHumanString)
  const opObject = JSON.parse(opString)
  replaceCellRefInWhereTree(opObject) // in-place changes
  const [headerT, dataT] = splitHeaders(table, getWorkingHeaderCount(headerCount))
  const fData = dataT.filter((row) => {
    return runCompositeOp(opObject, row)
  })
  return prependHeaders(fData, headerT)
}


/* - - - - - - - - - - - - - - - - - - - - -
//           GROUP BY
=GROUP_BY(<table>, "*A,*C", "SUM *B", "COUNT *D")
// - - - - - - - - - - - - - - - - - - - - -
*/

// "sum *B" "count *D"
function runAggOp(aggOpString, rows){
  let [op, col] = aggOpString.split(" ")
  op = op.trim().toUpperCase()
  if (op == 'SUM') {
    let total = 0
    for (let row of rows){
      const fieldVal = getFieldValue(row, col)
      total += fieldVal
    }
    return total
  }

  if (op == 'COUNT') {
    let total = 0
    for (let row of rows){
      const fieldVal = getFieldValue(row, col)
      if (fieldVal) {
        total += 1
      }
    }
    return total
  }
}

/**
 * GROUP_BY clause
 * 
 * @param {A1:D10} table Selection Range as input table.
 * @param {"*B,*C"} columnsStr which colums to group by e.g "*B, *C"
 * @param {"COUNT 1"} agg1 first aggregate e.g "SUM 1"
 * @param {"SUM *D"} agg2 second aggregate e.g "COUNT *B"
 * @param {Integer} headerCount how many rows of headers in input table
 * @return {Table} Output Table.
 * @customfunction
 * 
 * e.g
 * =GROUP_BY(A1:D10, "*B,*C", "COUNT *A", "SUM *D")
 */
function GROUP_BY(table, columnsStr, agg1, agg2, headerCount) {
  const columns = columnsStr.split(',')
  const [headerT, dataT] = splitHeaders(table, getWorkingHeaderCount(headerCount))

  const groupByMap = {}
  for (let row of dataT) {
    const keyParts = []
    for (let col of columns) {
      const colVal = getFieldValue(row, col)
      keyParts.push(colVal)
    }

    const key = JSON.stringify(keyParts)
    if (! (key in groupByMap )) {
      groupByMap[key] = {
        keyParts,
        elements: []
      }
    }

    groupByMap[key].elements.push(row)
  }

  const headerRow = headerT[0]
  const outHeaderRow = []
  for (let col of columns) {
    if (headerRow) {
      const hVal = getFieldValue(headerT[0], col)
      outHeaderRow.push(hVal)
    }
    else {
      outHeaderRow.push(col)
    }
  }
  outHeaderRow.push(agg1, agg2)

  const outTable = []

  for (let key in groupByMap) {
    const keyParts = groupByMap[key].keyParts

    const outRow = [...keyParts]
    if (agg1) {
      const outAgg = runAggOp(agg1, groupByMap[key].elements)
      outRow.push(outAgg)
    }

    if (agg2) {
      const outAgg = runAggOp(agg2, groupByMap[key].elements)
      outRow.push(outAgg)
    }

    outTable.push(outRow)
  }

  return prependHeaders(outTable, [outHeaderRow])
}

/* - - - - - - - - - - - - - - - - - - - - -
//           ORDER_BY
=ORDER_BY(<table>, "*A ASC,*C DESC")

=ORDER_BY(C2:D24, "*B DESC,*A DESC")
// - - - - - - - - - - - - - - - - - - - - -
*/

function parseOrderClause(orderClause){
  const parts = orderClause.split(",")
  const orderConditionList = parts.map((x) => {
    const [column, order] = x.split(" ")
    return {
      'col': column,
      'ord': order
    }
  })
  return orderConditionList
}

function normalComp(v1, v2){
  if (v1 < v2) {
    return -1
  }
  else if (v1 > v2) {
    return 1
  }
  else {
    return 0
  }
}

function runOrderCondition(row1, row2, orderCondition) {
  const v1 = getFieldValue(row1, orderCondition.col)
  const v2 = getFieldValue(row2, orderCondition.col)

  const outAsc = normalComp(v1, v2)
  return orderCondition.ord == 'ASC' ? outAsc : -outAsc
}

function runOrderConditionList(row1, row2, orderConditionList) {
  for (let cond of orderConditionList) {
    const out = runOrderCondition(row1, row2, cond)
    if (out != 0) return out
  }

  return 0
}

/**
 * ORDER_BY clause
 * 
 * @param {A1:C10} table Selection Range as input table.
 * @param {"*C DESC, *A ASC"} orderClause order clause e.g "*C DESC, *A ASC"
 * @param {1} headerCount OPTIONAL how many rows of headers in input table
 * @return {Table} Output Table.
 * @customfunction
 * 
 * e.g
 * =ORDER_BY(A1:C10, "*C DESC, *A ASC")
 */
function ORDER_BY(table, orderClause, headerCount) {
  const [headerT, dataT] = splitHeaders(table, getWorkingHeaderCount(headerCount))
  
  const orderConditionList = parseOrderClause(orderClause)
  dataT.sort((row1, row2) => runOrderConditionList(row1, row2, orderConditionList))

  return prependHeaders(dataT, headerT)
}


/* - - - - - - - - - - - - - - - - - - - - -
//           L_PARSE where clause expression parser
// - - - - - - - - - - - - - - - - - - - - -
*/

function testPeg() {
  console.log(PegParserLib.parse("('*B' > 1) OR ('*A' = 'Bob')"))
}


/**
 * Parse the where clause expression
 * 
 * @param {"'*C' = 34"} expression input expression e.g `"(4 < 5) OR ('*C' = 'Bengaluru') OR *D > *E"`
 * @returns {String} Parsed expression object JSON
 * @customfunction
 * 
 */
function L_PARSE(expression) {
  return JSON.stringify(PegParserLib.parse(expression))
}



function test() {
  const table = [['name', 'age'], ['Alice',2], ['Bob',4]]

  const out2 = WHERE(table, "(*B > 1) AND (*A = 'Bob')") // L_OR(L_OP(">", "*B", 1), L_OP("=", "*A", "Bob")))
  console.log(out2)

  const out3 = WHERE(table, "*B>2") // L_OP(">", "*B", 2))
  console.log(out3)

  // return DEFAULTS[SKIP_HEADER_COUNT]
  console.log(L_OP(">", "*B", 2))

  const orderConditionList = parseOrderClause("*B DESC")
  console.log(orderConditionList)

  const out5 = runOrderConditionList(table[1], table[2], orderConditionList)
  console.log(out5)

  var cellA1 = SpreadsheetApp.getActiveSheet().getRange('A1').getValue();
  console.log(JSON.stringify({x: cellA1}))

  return out3
}

