const form = document.getElementById("giveawayForm");
const steps = Array.from(document.querySelectorAll(".form-step"));
const previousButton = document.getElementById("prevBtn");
const nextButton = document.getElementById("nextBtn");
const stepIndicator = document.getElementById("stepIndicator");

let currentStep = 0;

function updateStepView() {
  steps.forEach((step, index) => {
    step.classList.toggle("is-active", index === currentStep);
  });

  stepIndicator.textContent = `Section ${currentStep + 1} of ${steps.length}`;
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
});

updateStepView();
