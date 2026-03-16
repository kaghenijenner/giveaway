const form = document.getElementById("giveawayForm");
const steps = Array.from(document.querySelectorAll(".form-step"));
const previousButton = document.getElementById("prevBtn");
const nextButton = document.getElementById("nextBtn");
const stepIndicator = document.getElementById("stepIndicator");
const stepProgressBar = document.getElementById("stepProgressBar");
const braSizeGroup = document.getElementById("braSizeGroup");
const braSizeInput = document.getElementById("braSize");
const knowSizeInputs = document.querySelectorAll('input[name="knowSize"]');
const knowSizeYesInput = document.getElementById("knowSizeYes");
const sourceInputs = document.querySelectorAll('input[name="source"]');
const sourceOtherOption = document.getElementById("sourceOtherOption");
const sourceOtherGroup = document.getElementById("sourceOtherGroup");
const sourceOtherInput = document.getElementById("sourceOther");

let currentStep = 0;

function validateCurrentStep() {
  const activeStep = steps[currentStep];
  if (!activeStep) {
    return true;
  }

  const fields = Array.from(
    activeStep.querySelectorAll("input, select, textarea"),
  );

  for (const field of fields) {
    if (!field.checkValidity()) {
      field.reportValidity();
      return false;
    }
  }

  return true;
}

function getPayloadFromForm() {
  const formData = new FormData(form);

  const asString = (name) => {
    const value = formData.get(name);
    return value ? String(value).trim() : "";
  };

  return {
    firstName: asString("firstName"),
    lastName: asString("lastName"),
    instagram: asString("instagram"),
    tiktok: asString("tiktok"),
    facebook: asString("facebook"),
    knowSize: asString("knowSize"),
    braSize: asString("braSize"),
    country: asString("country"),
    whatsapp: asString("whatsapp"),
    qualification: formData.getAll("qualification"),
    source: asString("source"),
    sourceOther: asString("sourceOther"),
    consent: formData.get("consent") === "agree",
  };
}

function updateBraSizeVisibility() {
  const showBraSize = Boolean(knowSizeYesInput?.checked);

  if (braSizeGroup) {
    braSizeGroup.classList.toggle("is-hidden", !showBraSize);
    braSizeGroup.setAttribute("aria-hidden", String(!showBraSize));
  }

  if (braSizeInput) {
    braSizeInput.required = showBraSize;
    if (!showBraSize) {
      braSizeInput.value = "";
    }
  }
}

function updateSourceOtherVisibility() {
  const showSourceOther = Boolean(sourceOtherOption?.checked);

  if (sourceOtherGroup) {
    sourceOtherGroup.classList.toggle("is-hidden", !showSourceOther);
    sourceOtherGroup.setAttribute("aria-hidden", String(!showSourceOther));
  }

  if (sourceOtherInput) {
    sourceOtherInput.required = showSourceOther;
    if (!showSourceOther) {
      sourceOtherInput.value = "";
    }
  }
}

function updateStepView() {
  steps.forEach((step, index) => {
    step.classList.toggle("is-active", index === currentStep);
  });

  const stepHeading =
    steps[currentStep]?.querySelector("h2")?.textContent || "";
  stepIndicator.textContent = `Section ${currentStep + 1} of ${steps.length} - ${stepHeading}`;

  const progress = ((currentStep + 1) / steps.length) * 100;
  if (stepProgressBar) {
    stepProgressBar.style.width = `${progress}%`;
  }

  previousButton.disabled = currentStep === 0;

  if (currentStep === steps.length - 1) {
    nextButton.textContent = "Submit";
  } else {
    nextButton.textContent = "Next";
  }
}

previousButton.addEventListener("click", () => {
  if (currentStep > 0) {
    currentStep -= 1;
    updateStepView();
  }
});

knowSizeInputs.forEach((input) => {
  input.addEventListener("change", (event) => {
    if (input.checked) {
      knowSizeInputs.forEach((otherInput) => {
        if (otherInput !== input) {
          otherInput.checked = false;
        }
      });
    }

    updateBraSizeVisibility();
  });
});

sourceInputs.forEach((input) => {
  input.addEventListener("change", () => {
    updateSourceOtherVisibility();
  });
});

nextButton.addEventListener("click", () => {
  if (currentStep < steps.length - 1) {
    if (!validateCurrentStep()) {
      return;
    }

    currentStep += 1;
    updateStepView();
    return;
  }

  form.requestSubmit();
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const payload = getPayloadFromForm();
  nextButton.disabled = true;
  previousButton.disabled = true;
  nextButton.textContent = "Submitting...";
  stepIndicator.textContent = "Submitting your entry...";

  try {
    const response = await fetch("scripts/submit_entry.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.message || "Submission failed");
    }

    nextButton.textContent = "Submitted";
    stepIndicator.textContent = "Form submitted successfully";
    if (stepProgressBar) {
      stepProgressBar.style.width = "100%";
    }
  } catch (error) {
    nextButton.disabled = false;
    previousButton.disabled = false;
    nextButton.textContent = "Submit";
    stepIndicator.textContent = "Submission failed. Please try again.";
    console.error("Submission error:", error);
  }
});

updateStepView();
updateBraSizeVisibility();
updateSourceOtherVisibility();
