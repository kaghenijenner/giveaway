const form = document.getElementById("giveawayForm");
const steps = Array.from(document.querySelectorAll(".form-step"));
const previousButton = document.getElementById("prevBtn");
const nextButton = document.getElementById("nextBtn");
const stepIndicator = document.getElementById("stepIndicator");
const stepProgressBar = document.getElementById("stepProgressBar");

let currentStep = 0;

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

nextButton.addEventListener("click", () => {
  if (currentStep < steps.length - 1) {
    currentStep += 1;
    updateStepView();
    return;
  }

  form.requestSubmit();
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  nextButton.textContent = "Submitted";
  nextButton.disabled = true;
  previousButton.disabled = true;
  stepIndicator.textContent = "Form submitted";
  if (stepProgressBar) {
    stepProgressBar.style.width = "100%";
  }
});

updateStepView();
