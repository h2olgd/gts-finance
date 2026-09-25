import * as pdfjsLib from "./pdfjs/pdf.mjs";
pdfjsLib.GlobalWorkerOptions.workerSrc = "./pdfjs/pdf.worker.mjs";

// PDF extraction
async function extractTextFromPDF(file) {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

  let text = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map(i => i.str).join(" ") + "\n";
  }
  return text;
}

function extractPrice(text) {
  const patterns = [
    /Total\s+MSRP\*?\s*[:\-]?\s*\$([\d,]+)/i,
    /Price\s+for\s+.*?\$([\d,]+)/i,
    /Base\s+MSRP\s*[:\-]?\s*\$([\d,]+)/i,
    /\$([\d,]{5,})/
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return parseInt(m[1].replace(/,/g, ""), 10);
  }
  return null;
}

// Loan math
function monthlyPayment(P, apr, years) {
  const r = apr / 100 / 12;
  const n = years * 12;
  return P * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

function requiredDown(price, apr, years, target, trade) {
  const r = apr / 100 / 12;
  const n = years * 12;
  const loan = target * ((Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n)));
  return price - loan - trade;
}

// UI logic
document.addEventListener("DOMContentLoaded", () => {
  const pdfFile = document.getElementById("pdfFile");
  const extractBtn = document.getElementById("extractBtn");
  const pdfStatus = document.getElementById("pdfStatus");
  const priceInput = document.getElementById("price");

  const modePayment = document.getElementById("modePayment");
  const modeDown = document.getElementById("modeDown");
  const paymentPanel = document.getElementById("paymentPanel");
  const downPanel = document.getElementById("downPanel");

  const calcPaymentBtn = document.getElementById("calcPaymentBtn");
  const paymentResult = document.getElementById("paymentResult");

  const calcDownBtn = document.getElementById("calcDownBtn");
  const downResult = document.getElementById("downResult");

  // Mode switching
  modePayment.onclick = () => {
    modePayment.classList.add("active");
    modeDown.classList.remove("active");
    paymentPanel.classList.remove("hidden");
    downPanel.classList.add("hidden");
  };

  modeDown.onclick = () => {
    modeDown.classList.add("active");
    modePayment.classList.remove("active");
    downPanel.classList.remove("hidden");
    paymentPanel.classList.add("hidden");
  };

  // Extract price
  extractBtn.onclick = async () => {
    const file = pdfFile.files[0];
    if (!file) return pdfStatus.textContent = "Select a PDF.";

    pdfStatus.textContent = "Reading PDF...";
    try {
      const text = await extractTextFromPDF(file);
      const price = extractPrice(text);

      if (price) {
        priceInput.value = price;
        pdfStatus.textContent = `Price extracted: $${price.toLocaleString()}`;
      } else {
        pdfStatus.textContent = "Price not found. Enter manually.";
      }
    } catch (e) {
      pdfStatus.textContent = "Error reading PDF.";
    }
  };

  // Monthly payment
  calcPaymentBtn.onclick = () => {
    const price = +priceInput.value;
    const apr = +document.getElementById("apr").value;
    const years = +document.getElementById("years").value;
    const down = +document.getElementById("down").value;
    const trade = +document.getElementById("trade").value;

    const loan = price - down - trade;
    const m = monthlyPayment(loan, apr, years);

    paymentResult.innerHTML = `
      Monthly Payment: $${m.toFixed(2)}<br>
      Loan Amount: $${loan.toFixed(2)}
    `;
  };

  // Down payment solver
  calcDownBtn.onclick = () => {
    const price = +priceInput.value;
    const apr = +document.getElementById("apr2").value;
    const years = +document.getElementById("years2").value;
    const trade = +document.getElementById("trade2").value;
    const target = +document.getElementById("targetPayment").value;

    const down = requiredDown(price, apr, years, target, trade);

    downResult.innerHTML = `
      Required Down Payment: $${down.toFixed(2)}
    `;
  };
});
