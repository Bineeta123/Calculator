const expressionDisplay = document.querySelector("#expression");
const resultDisplay = document.querySelector("#result");
const keypad = document.querySelector(".keypad");

let expression = "";
let showingResult = false;

function render() {
  expressionDisplay.textContent = expression.replaceAll("*", "×").replaceAll("/", "÷").replaceAll("-", "−") || "\u00a0";
  resultDisplay.classList.remove("is-error");

  if (!expression) {
    resultDisplay.textContent = "0";
    return;
  }

  try {
    resultDisplay.textContent = formatNumber(evaluate(expression));
  } catch {
    resultDisplay.textContent = showingResult ? "Error" : "…";
    resultDisplay.classList.toggle("is-error", showingResult);
  }
}

function formatNumber(value) {
  if (!Number.isFinite(value)) throw new Error("Invalid result");
  const rounded = Number(value.toPrecision(12));
  return String(Object.is(rounded, -0) ? 0 : rounded);
}

function evaluate(source) {
  let position = 0;

  function skipSpaces() {
    while (source[position] === " ") position += 1;
  }

  function parseExpression() {
    let value = parseTerm();
    while (true) {
      skipSpaces();
      const operator = source[position];
      if (operator !== "+" && operator !== "-") return value;
      position += 1;
      const right = parseTerm();
      value = operator === "+" ? value + right : value - right;
    }
  }

  function parseTerm() {
    let value = parseUnary();
    while (true) {
      skipSpaces();
      const operator = source[position];
      if (operator !== "*" && operator !== "/") return value;
      position += 1;
      const right = parseUnary();
      if (operator === "/" && right === 0) throw new Error("Division by zero");
      value = operator === "*" ? value * right : value / right;
    }
  }

  function parseUnary() {
    skipSpaces();
    if (source[position] === "+") {
      position += 1;
      return parseUnary();
    }
    if (source[position] === "-") {
      position += 1;
      return -parseUnary();
    }
    return parsePostfix();
  }

  function parsePostfix() {
    let value = parsePrimary();
    skipSpaces();
    while (source[position] === "%") {
      position += 1;
      value /= 100;
      skipSpaces();
    }
    return value;
  }

  function parsePrimary() {
    skipSpaces();
    if (source[position] === "(") {
      position += 1;
      const value = parseExpression();
      skipSpaces();
      if (source[position] !== ")") throw new Error("Missing closing parenthesis");
      position += 1;
      return value;
    }

    const match = source.slice(position).match(/^(?:\d+\.?\d*|\.\d+)/);
    if (!match) throw new Error("Expected a number");
    position += match[0].length;
    return Number(match[0]);
  }

  const value = parseExpression();
  skipSpaces();
  if (position !== source.length) throw new Error("Unexpected input");
  return value;
}

function endsWithValue() {
  return /[\d)%]$/.test(expression);
}

function addDigit(digit) {
  if (showingResult) expression = "";
  showingResult = false;

  if (/[)%]$/.test(expression)) expression += "*";

  const currentNumber = expression.match(/(?:^|[+\-*/(])([\d.]+)$/)?.[1];
  if (digit === ".") {
    if (currentNumber?.includes(".")) return;
    expression += currentNumber ? "." : "0.";
  } else {
    expression += digit;
  }
  render();
}

function addOperator(operator) {
  showingResult = false;
  const last = expression.at(-1);

  if (!expression) {
    if (operator === "-") expression = "-";
  } else if (/[+\-*/]$/.test(expression)) {
    if (operator === "-" && last !== "-") expression += operator;
    else if (last !== "(" && expression.length > 1) expression = expression.slice(0, -1) + operator;
  } else if (endsWithValue()) {
    expression += operator;
  }
  render();
}

function addParenthesis() {
  showingResult = false;
  const openCount = (expression.match(/\(/g) || []).length;
  const closeCount = (expression.match(/\)/g) || []).length;
  if (!expression || /[+\-*/(]$/.test(expression)) {
    expression += "(";
  } else if (openCount > closeCount && endsWithValue()) {
    expression += ")";
  } else if (endsWithValue()) {
    expression += "*(";
  }
  render();
}

function changeSign() {
  if (!expression) {
    expression = "-";
    render();
    return;
  }

  try {
    expression = `-(${formatNumber(evaluate(expression))})`;
    showingResult = false;
  } catch {
    if (/[+*/(]$/.test(expression)) expression += "-";
    else if (expression.endsWith("-")) expression = expression.slice(0, -1);
    else expression = `-(${expression})`;
  }
  render();
}

function handleAction(action) {
  if (action === "clear") {
    expression = "";
    showingResult = false;
  } else if (action === "delete") {
    expression = expression.slice(0, -1);
    showingResult = false;
  } else if (action === "decimal") {
    addDigit(".");
    return;
  } else if (action === "parentheses") {
    addParenthesis();
    return;
  } else if (action === "percent") {
    if (endsWithValue() && !expression.endsWith("%")) {
      expression += "%";
      showingResult = false;
    }
  } else if (action === "sign") {
    changeSign();
    return;
  } else if (action === "equals") {
    try {
      const value = formatNumber(evaluate(expression));
      expression = value;
      showingResult = true;
    } catch {
      showingResult = true;
    }
  }
  render();
}

keypad.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  if (button.dataset.value !== undefined) {
    if (/^\d$/.test(button.dataset.value)) addDigit(button.dataset.value);
    else addOperator(button.dataset.value);
  } else {
    handleAction(button.dataset.action);
  }
});

document.addEventListener("keydown", (event) => {
  if (/^\d$/.test(event.key) || event.key === ".") {
    addDigit(event.key);
  } else if (["+", "-", "*", "/"].includes(event.key)) {
    addOperator(event.key);
  } else if (event.key === "(") {
    showingResult = false;
    if (endsWithValue()) expression += "*";
    expression += "(";
    render();
  } else if (event.key === ")") {
    addParenthesis();
  } else if (event.key === "%") {
    handleAction("percent");
  } else if (event.key === "Enter" || event.key === "=") {
    event.preventDefault();
    handleAction("equals");
  } else if (event.key === "Backspace") {
    handleAction("delete");
  } else if (event.key === "Escape") {
    handleAction("clear");
  }
});

render();