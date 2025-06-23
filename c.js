let equation = "";

// Cache DOM elements to avoid repetitive queries
const display1 = document.querySelector(".display1");
const display2 = document.querySelector(".display2");

// Function to update the main display (the equation)
function updateDisplay(value) {
  display1.textContent = value;
}

// Function to update the secondary display (the live result)
function updateDisplayRes(value) {
  display2.textContent = value;
}

// Helper function to check if a character is an operator
function isOperator(char) {
  return ['+', '−', '×', '÷'].includes(char);
}

// --- Core Function for Live Calculation (with BODMAS logic) ---
function calculateLive() {
  if (!equation) {
    updateDisplayRes("");
    return;
  }

  let sanitizedEquation = equation
    .toString()
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-');

  const lastChar = sanitizedEquation.trim().slice(-1);

  // Do not try to evaluate if the equation ends with an operator (except for a negative sign that is part of a number)
  // This check is crucial for preventing unnecessary eval calls and flicker.
  if (isOperator(lastChar) && lastChar !== '-') {
    updateDisplayRes("");
    return;
  }

  // Special check for minus sign: if it's a standalone operator at the end, don't evaluate
  if (lastChar === '-') {
    const secondLastChar = sanitizedEquation.trim().slice(-2, -1);
    // If the minus sign is preceded by an operator or an opening parenthesis,
    // it's likely a negative number indicator, not an incomplete subtraction.
    // Otherwise, if it's preceded by a number or closing parenthesis, it's an incomplete subtraction.
    if (!isNaN(parseInt(secondLastChar)) || secondLastChar === ')') {
      updateDisplayRes("");
      return;
    }
  }

  try {
    let result = eval(sanitizedEquation);

    if (!isFinite(result)) {
      updateDisplayRes("Cannot divide by zero");
      return;
    }

    result = Math.round(result * 1e9) / 1e9;
    updateDisplayRes(result);

  } catch (error) {
    // If eval() fails (e.g., mismatched parentheses, incomplete expression), clear the result display.
    updateDisplayRes("");
  }
}

// --- Event Listeners ---

// Add event listeners to all number buttons.
document.querySelectorAll(".button.number-btn").forEach(button => {
  button.addEventListener("click", function (event) {
    let digit = event.target.textContent;
    equation += digit;
    updateDisplay(equation);
    calculateLive(); // Calculate live result after every number input
  });
});

// Add event listeners to all operator buttons.
document.querySelectorAll(".button.operator-btn").forEach(button => {
  button.addEventListener("click", function (event) {
    let oper = event.target.textContent;
    let lastChar = equation.slice(-1);

    if (oper === "=") {
      let result = display2.textContent; // Use cached display2
      if (result && result !== "Cannot divide by zero") {
        equation = result;
        updateDisplay(equation);
        updateDisplayRes(""); // Clear live result after final calculation
      }
    } else if (oper === '(') {
      // If the last character is a number or a closing parenthesis, insert a multiplication sign
      if (!isNaN(parseInt(lastChar)) || lastChar === ')') {
        equation += '×';
      }
      equation += '(';
      updateDisplay(equation);
      updateDisplayRes(""); // Clear result as equation is incomplete with an open parenthesis

    } else if (oper === ')') {
      const openParenCount = (equation.match(/\(/g) || []).length;
      const closeParenCount = (equation.match(/\)/g) || []).length;

      // Only add ')' if there's an open parenthesis to close and the last char isn't an operator (except for minus as part of a negative number)
      // and ensure equation is not empty
      if (openParenCount > closeParenCount && equation !== "" && !['+', '×', '÷'].includes(lastChar)) {
        equation += ')';
        updateDisplay(equation);
        calculateLive(); // Update the live result after closing parenthesis
      }
    } else {
      // --- Standard Operator Logic (+, −, ×, ÷) ---
      // Allow minus sign at the beginning or after other operators for negative numbers
      if (oper === '−' && (equation === "" || ['+', '×', '÷', '('].includes(lastChar))) {
        equation += oper;
        updateDisplay(equation);
        updateDisplayRes(""); // Clear live result as expression is incomplete
      }
      // For other operators or subtraction, prevent consecutive operators
      else if (equation !== "" && !isOperator(lastChar) && (lastChar !== '.')) {
        // If the last character is an operator, replace it with the new operator
        if (isOperator(lastChar)) {
          equation = equation.slice(0, -1) + oper;
        } else {
          equation += oper;
        }
        updateDisplay(equation);
        updateDisplayRes(""); // Clear result as equation is now incomplete
      }
    }
  });
});

// Add event listener for the 'AC' (All Clear) button.
document.querySelector(".button.clear-btn").addEventListener("click", function () {
  equation = "";
  updateDisplay("");
  updateDisplayRes("");
});

// Add event listener for the 'Delete' button.
document.querySelector(".button.delete-btn").addEventListener("click", function () {
  equation = equation.slice(0, -1);
  updateDisplay(equation);
  calculateLive(); // Recalculate live result after deletion
});