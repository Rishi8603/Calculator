let equation = "";

// Function to update the main display (the equation)
function updateDisplay(value) {
  document.querySelector(".display1").textContent = value;
}

// Function to update the secondary display (the live result)
function updateDisplayRes(value) {
  document.querySelector(".display2").textContent = value;
}

// --- Core Function for Live Calculation (with BODMAS logic) ---
function calculateLive() {
  if (!equation) {
    updateDisplayRes("");
    return;
  }

  // Sanitize the equation for evaluation, converting display symbols to operators.
  let sanitizedEquation = equation
    .toString()
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-');

  // Do not try to evaluate if the equation ends with an operator (except for negative signs that are part of numbers)
  const lastChar = sanitizedEquation.trim().slice(-1);
  if (['*', '/', '+'].includes(lastChar)) {
    updateDisplayRes("");
    return;
  }

  // Special check for minus sign - only skip if it's clearly an incomplete operation
  if (lastChar === '-') {
    const beforeMinus = sanitizedEquation.trim().slice(-2, -1);
    // If minus follows a number or closing parenthesis, it's incomplete
    if (!isNaN(parseInt(beforeMinus)) || beforeMinus === ')') {
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
    // If eval() fails (e.g., mismatched parentheses), clear the result display.
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
    calculateLive();
  });
});

// Add event listeners to all operator buttons.
document.querySelectorAll(".button.operator-btn").forEach(button => {
  button.addEventListener("click", function (event) {
    let oper = event.target.textContent;
    let lastChar = equation.slice(-1);

    if (oper === "=") {
      let result = document.querySelector(".display2").textContent;
      if (result && result !== "Cannot divide by zero") {
        equation = result;
        updateDisplay(equation);
        updateDisplayRes("");
      }
    } else if (oper === '(') {
      // --- Opening Parenthesis Logic ---
      // If the last character is a number or a closing parenthesis,
      // insert a multiplication sign for implicit multiplication (e.g., 5(2) becomes 5*(2)).
      if (!isNaN(parseInt(lastChar)) || lastChar === ')') {
        equation += '×';
      }
      equation += '(';
      updateDisplay(equation);
      updateDisplayRes(""); // Clear result as equation is now incomplete.

    } else if (oper === ')') {
      // --- Closing Parenthesis Logic ---
      const openParenCount = (equation.match(/\(/g) || []).length;
      const closeParenCount = (equation.match(/\)/g) || []).length;
      const isLastCharOperator = ['+', '×', '÷', '('].includes(lastChar);

      // Only add ')' if there's an open parenthesis to close and the last char isn't an operator
      // Allow closing after minus sign (for negative numbers)
      if (openParenCount > closeParenCount && !isLastCharOperator && equation !== "") {
        equation += ')';
        updateDisplay(equation);
        calculateLive(); // Update the live result.
      }
    } else {
      // --- Standard Operator Logic (+, −, ×, ÷) ---
      if (oper === '−') {
        // Special handling for minus sign - can be used as negative sign
        if (equation === "") {
          // Allow minus at the beginning (negative number)
          equation += oper;
          updateDisplay(equation);
          updateDisplayRes("");
        } else if (['+', '×', '÷', '('].includes(lastChar)) {
          // Allow minus after these operators (for negative numbers)
          equation += oper;
          updateDisplay(equation);
          updateDisplayRes("");
        } else if (!isNaN(parseInt(lastChar)) || lastChar === '.' || lastChar === ')') {
          // This is subtraction - only allow if last char isn't already an operator
          if (!['+', '−', '×', '÷'].includes(lastChar)) {
            equation += oper;
            updateDisplay(equation);
            updateDisplayRes("");
          }
        }
        // Don't allow consecutive minus signs or minus after minus
      } else {
        // For +, ×, ÷ operators - prevent consecutive operators
        const isLastCharValid = !isNaN(parseInt(lastChar)) || lastChar === '.' || lastChar === ')';
        const isLastCharOperator = ['+', '−', '×', '÷'].includes(lastChar);

        if (equation !== "" && isLastCharValid && !isLastCharOperator) {
          equation += oper;
          updateDisplay(equation);
          updateDisplayRes(""); // Clear result as equation is now incomplete.
        }
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
  calculateLive();
});