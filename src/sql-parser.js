// 2023-12--sheet-peg-parser.js
// to be put into app script as Parser.gs

PegParserLib = (function() {
  "use strict";

function peg$subclass(child, parent) {
  function C() { this.constructor = child; }
  C.prototype = parent.prototype;
  child.prototype = new C();
}

function peg$SyntaxError(message, expected, found, location) {
  var self = Error.call(this, message);
  // istanbul ignore next Check is a necessary evil to support older environments
  if (Object.setPrototypeOf) {
    Object.setPrototypeOf(self, peg$SyntaxError.prototype);
  }
  self.expected = expected;
  self.found = found;
  self.location = location;
  self.name = "SyntaxError";
  return self;
}

peg$subclass(peg$SyntaxError, Error);

function peg$padEnd(str, targetLength, padString) {
  padString = padString || " ";
  if (str.length > targetLength) { return str; }
  targetLength -= str.length;
  padString += padString.repeat(targetLength);
  return str + padString.slice(0, targetLength);
}

peg$SyntaxError.prototype.format = function(sources) {
  var str = "Error: " + this.message;
  if (this.location) {
    var src = null;
    var k;
    for (k = 0; k < sources.length; k++) {
      if (sources[k].source === this.location.source) {
        src = sources[k].text.split(/\r\n|\n|\r/g);
        break;
      }
    }
    var s = this.location.start;
    var offset_s = (this.location.source && (typeof this.location.source.offset === "function"))
      ? this.location.source.offset(s)
      : s;
    var loc = this.location.source + ":" + offset_s.line + ":" + offset_s.column;
    if (src) {
      var e = this.location.end;
      var filler = peg$padEnd("", offset_s.line.toString().length, ' ');
      var line = src[s.line - 1];
      var last = s.line === e.line ? e.column : line.length + 1;
      var hatLen = (last - s.column) || 1;
      str += "\n --> " + loc + "\n"
          + filler + " |\n"
          + offset_s.line + " | " + line + "\n"
          + filler + " | " + peg$padEnd("", s.column - 1, ' ')
          + peg$padEnd("", hatLen, "^");
    } else {
      str += "\n at " + loc;
    }
  }
  return str;
};

peg$SyntaxError.buildMessage = function(expected, found) {
  var DESCRIBE_EXPECTATION_FNS = {
    literal: function(expectation) {
      return "\"" + literalEscape(expectation.text) + "\"";
    },

    class: function(expectation) {
      var escapedParts = expectation.parts.map(function(part) {
        return Array.isArray(part)
          ? classEscape(part[0]) + "-" + classEscape(part[1])
          : classEscape(part);
      });

      return "[" + (expectation.inverted ? "^" : "") + escapedParts.join("") + "]";
    },

    any: function() {
      return "any character";
    },

    end: function() {
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
      .replace(/\\/g, "\\\\")
      .replace(/"/g,  "\\\"")
      .replace(/\0/g, "\\0")
      .replace(/\t/g, "\\t")
      .replace(/\n/g, "\\n")
      .replace(/\r/g, "\\r")
      .replace(/[\x00-\x0F]/g,          function(ch) { return "\\x0" + hex(ch); })
      .replace(/[\x10-\x1F\x7F-\x9F]/g, function(ch) { return "\\x"  + hex(ch); });
  }

  function classEscape(s) {
    return s
      .replace(/\\/g, "\\\\")
      .replace(/\]/g, "\\]")
      .replace(/\^/g, "\\^")
      .replace(/-/g,  "\\-")
      .replace(/\0/g, "\\0")
      .replace(/\t/g, "\\t")
      .replace(/\n/g, "\\n")
      .replace(/\r/g, "\\r")
      .replace(/[\x00-\x0F]/g,          function(ch) { return "\\x0" + hex(ch); })
      .replace(/[\x10-\x1F\x7F-\x9F]/g, function(ch) { return "\\x"  + hex(ch); });
  }

  function describeExpectation(expectation) {
    return DESCRIBE_EXPECTATION_FNS[expectation.type](expectation);
  }

  function describeExpected(expected) {
    var descriptions = expected.map(describeExpectation);
    var i, j;

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
  options = options !== undefined ? options : {};

  var peg$FAILED = {};
  var peg$source = options.grammarSource;

  var peg$startRuleFunctions = { Exp: peg$parseExp };
  var peg$startRuleFunction = peg$parseExp;

  var peg$c0 = "(";
  var peg$c1 = ")";
  var peg$c2 = "TRUE";
  var peg$c3 = "FALSE";
  var peg$c4 = ">=";
  var peg$c5 = "<=";
  var peg$c6 = ">";
  var peg$c7 = "<";
  var peg$c8 = "=";
  var peg$c9 = "OR";
  var peg$c10 = "AND";
  var peg$c11 = ".";
  var peg$c12 = "*";
  var peg$c13 = "#";
  var peg$c14 = "'";
  var peg$c15 = "$";
  var peg$c16 = ",";

  var peg$r0 = /^[\-0-9]/;
  var peg$r1 = /^[ \t\n\r]/;
  var peg$r2 = /^[^']/;
  var peg$r3 = /^[A-Za-z0-9*#_]/;

  var peg$e0 = peg$literalExpectation("(", false);
  var peg$e1 = peg$literalExpectation(")", false);
  var peg$e2 = peg$literalExpectation("TRUE", false);
  var peg$e3 = peg$literalExpectation("FALSE", false);
  var peg$e4 = peg$literalExpectation(">=", false);
  var peg$e5 = peg$literalExpectation("<=", false);
  var peg$e6 = peg$literalExpectation(">", false);
  var peg$e7 = peg$literalExpectation("<", false);
  var peg$e8 = peg$literalExpectation("=", false);
  var peg$e9 = peg$literalExpectation("OR", false);
  var peg$e10 = peg$literalExpectation("AND", false);
  var peg$e11 = peg$otherExpectation("integer");
  var peg$e12 = peg$classExpectation(["-", ["0", "9"]], false, false);
  var peg$e13 = peg$literalExpectation(".", false);
  var peg$e14 = peg$otherExpectation("whitespace");
  var peg$e15 = peg$classExpectation([" ", "\t", "\n", "\r"], false, false);
  var peg$e16 = peg$literalExpectation("*", false);
  var peg$e17 = peg$literalExpectation("#", false);
  var peg$e18 = peg$literalExpectation("'", false);
  var peg$e19 = peg$classExpectation(["'"], true, false);
  var peg$e20 = peg$classExpectation([["A", "Z"], ["a", "z"], ["0", "9"], "*", "#", "_"], false, false);
  var peg$e21 = peg$literalExpectation("$", false);
  var peg$e22 = peg$literalExpectation(",", false);

  var peg$f0 = function(head, op, tail) {
  	return {type: op, op1: head, op2: tail}
  };
  var peg$f1 = function(e) {return e};
  var peg$f2 = function() { return true};
  var peg$f3 = function() { return false};
  var peg$f4 = function(head, op, tail) {
  	return {type: 'BASE', op, col1: head, col2: tail}
  };
  var peg$f5 = function() { return parseInt(text(), 10); };
  var peg$f6 = function(x, y) { return parseFloat(x + "." + y); };
  var peg$f7 = function(str) {return "*" + str};
  var peg$f8 = function(str) {return "#" + str};
  var peg$f9 = function(str) {
  	return str.join('')
  };
  var peg$f10 = function(str) {return str.join('')};
  var peg$f11 = function(fn, args) {
    args = args || []
    const outArgs = []
    if (args[1]) outArgs.push(args[1])
    if (args[2]) outArgs.push(...args[2].map((x) => x[3]))
    return {
      type: 'Function',
      name: fn,
      args: outArgs
    }
  };
  var peg$currPos = 0;
  var peg$savedPos = 0;
  var peg$posDetailsCache = [{ line: 1, column: 1 }];
  var peg$maxFailPos = 0;
  var peg$maxFailExpected = [];
  var peg$silentFails = 0;

  var peg$result;

  if ("startRule" in options) {
    if (!(options.startRule in peg$startRuleFunctions)) {
      throw new Error("Can't start parsing from rule \"" + options.startRule + "\".");
    }

    peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
  }

  function text() {
    return input.substring(peg$savedPos, peg$currPos);
  }

  function offset() {
    return peg$savedPos;
  }

  function range() {
    return {
      source: peg$source,
      start: peg$savedPos,
      end: peg$currPos
    };
  }

  function location() {
    return peg$computeLocation(peg$savedPos, peg$currPos);
  }

  function expected(description, location) {
    location = location !== undefined
      ? location
      : peg$computeLocation(peg$savedPos, peg$currPos);

    throw peg$buildStructuredError(
      [peg$otherExpectation(description)],
      input.substring(peg$savedPos, peg$currPos),
      location
    );
  }

  function error(message, location) {
    location = location !== undefined
      ? location
      : peg$computeLocation(peg$savedPos, peg$currPos);

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
    var details = peg$posDetailsCache[pos];
    var p;

    if (details) {
      return details;
    } else {
      p = pos - 1;
      while (!peg$posDetailsCache[p]) {
        p--;
      }

      details = peg$posDetailsCache[p];
      details = {
        line: details.line,
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

  function peg$computeLocation(startPos, endPos, offset) {
    var startPosDetails = peg$computePosDetails(startPos);
    var endPosDetails = peg$computePosDetails(endPos);

    var res = {
      source: peg$source,
      start: {
        offset: startPos,
        line: startPosDetails.line,
        column: startPosDetails.column
      },
      end: {
        offset: endPos,
        line: endPosDetails.line,
        column: endPosDetails.column
      }
    };
    if (offset && peg$source && (typeof peg$source.offset === "function")) {
      res.start = peg$source.offset(res.start);
      res.end = peg$source.offset(res.end);
    }
    return res;
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
      s3 = peg$parseComboOperator();
      if (s3 !== peg$FAILED) {
        s4 = peg$parse_();
        s5 = peg$parseExp();
        if (s5 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f0(s1, s3, s5);
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
      s1 = peg$c0;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e0); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parseExp();
      if (s2 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 41) {
          s3 = peg$c1;
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$e1); }
        }
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f1(s2);
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
    }

    return s0;
  }

  function peg$parseUnitExp() {
    var s0;

    s0 = peg$parseFloat();
    if (s0 === peg$FAILED) {
      s0 = peg$parseInteger();
      if (s0 === peg$FAILED) {
        s0 = peg$parseText();
        if (s0 === peg$FAILED) {
          s0 = peg$parseFunctionCall();
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
      }
    }

    return s0;
  }

  function peg$parseBoolean() {
    var s0, s1;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 4) === peg$c2) {
      s1 = peg$c2;
      peg$currPos += 4;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e2); }
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$f2();
    }
    s0 = s1;
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      if (input.substr(peg$currPos, 5) === peg$c3) {
        s1 = peg$c3;
        peg$currPos += 5;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$e3); }
      }
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$f3();
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
      s3 = peg$parseCompareOperator();
      if (s3 !== peg$FAILED) {
        s4 = peg$parse_();
        s5 = peg$parseUnitExp();
        if (s5 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f4(s1, s3, s5);
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

    if (input.substr(peg$currPos, 2) === peg$c4) {
      s0 = peg$c4;
      peg$currPos += 2;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e4); }
    }
    if (s0 === peg$FAILED) {
      if (input.substr(peg$currPos, 2) === peg$c5) {
        s0 = peg$c5;
        peg$currPos += 2;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$e5); }
      }
      if (s0 === peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 62) {
          s0 = peg$c6;
          peg$currPos++;
        } else {
          s0 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$e6); }
        }
        if (s0 === peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 60) {
            s0 = peg$c7;
            peg$currPos++;
          } else {
            s0 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$e7); }
          }
          if (s0 === peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 61) {
              s0 = peg$c8;
              peg$currPos++;
            } else {
              s0 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$e8); }
            }
          }
        }
      }
    }

    return s0;
  }

  function peg$parseComboOperator() {
    var s0;

    if (input.substr(peg$currPos, 2) === peg$c9) {
      s0 = peg$c9;
      peg$currPos += 2;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e9); }
    }
    if (s0 === peg$FAILED) {
      if (input.substr(peg$currPos, 3) === peg$c10) {
        s0 = peg$c10;
        peg$currPos += 3;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$e10); }
      }
    }

    return s0;
  }

  function peg$parseInteger() {
    var s0, s1, s2;

    peg$silentFails++;
    s0 = peg$currPos;
    s1 = [];
    if (peg$r0.test(input.charAt(peg$currPos))) {
      s2 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s2 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e12); }
    }
    if (s2 !== peg$FAILED) {
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        if (peg$r0.test(input.charAt(peg$currPos))) {
          s2 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$e12); }
        }
      }
    } else {
      s1 = peg$FAILED;
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$f5();
    }
    s0 = s1;
    peg$silentFails--;
    if (s0 === peg$FAILED) {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e11); }
    }

    return s0;
  }

  function peg$parseFloat() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    s1 = peg$parseInteger();
    if (s1 !== peg$FAILED) {
      if (input.charCodeAt(peg$currPos) === 46) {
        s2 = peg$c11;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$e13); }
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$parseInteger();
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f6(s1, s3);
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

  function peg$parse_() {
    var s0, s1;

    peg$silentFails++;
    s0 = [];
    if (peg$r1.test(input.charAt(peg$currPos))) {
      s1 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e15); }
    }
    while (s1 !== peg$FAILED) {
      s0.push(s1);
      if (peg$r1.test(input.charAt(peg$currPos))) {
        s1 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$e15); }
      }
    }
    peg$silentFails--;
    s1 = peg$FAILED;
    if (peg$silentFails === 0) { peg$fail(peg$e14); }

    return s0;
  }

  function peg$parseColumn() {
    var s0, s1, s2;

    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 42) {
      s1 = peg$c12;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e16); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parseVariable();
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s0 = peg$f7(s2);
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
      s1 = peg$c13;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e17); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parseVariable();
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s0 = peg$f8(s2);
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
      s1 = peg$c14;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e18); }
    }
    if (s1 !== peg$FAILED) {
      s2 = [];
      if (peg$r2.test(input.charAt(peg$currPos))) {
        s3 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s3 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$e19); }
      }
      if (s3 !== peg$FAILED) {
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          if (peg$r2.test(input.charAt(peg$currPos))) {
            s3 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$e19); }
          }
        }
      } else {
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 39) {
          s3 = peg$c14;
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$e18); }
        }
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f9(s2);
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
    if (peg$r3.test(input.charAt(peg$currPos))) {
      s2 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s2 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e20); }
    }
    if (s2 !== peg$FAILED) {
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        if (peg$r3.test(input.charAt(peg$currPos))) {
          s2 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$e20); }
        }
      }
    } else {
      s1 = peg$FAILED;
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$f10(s1);
    }
    s0 = s1;

    return s0;
  }

  function peg$parseFunctionCall() {
    var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13;

    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 36) {
      s1 = peg$c15;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e21); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parseVariable();
      if (s2 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 40) {
          s3 = peg$c0;
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$e0); }
        }
        if (s3 !== peg$FAILED) {
          s4 = peg$currPos;
          s5 = peg$parse_();
          s6 = peg$parseUnitExp();
          if (s6 !== peg$FAILED) {
            s7 = [];
            s8 = peg$currPos;
            s9 = peg$parse_();
            if (input.charCodeAt(peg$currPos) === 44) {
              s10 = peg$c16;
              peg$currPos++;
            } else {
              s10 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$e22); }
            }
            if (s10 !== peg$FAILED) {
              s11 = peg$parse_();
              s12 = peg$parseUnitExp();
              if (s12 !== peg$FAILED) {
                s13 = peg$parse_();
                s9 = [s9, s10, s11, s12, s13];
                s8 = s9;
              } else {
                peg$currPos = s8;
                s8 = peg$FAILED;
              }
            } else {
              peg$currPos = s8;
              s8 = peg$FAILED;
            }
            while (s8 !== peg$FAILED) {
              s7.push(s8);
              s8 = peg$currPos;
              s9 = peg$parse_();
              if (input.charCodeAt(peg$currPos) === 44) {
                s10 = peg$c16;
                peg$currPos++;
              } else {
                s10 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$e22); }
              }
              if (s10 !== peg$FAILED) {
                s11 = peg$parse_();
                s12 = peg$parseUnitExp();
                if (s12 !== peg$FAILED) {
                  s13 = peg$parse_();
                  s9 = [s9, s10, s11, s12, s13];
                  s8 = s9;
                } else {
                  peg$currPos = s8;
                  s8 = peg$FAILED;
                }
              } else {
                peg$currPos = s8;
                s8 = peg$FAILED;
              }
            }
            s5 = [s5, s6, s7];
            s4 = s5;
          } else {
            peg$currPos = s4;
            s4 = peg$FAILED;
          }
          if (s4 === peg$FAILED) {
            s4 = null;
          }
          if (input.charCodeAt(peg$currPos) === 41) {
            s5 = peg$c1;
            peg$currPos++;
          } else {
            s5 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$e1); }
          }
          if (s5 !== peg$FAILED) {
            peg$savedPos = s0;
            s0 = peg$f11(s2, s4);
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
    parse: peg$parse
  };
})()
;
