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
