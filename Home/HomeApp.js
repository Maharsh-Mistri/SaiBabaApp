// --- DATA AND RATES ---
const constructionRates = {
  urban: {
    rcc_frame_structure: 14850,
    load_bearing_structure: 12500,
    semi_pucca_struct: 1260,
    industrial_rcc_shade: 1160,
    industrial_steel_shade: 1060,
  },
  rural: {
    rcc_frame_structure: 13650,
    load_bearing_structure: 13460,
    semi_pucca_struct: 1260,
    industrial_rcc_shade: 1160,
    industrial_steel_shade: 1060,
  },
};

// --- UTILITY FUNCTIONS ---
function roundupToNearest100(num) {
  if (!num || num <= 0) return 0;
  return Math.ceil(num / 100) * 100;
}

function formatCurrency(num) {
  if (isNaN(num)) return "0";
  return new Intl.NumberFormat('en-IN').format(num.toFixed(0));
}

// --- CORE CALCULATION LOGIC ---
function calculateAll() {
  const typeOfArea = document.getElementById("typeOfArea").value;
  const typeOfConstruction = document.getElementById("typeOfConstruction").value;
  const rateOfConstruction = constructionRates[typeOfArea][typeOfConstruction] || 0;
  document.getElementById("rateOfConstruction").value = rateOfConstruction;

  const jantriRate = parseFloat(document.getElementById("jantriRate").value) || 0;
  const landArea = parseFloat(document.getElementById("landArea").value) || 0;
  const valueOfLand = jantriRate * landArea;
  document.getElementById("valueOfLand").value = formatCurrency(valueOfLand);

  let totalValue = 0;
  let totalDepreciation = 0;
  let totalConstructionValue = 0; // This will be the total after depreciation
  const currentYear = new Date().getFullYear();
  const rows = document.querySelectorAll("#constructionTable tbody tr");

  rows.forEach((row) => {
    const contArea = parseFloat(row.querySelector(".contArea").value) || 0;
    const constYear = parseInt(row.querySelector(".constYear").value) || currentYear;
    
    if (contArea > 0) {
        const value = contArea * rateOfConstruction;
        const age = Math.max(0, currentYear - constYear);
        let depreciationRate = age * 0.012; // Assuming 1.2% per year
        if (depreciationRate > 0.7) { // Cap depreciation at 70%
            depreciationRate = 0.7; 
        }
        const depreciation = value * depreciationRate;
        const constructionValue = value - depreciation; // Floor-wise value after depreciation

        // Update the row with all calculated values
        row.querySelector(".value").value = formatCurrency(value);
        row.querySelector(".depreciation").value = formatCurrency(depreciation);
        row.querySelector(".constructionValue").value = formatCurrency(constructionValue);

        // Add to totals
        totalValue += value;
        totalDepreciation += depreciation;
        totalConstructionValue += constructionValue;
    } else {
        // Clear row if no construction area is entered
        row.querySelector(".value").value = "";
        row.querySelector(".depreciation").value = "";
        row.querySelector(".constructionValue").value = "";
    }
  });

  const marketValue = totalConstructionValue + valueOfLand;
  const stampDutyRaw = marketValue * 0.049;
  const roundedStampDuty = roundupToNearest100(stampDutyRaw);

  // --- Registration Fee and Totals Logic ---
  let roundedRegFee = 0;
  let ladiesTotal = 0;
  let gentsTotal = 0;

  // Only calculate fees and totals if a valid market value exists
  if (marketValue > 0) {
    const regFeeRaw = marketValue * 0.01;
    roundedRegFee = roundupToNearest100(regFeeRaw + 600);
    
    ladiesTotal = roundedStampDuty + 600 + 5000;
    gentsTotal = roundedStampDuty + roundedRegFee + 5000;
  }

  // --- Update UI ---
  // Update table footer totals
  document.getElementById("totalValue").value = formatCurrency(totalValue);
  document.getElementById("totalDepreciation").value = formatCurrency(totalDepreciation);
  document.getElementById("totalConstructionValue").value = formatCurrency(totalConstructionValue);
  
  // Update summary section
  document.getElementById("marketValue").value = formatCurrency(marketValue);
  document.getElementById("stampDuty").value = formatCurrency(roundedStampDuty);
  document.getElementById("regFee").value = formatCurrency(roundedRegFee);
  document.getElementById("ladiesTotal").value = formatCurrency(ladiesTotal);
  document.getElementById("gentsTotal").value = formatCurrency(gentsTotal);
}

// --- EVENT LISTENERS ---
function setupEventListeners() {
  const triggerElements = document.querySelectorAll(
    '#typeOfArea, #typeOfConstruction, #jantriRate, #landArea, .contArea, .constYear'
  );
  triggerElements.forEach(element => {
    element.addEventListener('input', calculateAll);
  });
}

function clearFields() {
  location.reload();
}

// --- INITIALIZE ---
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  calculateAll();
});
