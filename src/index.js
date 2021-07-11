const { stage } = window;

document.body.style.margin = "0";
document.body.style.height = "100vh";
stage.width = document.body.clientWidth;
stage.height = document.body.clientHeight;

const context = stage.getContext("2d");

const arr = Array.from({ length: 100 }, () => Math.floor(Math.random() * 1000));

let steps = 0;
let fn = undefined;

const inc = () => {
  steps++;
};

window.inc = inc;

const reset = () => {
  steps = 0;
};

function statementCounter(babel) {
  const t = babel.types;
  return {
    visitor: {
      FunctionDeclaration(path) {
        fn = path.node.id.name;
      },
      WhileStatement(path) {
        path
          .get("body")
          .unshiftContainer(
            "body",
            t.expressionStatement(t.callExpression(t.identifier("inc"), []))
          );
      },
      IfStatement(path) {
        path
          .get("consequent")
          .unshiftContainer(
            "body",
            t.expressionStatement(t.callExpression(t.identifier("inc"), []))
          );
      },
      VariableDeclaration(path) {
        path.insertAfter(
          t.expressionStatement(t.callExpression(t.identifier("inc"), []))
        );
      },
      ReturnStatement(path) {
        path.insertBefore(
          t.expressionStatement(t.callExpression(t.identifier("inc"), []))
        );
      },
      AssignmentExpression(path) {
        path.insertAfter(
          t.expressionStatement(t.callExpression(t.identifier("inc"), []))
        );
      },
      UpdateExpression(path) {
        path.insertAfter(
          t.expressionStatement(t.callExpression(t.identifier("inc"), []))
        );
      },
    },
  };
}

Babel.registerPlugin("statementCounter", statementCounter);

function mapRange(a1, a2, b1, b2, s) {
  return b1 + ((s - a1) * (b2 - b1)) / (a2 - a1);
}

const MAX_SIZE = 1000;

function createTest(input, color) {
  const output = Babel.transform(input, {
    plugins: ["statementCounter"],
  });

  window.eval(output.code);

  let max = 0;
  let min = Infinity;
  let runs = [];
  for (let i = 0; i < MAX_SIZE; i++) {
    window[fn](
      Array.from({ length: i }, () => 0),
      i
    );
    if (max < steps) {
      max = steps;
    }
    if (min > steps) {
      min = steps;
    }
    runs.push(steps);
    reset();
  }
  context.strokeStyle = color;
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(0, stage.height);
  runs.forEach((run, i) => {
    context.lineTo(i, stage.height - mapRange(0, MAX_SIZE, min, max, run));
  });
  context.stroke();
}

const binarySearch = `function binarySearch(arr, value) {
  let lower = 0;
  let upper = arr.length - 1;

  while (lower <= upper) {
    let midpoint = Math.round((upper + lower) / 2);
    let valueAtMidpoint = arr[midpoint];

    if (valueAtMidpoint === value) {
      return value;
    } else if (value < valueAtMidpoint) {
      upper = midpoint - 1;
    } else if (value > valueAtMidpoint) {
      lower = midpoint + 1;
    }
  }

  return -1;
}`;

createTest(binarySearch, "red");

const linearSearch = `function linearSearch(arr, value) {
  let lower = 0;
  let upper = arr.length - 1;

  while (lower <= upper) {
    if (arr[lower] === value) {
      return value;
    }

    lower++;
  }

  return -1;
}`;

createTest(linearSearch, "blue");
