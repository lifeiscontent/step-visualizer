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
      BinaryExpression(path) {
        if (
          path.parentPath.isForStatement() ||
          path.parentPath.isWhileStatement()
        ) {
          path.parentPath
            .get("body")
            .unshiftContainer(
              "body",
              t.addComment(
                t.expressionStatement(
                  t.callExpression(t.identifier("inc"), [])
                ),
                "trailing",
                ` ${path.type} (${path.parent.type})`,
                true
              )
            );
        } else if (path.parentPath.isIfStatement()) {
          path.parentPath
            .get("consequent")
            .unshiftContainer(
              "body",
              t.addComment(
                t.expressionStatement(
                  t.callExpression(t.identifier("inc"), [])
                ),
                "trailing",
                ` ${path.type} (${path.parent.type})`,
                true
              )
            );
        }
      },
      VariableDeclaration(path) {
        if (path.parentPath.isForStatement()) {
          path.parentPath.insertBefore(
            t.addComment(
              t.expressionStatement(t.callExpression(t.identifier("inc"), [])),
              "trailing",
              ` ${path.type} (${path.parent.type})`,
              true
            )
          );

          return;
        }

        path.insertBefore(
          t.addComment(
            t.expressionStatement(t.callExpression(t.identifier("inc"), [])),
            "trailing",
            ` ${path.type}`,
            true
          )
        );
      },
      ReturnStatement(path) {
        path.insertBefore(
          t.addComment(
            t.expressionStatement(t.callExpression(t.identifier("inc"), [])),
            "trailing",
            ` ${path.type}`,
            true
          )
        );
      },
      AssignmentExpression(path) {
        path.insertAfter(
          t.addComment(
            t.expressionStatement(t.callExpression(t.identifier("inc"), [])),
            "trailing",
            ` ${path.type}`,
            true
          )
        );
      },
      UpdateExpression(path) {
        if (path.parentPath.isForStatement()) {
          path.parentPath
            .get("body")
            .unshiftContainer(
              "body",
              t.addComment(
                t.expressionStatement(
                  t.callExpression(t.identifier("inc"), [])
                ),
                "trailing",
                ` ${path.type} (${path.parent.type})`,
                true
              )
            );

          return;
        }
        path.insertAfter(
          t.addComment(
            t.expressionStatement(t.callExpression(t.identifier("inc"), [])),
            "trailing",
            ` ${path.type}`,
            true
          )
        );
        path.skip();
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
      Array.from({ length: i + 1 }, (v, k) => k + 1),
      i + 1
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
  context.moveTo(100, stage.height);
  runs.forEach((run, i) => {
    context.lineTo(i + 100, stage.height - mapRange(0, MAX_SIZE, min, max, run));
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

const bubbleSort = `function bubbleSort(arr) {
  let lower = 0;
  let upper = arr.length - 1;

  while (lower < upper) {
    let a = arr[lower];
    let b = arr[lower + 1];

    if (a > b) {
      arr[lower] = b;
      arr[lower + 1] = a;
    }

    lower++;
  }

  return arr;
}`;

createTest(bubbleSort, "green");

const selectionSort = `function selectionSort(arr) {
  for (let i = 0; i < arr.length - 1; i++) {
    let lowestNumberIndex = i;
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[j] < arr[lowestNumberIndex]) {
        lowestNumberIndex = j;
      }
    }

    if (lowestNumberIndex != i) {
      let temp = arr[i];
      arr[i] = arr[lowestNumberIndex];
      arr[lowestNumberIndex] = temp;
    }
  }

  return arr;
}`;

createTest(selectionSort, "purple");
