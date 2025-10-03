// --- UTILITY FUNCTIONS ---
function formatCurrency(num) {
  if (isNaN(num) || !isFinite(num)) return "0";
  return new Intl.NumberFormat('en-IN').format(num.toFixed(0));
}

/**
 * Rounds a number UP to the nearest 100.
 * @param {number} num The number to round.
 * @returns {number} The rounded number.
 */
function roundupToNearest100(num) {
  if (!num || num <= 0) return 0;
  return Math.ceil(num / 100) * 100;
}


// --- CORE CALCULATION LOGIC ---
function calculateAll() {
  // 1. Get base inputs
  const baseLandPrice = parseFloat(document.getElementById("landPriceInput").value) || 0;
  const currentYear = new Date().getFullYear();

  // 2. Define floor-specific data
  const floors = [
    { id: 'gf', multiplier: 1.00 }, // Ground Floor: 100%
    { id: 'ff', multiplier: 0.75 }, // First Floor: 75%
    { id: 'sf', multiplier: 0.70 }  // Second Floor: 70%
  ];

  // 3. Initialize totals
  let totalStampDuty = 0;
  let totalRegFees = 0;

  // 4. Loop through each floor to calculate and update UI
  floors.forEach(floor => {
    // Get this floor's specific inputs
    const landArea = parseFloat(document.getElementById(`${floor.id}_landArea`).value) || 0;
    const constructionYear = parseInt(document.getElementById(`${floor.id}_constructionYear`).value) || currentYear;
    
    const floorLandPrice = baseLandPrice * floor.multiplier;
    const floorValue = floorLandPrice * landArea;
    const age = Math.max(0, currentYear - constructionYear);
    const floorDepreciation = age * floorValue * 0.012;
    const floorConstructionValue = Math.max(0, floorValue - floorDepreciation);
    
    // --- Stamp Duty Calculation ---
    const rawStampDuty = floorConstructionValue * 0.049;
    const floorStampDuty = roundupToNearest100(rawStampDuty);

    // --- Registration Fee Calculation (Conditional) ---
    let floorRegFees = 0; // Default to 0

    if (landArea > 0 && baseLandPrice > 0) {
      const rawRegFees = (floorConstructionValue * 0.01) + 600;
      floorRegFees = roundupToNearest100(rawRegFees);
    }

    // Update the table row for this floor
    document.getElementById(`${floor.id}_landPrice`).value = formatCurrency(floorLandPrice);
    document.getElementById(`${floor.id}_value`).value = formatCurrency(floorValue);
    document.getElementById(`${floor.id}_depreciation`).value = formatCurrency(floorDepreciation);
    document.getElementById(`${floor.id}_constructionValue`).value = formatCurrency(floorConstructionValue);
    document.getElementById(`${floor.id}_stampDuty`).value = formatCurrency(floorStampDuty);
    document.getElementById(`${floor.id}_regFees`).value = formatCurrency(floorRegFees);

    // Add this floor's final values to the totals
    totalStampDuty += floorStampDuty;
    totalRegFees += floorRegFees;
  });

  // 5. Calculate final Ladies and Gents totals
  let ladiesTotal = 0;
  let gentsTotal = 0;

  if (totalStampDuty > 0 || totalRegFees > 0) {
    ladiesTotal = totalStampDuty + 600 + 5000;
    gentsTotal = totalStampDuty + totalRegFees + 5000;
  }

  // 6. Update the final summary outputs
  document.getElementById("ladiesTotal").value = formatCurrency(ladiesTotal);
  document.getElementById("gentsTotal").value = formatCurrency(gentsTotal);
}

// --- EVENT LISTENERS AND INITIALIZATION ---
function setupEventListeners() {
  // Listen to global inputs and all per-floor area and year inputs
  const triggerElements = document.querySelectorAll(
    '#landPriceInput, .landAreaInput, .constructionYearInput'
  );
  triggerElements.forEach(element => {
    element.addEventListener('input', calculateAll);
  });
}

function clearFields() {
  location.reload();
}

document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  calculateAll();
});
