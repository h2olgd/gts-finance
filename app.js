// -----------------------------
// Utility Functions
// -----------------------------

function calculateMonthlyPayment(price, down, apr, years, trade) {
  const loanAmount = price - down - trade;
  const monthlyRate = apr / 100 / 12;
  const months = years * 12;

  if (monthlyRate === 0) {
    return loanAmount / months;
  }

  return (loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
}

function calculateRequiredDownPayment(targetPayment, apr, years, trade, price) {
  const monthlyRate = apr / 100 / 12;
  const months = years * 12;

  // Solve for loan amount that produces the target payment
  const loanAmount =
    targetPayment * (1 - Math.pow(1 + monthlyRate, -months)) / monthlyRate;

  // Down payment = price - trade - loanAmount
  return price - trade - loanAmount;
}

// -----------------------------
// Mode Switching
// -----------------------------

document.getElementById("switchMode").addEventListener("click", () => {
  const paymentPanel = document.getElementById("paymentPanel");
  const downPanel = document.getElementById("downPanel");

  paymentPanel.classList.toggle("hidden");
  downPanel.classList.toggle("hidden");
});

// -----------------------------
// Monthly Payment Calculator
// -----------------------------

document.getElementById("calcPaymentBtn").addEventListener("click", () => {
  const price = Number(document.getElementById("price").value);
  const down = Number(document.getElementById("down").value);
  const apr = Number(document.getElementById("apr").value);
  const years = Number(document.getElementById("years").value);
  const trade = Number(document.getElementById("trade").value);

  if (!price || !years) {
    document.getElementById("result").innerText =
      "Please enter at least price and term.";
    return;
  }

  const payment = calculateMonthlyPayment(price, down, apr, years, trade);

  document.getElementById("result").innerText =
    `Estimated Monthly Payment: $${payment.toFixed(2)}`;
});

// -----------------------------
// Down Payment Solver
// -----------------------------

document.getElementById("calcDownBtn").addEventListener("click", () => {
  const targetPayment = Number(document.getElementById("targetPayment").value);
  const apr = Number(document.getElementById("apr2").value);
  const years = Number(document.getElementById("years2").value);
  const trade = Number(document.getElementById("trade2").value);

  // You MUST have the vehicle price to solve for down payment
  const price = Number(document.getElementById("price").value);

  if (!price) {
    document.getElementById("downResult").innerText =
      "Enter the vehicle price in the Monthly Payment panel first.";
    return;
  }

  if (!targetPayment || !years) {
    document.getElementById("downResult").innerText =
      "Please enter target payment and term.";
    return;
  }

  const requiredDown = calculateRequiredDownPayment(
    targetPayment,
    apr,
    years,
    trade,
    price
  );

  document.getElementById("downResult").innerText =
    `Required Down Payment: $${requiredDown.toFixed(2)}`;
});
