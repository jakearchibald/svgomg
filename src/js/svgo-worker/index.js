"use strict";
// Working around 6to5 hoisting bug:
// It hoists generator defintiions to the top, which brings it before
// the runtime, which isn't helpful.
// TODO: this bug has been fixed, so maybe go back to one file?
require("regenerator/runtime");
require("./main");