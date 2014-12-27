"use strict";
// Working around 6to5 hoisting bug:
// It hoists generator defintiions to the top, which brings it before
// the runtime, which isn't helpful.
require("6to5/lib/6to5/transformation/transformers/es6-generators/runtime");
require("./main");