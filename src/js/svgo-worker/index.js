"use strict";
// Working around 6to5 hoisting bug:
// It hoists generator defintiions to the top, which brings it before
// the runtime, which isn't helpful.
require("regenerator/runtime");
require("./main");