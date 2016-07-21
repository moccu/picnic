System.config({
  "baseURL": "/",
  "transpiler": "babel",
  "babelOptions": {
    "optional": [
      "runtime"
    ]
  },
  "paths": {
    "*": "*.js",
    "picnic/*": "src/*.js",
    "github:*": "jspm_packages/github/*.js",
    "npm:*": "jspm_packages/npm/*.js"
  }
});

System.config({
  "map": {
    "babel": "npm:babel-core@5.0.12",
    "babel-runtime": "npm:babel-runtime@5.0.12",
    "backbone": "github:moccu/backbone@1.1.2",
    "backbone.geppetto": "npm:backbone.geppetto@0.7.1",
    "core-js": "npm:core-js@0.8.4",
    "es5shim": "github:es-shims/es5-shim@4.5.2",
    "jquery": "github:components/jquery@2.1.3",
    "jquery-qunit": "github:jquery/qunit@1.20.0",
    "kenwheeler/slick": "github:kenwheeler/slick@1.5.8",
    "lolex": "github:sinonjs/lolex@1.4.0",
    "sinon": "github:sinonjs/sinon@1.17.3",
    "sinon-qunit": "github:cjohansen/sinon-qunit@2.0.0",
    "text": "github:systemjs/plugin-text@0.0.2",
    "underscore": "npm:underscore@1.7.0",
    "github:jspm/nodelibs-assert@0.1.0": {
      "assert": "npm:assert@1.3.0"
    },
    "github:jspm/nodelibs-process@0.1.2": {
      "process": "npm:process@0.11.2"
    },
    "github:jspm/nodelibs-util@0.1.0": {
      "util": "npm:util@0.10.3"
    },
    "npm:assert@1.3.0": {
      "util": "npm:util@0.10.3"
    },
    "npm:backbone.geppetto@0.7.1": {
      "backbone": "npm:backbone@1.1.2",
      "process": "github:jspm/nodelibs-process@0.1.2",
      "underscore": "npm:underscore@1.7.0"
    },
    "npm:backbone@1.1.2": {
      "process": "github:jspm/nodelibs-process@0.1.2",
      "underscore": "npm:underscore@1.7.0"
    },
    "npm:core-js@0.8.4": {
      "process": "github:jspm/nodelibs-process@0.1.2"
    },
    "npm:inherits@2.0.1": {
      "util": "github:jspm/nodelibs-util@0.1.0"
    },
    "npm:process@0.11.2": {
      "assert": "github:jspm/nodelibs-assert@0.1.0"
    },
    "npm:util@0.10.3": {
      "inherits": "npm:inherits@2.0.1",
      "process": "github:jspm/nodelibs-process@0.1.2"
    }
  }
});

