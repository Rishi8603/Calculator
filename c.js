let firstNum="";
let secNum="";
let operator="";
let equation="";
let isFirstNumSelected=false;

function updateDisplay(value){
  document.querySelector(".display1").textContent = value;
}
function updateDisplayRes(value){
  document.querySelector(".display2").textContent = value;
}

let NumButtons = document.querySelectorAll(".button.number-btn");
for (let i = 0; i < NumButtons.length;i++){
  NumButtons[i].addEventListener("click", function(event){
    let digit= event.target.textContent;
    console.log(digit);
    if(!isFirstNumSelected){
      firstNum=firstNum+digit;
      equation=equation+digit;
      updateDisplay(equation);
    }else{
      secNum=secNum+digit;
      equation=equation+digit;
      updateDisplay(equation);
    }
  });
}

let opButton=document.querySelectorAll(".button.operator-btn");
for(let i=0;i< opButton.length;i++){
  opButton[i].addEventListener("click", function(event){
    let oper=event.target.textContent;
    let lastChar = equation[equation.length - 1];
    console.log(oper);
    
    if(oper==="="){
      let a = parseFloat(firstNum);
      let b = parseFloat(secNum);
      let result;

      if (operator === "+") {
        result= a+b;
      } else if (operator === "−") {
        result= a-b;
      } else if (operator === "×") {
        result= a*b;
      } else if (operator === "÷") {
        result= a/b;
      }
      updateDisplayRes(result);

      //reset for next calculation
      firstNum=result.toString();
      secNum="";
      operator="";
      isFirstNumSelected = false;

    }else{
      if(!isNaN(Number(lastChar))){
        operator = oper;
        isFirstNumSelected = true;
        equation = equation + operator;
        updateDisplay(equation);
      } else if ((lastChar === "×" || lastChar === "÷") && oper === "−") {
        operator = oper;
        isFirstNumSelected = true;
        equation = equation + operator;
        updateDisplay(equation);
      }
    }
  });
}

let clrBtn=document.querySelector(".button.clear-btn");
clrBtn.addEventListener("click", function(){
  firstNum = "";
  secNum = "";
  operator = "";
  equation="";
  isFirstNumSelected = false;
  updateDisplay("");
  updateDisplayRes("");
});

let delBtn=document.querySelector(".button.delete-btn");
delBtn.addEventListener("click", function(){
  equation=equation.slice(0,-1);
  updateDisplay(equation);
})
