PegParserLib=
(function() {
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

  var peg$c0 = "<WHERE>";
  var peg$c1 = "<SELECT>";
  var peg$c2 = ",";
  var peg$c3 = "<AGG>";
  var peg$c4 = "<GROUP_BY>";
  var peg$c5 = "<ORDER_BY>";
  var peg$c6 = "ASC";
  var peg$c7 = "DESC";
  var peg$c8 = "AS";
  var peg$c9 = "(";
  var peg$c10 = ")";
  var peg$c11 = ">=";
  var peg$c12 = "<=";
  var peg$c13 = ">";
  var peg$c14 = "<";
  var peg$c15 = "=";
  var peg$c16 = "OR";
  var peg$c17 = "AND";
  var peg$c18 = ".";
  var peg$c19 = "TRUE";
  var peg$c20 = "FALSE";
  var peg$c21 = "*";
  var peg$c22 = "#";
  var peg$c23 = "'";
  var peg$c24 = "$";

  var peg$r0 = /^[\-0-9]/;
  var peg$r1 = /^[ \t\n\r]/;
  var peg$r2 = /^[^']/;
  var peg$r3 = /^[A-Za-z0-9*#_]/;

  var peg$e0 = peg$literalExpectation("<WHERE>", false);
  var peg$e1 = peg$literalExpectation("<SELECT>", false);
  var peg$e2 = peg$literalExpectation(",", false);
  var peg$e3 = peg$literalExpectation("<AGG>", false);
  var peg$e4 = peg$literalExpectation("<GROUP_BY>", false);
  var peg$e5 = peg$literalExpectation("<ORDER_BY>", false);
  var peg$e6 = peg$literalExpectation("ASC", false);
  var peg$e7 = peg$literalExpectation("DESC", false);
  var peg$e8 = peg$literalExpectation("AS", false);
  var peg$e9 = peg$literalExpectation("(", false);
  var peg$e10 = peg$literalExpectation(")", false);
  var peg$e11 = peg$literalExpectation(">=", false);
  var peg$e12 = peg$literalExpectation("<=", false);
  var peg$e13 = peg$literalExpectation(">", false);
  var peg$e14 = peg$literalExpectation("<", false);
  var peg$e15 = peg$literalExpectation("=", false);
  var peg$e16 = peg$literalExpectation("OR", false);
  var peg$e17 = peg$literalExpectation("AND", false);
  var peg$e18 = peg$otherExpectation("integer");
  var peg$e19 = peg$classExpectation(["-", ["0", "9"]], false, false);
  var peg$e20 = peg$literalExpectation(".", false);
  var peg$e21 = peg$literalExpectation("TRUE", false);
  var peg$e22 = peg$literalExpectation("FALSE", false);
  var peg$e23 = peg$otherExpectation("whitespace");
  var peg$e24 = peg$classExpectation([" ", "\t", "\n", "\r"], false, false);
  var peg$e25 = peg$literalExpectation("*", false);
  var peg$e26 = peg$literalExpectation("#", false);
  var peg$e27 = peg$literalExpectation("'", false);
  var peg$e28 = peg$classExpectation(["'"], true, false);
  var peg$e29 = peg$classExpectation([["A", "Z"], ["a", "z"], ["0", "9"], "*", "#", "_"], false, false);
  var peg$e30 = peg$literalExpectation("$", false);

  var peg$f0 = function(x) {
 	return {
 	  type: 'WHERE',
      value: x
     }
    };
  var peg$f1 = function(first, rest) {
  	  const outArgs = [first]
      if (rest) outArgs.push(...rest.map((x) => x[3]))
  	  return {
        	type: 'SELECT',
            value: outArgs
        }
  };
  var peg$f2 = function(first, rest) {
  	  const outArgs = [first]
      if (rest) outArgs.push(...rest.map((x) => x[3]))
  	  return {
        	type: 'AGG',
            value: outArgs
        }
  };
  var peg$f3 = function(first, rest) {
  	  const outArgs = [first]
      if (rest) outArgs.push(...rest.map((x) => x[3]))
  	  return {
        	type: 'GROUP_BY',
            value: outArgs
        }
  };
  var peg$f4 = function(first, rest) {
  	  const outArgs = [first]
      if (rest) outArgs.push(...rest.map((x) => x[3]))
  	  return {
        	type: 'ORDER_BY',
            value: outArgs
        }
  };
  var peg$f5 = function(col, order) {
  	return {exp: col, order}
  };
  var peg$f6 = function(x, y) {
  	 const out = {exp: x}
     if (y) out.rename = y[3]
     return out
  };
  var peg$f7 = function(x) { return {type: 'PRIMITIVE', value: x}};
  var peg$f8 = function(head, op, tail) {
  	return {type: op, op1: head, op2: tail}
  };
  var peg$f9 = function(e) {return e};
  var peg$f10 = function(x) { return {type: 'PRIMITIVE', value: x}};
  var peg$f11 = function(head, op, tail) {
  	return {type: 'COMPARE', op, col1: head, col2: tail}
  };
  var peg$f12 = function() { return parseInt(text(), 10); };
  var peg$f13 = function(x, y) { return parseFloat(x + "." + y); };
  var peg$f14 = function() { return true};
  var peg$f15 = function() { return false};
  var peg$f16 = function(str) {return {type: 'COLUMN', value: str}};
  var peg$f17 = function(str) {return {type: 'CELLREF', value: str}};
  var peg$f18 = function(str) {
  	return str.join('')
  };
  var peg$f19 = function(str) {return str.join('')};
  var peg$f20 = function(fn, args) {
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
    var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 7) === peg$c0) {
      s1 = peg$c0;
      peg$currPos += 7;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e0); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parseWhereExp();
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s0 = peg$f0(s2);
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      if (input.substr(peg$currPos, 8) === peg$c1) {
        s1 = peg$c1;
        peg$currPos += 8;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$e1); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseSelectExp();
        if (s2 !== peg$FAILED) {
          s3 = [];
          s4 = peg$currPos;
          s5 = peg$parse_();
          if (input.charCodeAt(peg$currPos) === 44) {
            s6 = peg$c2;
            peg$currPos++;
          } else {
            s6 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$e2); }
          }
          if (s6 !== peg$FAILED) {
            s7 = peg$parse_();
            s8 = peg$parseSelectExp();
            if (s8 !== peg$FAILED) {
              s9 = peg$parse_();
              s5 = [s5, s6, s7, s8, s9];
              s4 = s5;
            } else {
              peg$currPos = s4;
              s4 = peg$FAILED;
            }
          } else {
            peg$currPos = s4;
            s4 = peg$FAILED;
          }
          while (s4 !== peg$FAILED) {
            s3.push(s4);
            s4 = peg$currPos;
            s5 = peg$parse_();
            if (input.charCodeAt(peg$currPos) === 44) {
              s6 = peg$c2;
              peg$currPos++;
            } else {
              s6 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$e2); }
            }
            if (s6 !== peg$FAILED) {
              s7 = peg$parse_();
              s8 = peg$parseSelectExp();
              if (s8 !== peg$FAILED) {
                s9 = peg$parse_();
                s5 = [s5, s6, s7, s8, s9];
                s4 = s5;
              } else {
                peg$currPos = s4;
                s4 = peg$FAILED;
              }
            } else {
              peg$currPos = s4;
              s4 = peg$FAILED;
            }
          }
          peg$savedPos = s0;
          s0 = peg$f1(s2, s3);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
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
          s2 = peg$parseFunctionCall();
          if (s2 !== peg$FAILED) {
            s3 = [];
            s4 = peg$currPos;
            s5 = peg$parse_();
            if (input.charCodeAt(peg$currPos) === 44) {
              s6 = peg$c2;
              peg$currPos++;
            } else {
              s6 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$e2); }
            }
            if (s6 !== peg$FAILED) {
              s7 = peg$parse_();
              s8 = peg$parseFunctionCall();
              if (s8 !== peg$FAILED) {
                s9 = peg$parse_();
                s5 = [s5, s6, s7, s8, s9];
                s4 = s5;
              } else {
                peg$currPos = s4;
                s4 = peg$FAILED;
              }
            } else {
              peg$currPos = s4;
              s4 = peg$FAILED;
            }
            while (s4 !== peg$FAILED) {
              s3.push(s4);
              s4 = peg$currPos;
              s5 = peg$parse_();
              if (input.charCodeAt(peg$currPos) === 44) {
                s6 = peg$c2;
                peg$currPos++;
              } else {
                s6 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$e2); }
              }
              if (s6 !== peg$FAILED) {
                s7 = peg$parse_();
                s8 = peg$parseFunctionCall();
                if (s8 !== peg$FAILED) {
                  s9 = peg$parse_();
                  s5 = [s5, s6, s7, s8, s9];
                  s4 = s5;
                } else {
                  peg$currPos = s4;
                  s4 = peg$FAILED;
                }
              } else {
                peg$currPos = s4;
                s4 = peg$FAILED;
              }
            }
            peg$savedPos = s0;
            s0 = peg$f2(s2, s3);
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          if (input.substr(peg$currPos, 10) === peg$c4) {
            s1 = peg$c4;
            peg$currPos += 10;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$e4); }
          }
          if (s1 !== peg$FAILED) {
            s2 = peg$parseGroupByArg();
            if (s2 !== peg$FAILED) {
              s3 = [];
              s4 = peg$currPos;
              s5 = peg$parse_();
              if (input.charCodeAt(peg$currPos) === 44) {
                s6 = peg$c2;
                peg$currPos++;
              } else {
                s6 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$e2); }
              }
              if (s6 !== peg$FAILED) {
                s7 = peg$parse_();
                s8 = peg$parseGroupByArg();
                if (s8 !== peg$FAILED) {
                  s9 = peg$parse_();
                  s5 = [s5, s6, s7, s8, s9];
                  s4 = s5;
                } else {
                  peg$currPos = s4;
                  s4 = peg$FAILED;
                }
              } else {
                peg$currPos = s4;
                s4 = peg$FAILED;
              }
              while (s4 !== peg$FAILED) {
                s3.push(s4);
                s4 = peg$currPos;
                s5 = peg$parse_();
                if (input.charCodeAt(peg$currPos) === 44) {
                  s6 = peg$c2;
                  peg$currPos++;
                } else {
                  s6 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$e2); }
                }
                if (s6 !== peg$FAILED) {
                  s7 = peg$parse_();
                  s8 = peg$parseGroupByArg();
                  if (s8 !== peg$FAILED) {
                    s9 = peg$parse_();
                    s5 = [s5, s6, s7, s8, s9];
                    s4 = s5;
                  } else {
                    peg$currPos = s4;
                    s4 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s4;
                  s4 = peg$FAILED;
                }
              }
              peg$savedPos = s0;
              s0 = peg$f3(s2, s3);
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
          if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            if (input.substr(peg$currPos, 10) === peg$c5) {
              s1 = peg$c5;
              peg$currPos += 10;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$e5); }
            }
            if (s1 !== peg$FAILED) {
              s2 = peg$parseOrderByExp();
              if (s2 !== peg$FAILED) {
                s3 = [];
                s4 = peg$currPos;
                s5 = peg$parse_();
                if (input.charCodeAt(peg$currPos) === 44) {
                  s6 = peg$c2;
                  peg$currPos++;
                } else {
                  s6 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$e2); }
                }
                if (s6 !== peg$FAILED) {
                  s7 = peg$parse_();
                  s8 = peg$parseOrderByExp();
                  if (s8 !== peg$FAILED) {
                    s9 = peg$parse_();
                    s5 = [s5, s6, s7, s8, s9];
                    s4 = s5;
                  } else {
                    peg$currPos = s4;
                    s4 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s4;
                  s4 = peg$FAILED;
                }
                while (s4 !== peg$FAILED) {
                  s3.push(s4);
                  s4 = peg$currPos;
                  s5 = peg$parse_();
                  if (input.charCodeAt(peg$currPos) === 44) {
                    s6 = peg$c2;
                    peg$currPos++;
                  } else {
                    s6 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$e2); }
                  }
                  if (s6 !== peg$FAILED) {
                    s7 = peg$parse_();
                    s8 = peg$parseOrderByExp();
                    if (s8 !== peg$FAILED) {
                      s9 = peg$parse_();
                      s5 = [s5, s6, s7, s8, s9];
                      s4 = s5;
                    } else {
                      peg$currPos = s4;
                      s4 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s4;
                    s4 = peg$FAILED;
                  }
                }
                peg$savedPos = s0;
                s0 = peg$f4(s2, s3);
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          }
        }
      }
    }

    return s0;
  }

  function peg$parseOrderByExp() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    s1 = peg$parseColumn();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse_();
      s3 = peg$parseOrderEnum();
      if (s3 !== peg$FAILED) {
        peg$savedPos = s0;
        s0 = peg$f5(s1, s3);
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

  function peg$parseOrderEnum() {
    var s0;

    if (input.substr(peg$currPos, 3) === peg$c6) {
      s0 = peg$c6;
      peg$currPos += 3;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e6); }
    }
    if (s0 === peg$FAILED) {
      if (input.substr(peg$currPos, 4) === peg$c7) {
        s0 = peg$c7;
        peg$currPos += 4;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$e7); }
      }
    }

    return s0;
  }

  function peg$parseSelectExp() {
    var s0, s1, s2, s3, s4, s5, s6;

    s0 = peg$currPos;
    s1 = peg$parseSingleExp();
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      s3 = peg$parse_();
      if (input.substr(peg$currPos, 2) === peg$c8) {
        s4 = peg$c8;
        peg$currPos += 2;
      } else {
        s4 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$e8); }
      }
      if (s4 !== peg$FAILED) {
        s5 = peg$parse_();
        s6 = peg$parseRenameString();
        if (s6 !== peg$FAILED) {
          s3 = [s3, s4, s5, s6];
          s2 = s3;
        } else {
          peg$currPos = s2;
          s2 = peg$FAILED;
        }
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 === peg$FAILED) {
        s2 = null;
      }
      peg$savedPos = s0;
      s0 = peg$f6(s1, s2);
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseGroupByArg() {
    var s0, s1;

    s0 = peg$parseColumn();
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      s1 = peg$parsePrimitive();
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$f7(s1);
      }
      s0 = s1;
    }

    return s0;
  }

  function peg$parseRenameString() {
    var s0;

    s0 = peg$parseText();
    if (s0 === peg$FAILED) {
      s0 = peg$parseVariable();
    }

    return s0;
  }

  function peg$parseWhereExp() {
    var s0, s1, s2, s3, s4, s5;

    s0 = peg$currPos;
    s1 = peg$parseSingleExp();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse_();
      s3 = peg$parseComboOperator();
      if (s3 !== peg$FAILED) {
        s4 = peg$parse_();
        s5 = peg$parseWhereExp();
        if (s5 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f8(s1, s3, s5);
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
      s1 = peg$c9;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e9); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parseWhereExp();
      if (s2 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 41) {
          s3 = peg$c10;
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$e10); }
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
    if (s0 === peg$FAILED) {
      s0 = peg$parseCompareExp();
      if (s0 === peg$FAILED) {
        s0 = peg$parseUnitExp();
      }
    }

    return s0;
  }

  function peg$parseUnitExp() {
    var s0, s1;

    s0 = peg$currPos;
    s1 = peg$parsePrimitive();
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$f10(s1);
    }
    s0 = s1;
    if (s0 === peg$FAILED) {
      s0 = peg$parseFunctionCall();
      if (s0 === peg$FAILED) {
        s0 = peg$parseCellRef();
        if (s0 === peg$FAILED) {
          s0 = peg$parseColumn();
        }
      }
    }

    return s0;
  }

  function peg$parsePrimitive() {
    var s0;

    s0 = peg$parseFloat();
    if (s0 === peg$FAILED) {
      s0 = peg$parseInteger();
      if (s0 === peg$FAILED) {
        s0 = peg$parseText();
        if (s0 === peg$FAILED) {
          s0 = peg$parseBoolean();
        }
      }
    }

    return s0;
  }

  function peg$parseCompareExp() {
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
          s0 = peg$f11(s1, s3, s5);
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

    if (input.substr(peg$currPos, 2) === peg$c11) {
      s0 = peg$c11;
      peg$currPos += 2;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e11); }
    }
    if (s0 === peg$FAILED) {
      if (input.substr(peg$currPos, 2) === peg$c12) {
        s0 = peg$c12;
        peg$currPos += 2;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$e12); }
      }
      if (s0 === peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 62) {
          s0 = peg$c13;
          peg$currPos++;
        } else {
          s0 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$e13); }
        }
        if (s0 === peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 60) {
            s0 = peg$c14;
            peg$currPos++;
          } else {
            s0 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$e14); }
          }
          if (s0 === peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 61) {
              s0 = peg$c15;
              peg$currPos++;
            } else {
              s0 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$e15); }
            }
          }
        }
      }
    }

    return s0;
  }

  function peg$parseComboOperator() {
    var s0;

    if (input.substr(peg$currPos, 2) === peg$c16) {
      s0 = peg$c16;
      peg$currPos += 2;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e16); }
    }
    if (s0 === peg$FAILED) {
      if (input.substr(peg$currPos, 3) === peg$c17) {
        s0 = peg$c17;
        peg$currPos += 3;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$e17); }
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
      if (peg$silentFails === 0) { peg$fail(peg$e19); }
    }
    if (s2 !== peg$FAILED) {
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        if (peg$r0.test(input.charAt(peg$currPos))) {
          s2 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$e19); }
        }
      }
    } else {
      s1 = peg$FAILED;
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$f12();
    }
    s0 = s1;
    peg$silentFails--;
    if (s0 === peg$FAILED) {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e18); }
    }

    return s0;
  }

  function peg$parseFloat() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    s1 = peg$parseInteger();
    if (s1 !== peg$FAILED) {
      if (input.charCodeAt(peg$currPos) === 46) {
        s2 = peg$c18;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$e20); }
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$parseInteger();
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f13(s1, s3);
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

  function peg$parseBoolean() {
    var s0, s1;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 4) === peg$c19) {
      s1 = peg$c19;
      peg$currPos += 4;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e21); }
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$f14();
    }
    s0 = s1;
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      if (input.substr(peg$currPos, 5) === peg$c20) {
        s1 = peg$c20;
        peg$currPos += 5;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$e22); }
      }
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$f15();
      }
      s0 = s1;
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
      if (peg$silentFails === 0) { peg$fail(peg$e24); }
    }
    while (s1 !== peg$FAILED) {
      s0.push(s1);
      if (peg$r1.test(input.charAt(peg$currPos))) {
        s1 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$e24); }
      }
    }
    peg$silentFails--;
    s1 = peg$FAILED;
    if (peg$silentFails === 0) { peg$fail(peg$e23); }

    return s0;
  }

  function peg$parseColumn() {
    var s0, s1, s2;

    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 42) {
      s1 = peg$c21;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e25); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parseRenameString();
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s0 = peg$f16(s2);
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
      s1 = peg$c22;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e26); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parseVariable();
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s0 = peg$f17(s2);
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
      s1 = peg$c23;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e27); }
    }
    if (s1 !== peg$FAILED) {
      s2 = [];
      if (peg$r2.test(input.charAt(peg$currPos))) {
        s3 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s3 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$e28); }
      }
      if (s3 !== peg$FAILED) {
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          if (peg$r2.test(input.charAt(peg$currPos))) {
            s3 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$e28); }
          }
        }
      } else {
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 39) {
          s3 = peg$c23;
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$e27); }
        }
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f18(s2);
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
      if (peg$silentFails === 0) { peg$fail(peg$e29); }
    }
    if (s2 !== peg$FAILED) {
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        if (peg$r3.test(input.charAt(peg$currPos))) {
          s2 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$e29); }
        }
      }
    } else {
      s1 = peg$FAILED;
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$f19(s1);
    }
    s0 = s1;

    return s0;
  }

  function peg$parseFunctionCall() {
    var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13;

    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 36) {
      s1 = peg$c24;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e30); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parseVariable();
      if (s2 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 40) {
          s3 = peg$c9;
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$e9); }
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
              s10 = peg$c2;
              peg$currPos++;
            } else {
              s10 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$e2); }
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
                s10 = peg$c2;
                peg$currPos++;
              } else {
                s10 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$e2); }
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
            s5 = peg$c10;
            peg$currPos++;
          } else {
            s5 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$e10); }
          }
          if (s5 !== peg$FAILED) {
            peg$savedPos = s0;
            s0 = peg$f20(s2, s4);
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

ENABLE_DEBUG=true

function DEBUG(...args){
  if (ENABLE_DEBUG) console.log(...args)
}

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

// 0 -> A, 2 -> C
function parseColumnIndexIntoColumnCharacter(columnIndex){
  const out = String.fromCharCode(65 + columnIndex)
  return out
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
  '>=' : eval("(x, y) => {return x >= y}"),
  '<=' : eval("(x, y) => {return x <= y}"),
}

// {type: 'COLUMN', value: 'A'}
// {type: 'PRIMITIVE', value: 'A'}
function getFieldValue(row, field) {
  if (field.type == 'PRIMITIVE') return field.value

  if (field.type == 'COLUMN') {
    const columnName = field.value
    const fieldIndex = parseColumnIntoIndex(columnName)
    return row[fieldIndex] 
  }

  return field
}

function runOp(row, op, x, y) {
  const valX = getFieldValue(row, x)
  const valY = getFieldValue(row, y)

  DEBUG(JSON.stringify({msg: `runOp`, op, valX, valY}))
  
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
 * @param {"*C"} pk2ColName pk of the second table e.g "*C" or "*'Student Name'"
 * @param {1} headerCount how many rows of headers in input table
 * @return {Table} Output Table.
 * @customfunction
 * 
 * e.g
 * =LEFT_JOIN(<students>, "*B", <schools>, "*'School ID'")
 */
function LEFT_JOIN(table1, pk1ColName, table2, pk2ColName, _hCount) {
  const hCount = getWorkingHeaderCount(_hCount)

  const [header1T, data1T] = splitHeaders(table1, hCount)
  const [header2T, data2T] = splitHeaders(table2, hCount)

  const pk1 = JSON.parse(L_PARSE("<GROUP_BY>" + pk1ColName)).value[0]
  const pk2 = JSON.parse(L_PARSE("<GROUP_BY>" + pk2ColName)).value[0]

  const columnNameMap1 = buildColumnNameMap(header1T[0] || [])
  const columnNameMap2 = buildColumnNameMap(header2T[0] || [])
  replaceColumnNameInColumnExpr(pk1, columnNameMap1)
  replaceColumnNameInColumnExpr(pk2, columnNameMap2)

  // const pk1 = parseColumnIntoIndex(pk1ColName)
  // const pk2 = parseColumnIntoIndex(pk2ColName)
  const t2Map = {}
  for (const row of data2T) {
    const k = getFieldValue(row, pk2)
    t2Map[k] = row
  }

  const outTable = []
  for (const row of data1T) {
    const k = getFieldValue(row, pk1)
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
 * @param {"*A,*B AS Name"} selectionString e.g "*A,*B.Count of Videos"
 * @param {1} headerCount OPTIONAL how many rows of headers in input table
 * @return {Table} Output Table.
 * @customfunction
 * 
 * =SELECT(GROUP_BY(Sheet3!A1:Z100, "*H", "COUNT *A"), "*A,*B.Count Of Videos")
 * =SELECT(C2:D24, "*A,*B.Count of Videos")
 *
 * // without headers available (headerCount=0)
 * =SELECT(C3:D24, "*A,*'Video Count' AS 'Count of Videos'", 0)
 */
function SELECT(table, selectionV2Str, headerCount) {
  const [headerT, dataT] = splitHeaders(table, getWorkingHeaderCount(headerCount))

  // {"type":"SELECT","value":[{"exp":{"type":"COLUMN","value":"name"},"rename":"MyName"}]}
  const selectTree = JSON.parse(L_PARSE("<SELECT>" + selectionV2Str))
  const columnNameMap = buildColumnNameMap(headerT[0] || [])
  const columnList = selectTree.value
  columnList.map((singleSelect) => replaceColumnNameInColumnExpr(singleSelect.exp, columnNameMap))

  // const outColList = parseSelectV2String(selectionV2Str, headerT)
  const outTable = []
  for (const fullRow of dataT) {
    const subRow = []
    for (const colInfo of columnList){
      subRow.push(getFieldValue(fullRow, colInfo.exp))
    }
    outTable.push(subRow)
  }

  const outHeaderRow = columnList.map((colInfo) => {
    const newName = colInfo.rename || getFieldValue(headerT[0], colInfo.exp)
    return newName
  })

  return prependHeaders(outTable, [outHeaderRow])
}

// - - - - - - - - - - - - - - - - - - - - -
//            OPERATOR FUNCTIONS for WHERE
// - - - - - - - - - - - - - - - - - - - - -

function runCompositeOp(opObject, row) {
  const x = opObject
  if (x.type == 'COMPARE') {
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


// A33
function getCellRefValue(cellRef){
  const value = SpreadsheetApp.getActiveSheet().getRange(cellRef).getValue();
  return value
}

function replaceCellRefInBaseClause(baseTree) {
  const col1 = baseTree.col1
  if (col1.type == 'CELLREF') {
    baseTree.col1 = {
      type: 'PRIMITIVE',
      value: getCellRefValue(col1.value)
    }
  }

  const col2 = baseTree.col2
  if (col2.type == 'CELLREF') {
    baseTree.col2 = {
      type: 'PRIMITIVE',
      value: getCellRefValue(col2.value)
    }
  }
}

function replaceCellRefInWhereTree(whereTree) {
  if (whereTree.type == 'AND' || whereTree.type == 'OR') {
    replaceCellRefInWhereTree(whereTree.op1)
    replaceCellRefInWhereTree(whereTree.op2)
  }
  else if (whereTree.type == 'COMPARE') {
    replaceCellRefInBaseClause(whereTree)
  }
  else {
    throw new Error(`Unsupported type ${whereTree.type}`)
  }
}


// 'Name' -> C or 'Name' (default)
function getColumnNameReplacement(inputCol, columnNameMap){
  const columnName = inputCol.toLowerCase().trim() // remove the first char (*) & normalize
  if (columnNameMap[columnName]) {
    return `${columnNameMap[columnName]}`
  }
  return inputCol
}

function replaceColumnNameInColumnExpr(colExpr, columnNameMap) {
  if (colExpr.type == 'COLUMN') {
    colExpr.value = getColumnNameReplacement(colExpr.value, columnNameMap)
  }
}

function replaceColumnNameInCompareClause(baseTree, columnNameMap) {
  replaceColumnNameInColumnExpr(baseTree.col1, columnNameMap)
  replaceColumnNameInColumnExpr(baseTree.col2, columnNameMap)
}


function replaceColumnNameInWhereTree(whereTree, columnNameMap) {
  if (whereTree.type == 'AND' || whereTree.type == 'OR') {
    replaceColumnNameInWhereTree(whereTree.op1, columnNameMap)
    replaceColumnNameInWhereTree(whereTree.op2, columnNameMap)
  }
  else if (whereTree.type == 'COMPARE') {
    replaceColumnNameInCompareClause(whereTree, columnNameMap)
  }
  else {
    throw new Error(`Unsupported type ${whereTree.type}`)
  }
}

function buildColumnNameMap(headerRow){
  const out = {}
  for (let i in headerRow) {
    const name = headerRow[i]
    const canonicalName = name.trim().toLowerCase()
    out[canonicalName] = parseColumnIndexIntoColumnCharacter(parseInt(i))
  }
  return out
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
  const opString = L_PARSE("<WHERE>"+opHumanString)
  const opObject = JSON.parse(opString).value
  replaceCellRefInWhereTree(opObject) // in-place changes
  const [headerT, dataT] = splitHeaders(table, getWorkingHeaderCount(headerCount))
  const columnNameMap = buildColumnNameMap(headerT[0] || [])
  replaceColumnNameInWhereTree(opObject, columnNameMap) // repalce *Name -> *C
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
// {"type":"Function","name":"COUNT","args":[{"type":"PRIMITIVE","value":3}]}
function runAggOp(aggOpFn, rows){
  console.log(aggOpFn)
  let op = aggOpFn.name
  let col = aggOpFn.args[0] // take the first argument
  op = op.trim().toUpperCase()
  console.log({op, col})
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

  throw new Error(`Agg Op ${op} not supported`)
}

/**
 * GROUP_BY clause
 * 
 * @param {A1:D10} table Selection Range as input table.
 * @param {"*B,*C"} columnsStr which colums to group by e.g "*B, *C"
 * @param {"$COUNT(1), $SUM(*D)"} aggExpr aggregate expression
 * @param {Integer} headerCount how many rows of headers in input table
 * @return {Table} Output Table.
 * @customfunction
 * 
 * e.g
 * =GROUP_BY(A1:D10, "*B,*Name,1", "$COUNT(*A), $SUM(*D)")
 */
function GROUP_BY(table, columnsStr, aggrExprStr, headerCount) {
  const aggrExpr = JSON.parse(L_PARSE("<AGG>" + aggrExprStr))
  const aggList = aggrExpr.value

  const columnExpr = JSON.parse(L_PARSE("<GROUP_BY>" + columnsStr))
  const columnList = columnExpr.value

  const [headerT, dataT] = splitHeaders(table, getWorkingHeaderCount(headerCount))

  // replace column name in columnList
  const columnNameMap = buildColumnNameMap(headerT[0])
  columnList.map((col) => replaceColumnNameInColumnExpr(col, columnNameMap))

  // replace column name in aggList
  aggList.map((aggFn) => {
    aggFn.args.map((col) => replaceColumnNameInColumnExpr(col, columnNameMap))
  })

  const groupByMap = {}
  for (let row of dataT) {
    const keyParts = []
    for (let col of columnList) {
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
  for (let col of columnList) {
    if (headerRow) {
      const hVal = getFieldValue(headerT[0], col)
      outHeaderRow.push(hVal)
    }
    else {
      outHeaderRow.push(col)
    }
  }

  for (let aggFn of aggList) {
    // const outAgg = runAggOp(aggFn, groupByMap[key].elements)
    outHeaderRow.push(`${aggFn.name} ${aggFn.args[0].value}`)
    // outRow.push(outAgg)
  }

  const outTable = []

  for (let key in groupByMap) {
    const keyParts = groupByMap[key].keyParts

    const outRow = [...keyParts]
    // 
    for (let aggFn of aggList) {
      const outAgg = runAggOp(aggFn, groupByMap[key].elements)
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
  const v1 = getFieldValue(row1, orderCondition.exp)
  const v2 = getFieldValue(row2, orderCondition.exp)

  const outAsc = normalComp(v1, v2)
  return orderCondition.order == 'ASC' ? outAsc : -outAsc
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
 * =ORDER_BY(A1:C10, "*C DESC, *Name ASC")
 */
function ORDER_BY(table, orderClause, headerCount) {
  const [headerT, dataT] = splitHeaders(table, getWorkingHeaderCount(headerCount))

  const columnNameMap = buildColumnNameMap(headerT[0] || [])

  // {"type":"ORDER_BY","value":[{"exp":{"type":"COLUMN","value":"name"},"order":"DESC"}]}
  const orderTree = JSON.parse(L_PARSE("<ORDER_BY>"+orderClause))
  const orderConditionList = orderTree.value
  orderConditionList.map((orderCond) => replaceColumnNameInColumnExpr(orderCond.exp, columnNameMap))

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