// scripts/bookings.js

$(function () {
  $('[data-toggle="tooltip"]').tooltip();
});

const state = {
  serviceName: "",
  servicePrice: 0,
  serviceDuration: 0,
  professional: "",
  date: "",
  time: "",
  fullName: "",
  email: "",
  phone: "",
  notes: "",
  paymentMethod: "",
  referralSource: "",
  policyAgree: false
};

const summaryText = document.getElementById("summaryText");
const btnToDate = document.getElementById("btnToDate");
const btnToInfo = document.getElementById("btnToInfo");
const btnSubmit = document.getElementById("btnSubmit");

const dateInput = document.getElementById("dateInput");
const timeSelect = document.getElementById("timeSelect");
const durationHint = document.getElementById("durationHint");
const proSelect = document.getElementById("proSelect");
const paymentMethodSelect = document.getElementById("paymentMethod");
const referralSourceSelect = document.getElementById("referralSource");
const policyAgreeInput = document.getElementById("policyAgree");
const step2Btn = document.querySelector('#headingDate button');
const step3Btn = document.querySelector('#headingInfo button');

const bookingForm = document.getElementById("bookingForm");
const confirmation = document.getElementById("confirmation");
const confirmDetails = document.getElementById("confirmDetails");

const progressBar = document.getElementById("bookingProgressBar");
const progressLabel = document.getElementById("progressLabel");
const progressPercent = document.getElementById("progressPercent");

function setProgress(pct, stepText) {
  const p = Math.max(0, Math.min(100, pct));
  progressBar.style.width = p + "%";
  progressBar.setAttribute("aria-valuenow", String(p));
  progressBar.textContent = p + "%";
  progressPercent.textContent = p + "%";
  progressLabel.textContent = stepText;
}

function money(n) {
  return "$" + Number(n).toFixed(2);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function updateSummary() {
  const parts = [];

  if (state.serviceName) {
    parts.push(`<strong>Service:</strong> ${escapeHtml(state.serviceName)} (${money(state.servicePrice)})`);
  } else {
    parts.push(`<strong>Service:</strong> not selected`);
  }

  if (state.date && state.time) {
    parts.push(`<strong>When:</strong> ${escapeHtml(state.date)} at ${escapeHtml(state.time)}`);
  } else {
    parts.push(`<strong>When:</strong> not selected`);
  }

  if (state.professional) {
    parts.push(`<strong>Professional:</strong> ${escapeHtml(state.professional)}`);
  } else {
    parts.push(`<strong>Professional:</strong> not selected`);
  }

  if (summaryText) {
    summaryText.innerHTML = "You chose…<br>" + parts.join("<br>");
  }
}

function openAccordion(targetId) {
  $(".collapse").collapse("hide");
  $(targetId).collapse("show");

  const acc = document.querySelector("#accordion");
  if (acc) {
    window.scrollTo({ top: acc.offsetTop - 20, behavior: "smooth" });
  }
}

function buildTimeslots() {
  const slots = [
    "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
    "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM",
    "4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM", "6:00 PM"
  ];

  timeSelect.innerHTML =
    `<option value="">Choose a time</option>` +
    slots.map((t) => `<option value="${t}">${t}</option>`).join("");

  timeSelect.disabled = false;
}

function buildProfessionalsForService(serviceName) {
  let pros = [
    { value: "Ava Chen", label: "Ava Chen — Senior Stylist (Short/Medium cuts)" },
    { value: "Marco Silva", label: "Marco Silva — Color Specialist (Balayage/Gloss)" },
    { value: "Sam Patel", label: "Sam Patel — Stylist (Long hair & styling)" }
  ];

  if (serviceName === "Color Refresh") {
    pros = [pros[1], pros[0], pros[2]];
  } else if (serviceName === "Long Cut") {
    pros = [pros[2], pros[0], pros[1]];
  } else {
    pros = [pros[0], pros[2], pros[1]];
  }

  proSelect.innerHTML =
    `<option value="">Choose a professional</option>` +
    pros.map((p) => `<option value="${p.value}">${p.label}</option>`).join("");

  proSelect.disabled = false;
}

function resetStep2Inputs() {
  state.professional = "";
  state.date = "";
  state.time = "";

  proSelect.value = "";
  proSelect.innerHTML = `<option value="">Select a service first</option>`;
  proSelect.disabled = true;

  dateInput.value = "";
  dateInput.disabled = true;

  timeSelect.innerHTML = `<option value="">Select a date first</option>`;
  timeSelect.disabled = true;
}

function validateStep2() {
  const ready = Boolean(state.professional && state.date && state.time);
  btnToInfo.style.display = ready ? "inline-flex" : "none";

  if (state.serviceName && ready) {
    setProgress(66, "Step 2 of 3");
  } else if (state.serviceName) {
    setProgress(33, "Step 1 of 3");
  } else {
    setProgress(0, "Step 1 of 3");
  }

  updateSummary();
}

function validateFormReadiness() {
  const nameOk = state.fullName.trim().length >= 2;
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email.trim());
  const phoneOk = state.phone.trim().length >= 7;
  const paymentOk = state.paymentMethod.trim().length > 0;
  const referralOk = state.referralSource.trim().length > 0;
  const policyOk = state.policyAgree === true;

  const ready = Boolean(
    nameOk &&
      emailOk &&
      phoneOk &&
      paymentOk &&
      referralOk &&
      policyOk &&
      state.serviceName &&
      state.professional &&
      state.date &&
      state.time
  );

  btnSubmit.disabled = !ready;

  if (ready) {
    setProgress(100, "Step 3 of 3");
  } else if (state.serviceName && state.professional && state.date && state.time) {
    setProgress(66, "Step 3 of 3");
  }

  updateSummary();
}

step2Btn.addEventListener("click", (e) => {
  if (!state.serviceName) {
    e.preventDefault();
    e.stopPropagation();
  }
});

step3Btn.addEventListener("click", (e) => {
  if (!(state.professional && state.date && state.time)) {
    e.preventDefault();
    e.stopPropagation();
  }
});

// Step 1: service selection
Array.from(document.querySelectorAll('input[name="service"]')).forEach((radio) => {
  radio.addEventListener("change", (e) => {
    const el = e.target;
    state.serviceName = el.dataset.name;
    state.servicePrice = Number(el.dataset.price);
    state.serviceDuration = Number(el.dataset.duration);

    durationHint.textContent = `Estimated duration: ${state.serviceDuration} minutes.`;
    btnToDate.style.display = "inline-flex";
    setProgress(33, "Step 1 of 3");
    resetStep2Inputs();
    buildProfessionalsForService(state.serviceName);
    dateInput.disabled = false;
    updateSummary();
  });
});

btnToDate.addEventListener("click", () => openAccordion("#collapseDate"));

(function setMinDate() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  dateInput.min = `${yyyy}-${mm}-${dd}`;
})();

dateInput.addEventListener("change", () => {
  state.date = dateInput.value;
  state.time = "";
  buildTimeslots();
  timeSelect.value = "";
  validateStep2();
});

proSelect.addEventListener("change", () => {
  state.professional = proSelect.value;
  validateStep2();
});

timeSelect.addEventListener("change", () => {
  state.time = timeSelect.value;
  validateStep2();
});

btnToInfo.addEventListener("click", () => openAccordion("#collapseInfo"));

document.getElementById("btnBackToService").addEventListener("click", () => openAccordion("#collapseService"));
document.getElementById("btnBackToDate").addEventListener("click", () => openAccordion("#collapseDate"));

["fullName", "email", "phone", "notes"].forEach((id) => {
  document.getElementById(id).addEventListener("input", (e) => {
    state[id] = e.target.value;
    validateFormReadiness();
  });
});

paymentMethodSelect.addEventListener("change", (e) => {
  state.paymentMethod = e.target.value;
  validateFormReadiness();
});

referralSourceSelect.addEventListener("change", (e) => {
  state.referralSource = e.target.value;
  validateFormReadiness();
});

policyAgreeInput.addEventListener("change", (e) => {
  state.policyAgree = e.target.checked;
  validateFormReadiness();
});

bookingForm.addEventListener("submit", (e) => {
  e.preventDefault();

  bookingForm.classList.add("was-validated");
  validateFormReadiness();
  if (btnSubmit.disabled) return;

  confirmDetails.innerHTML = `
    <div><strong>Service:</strong> ${escapeHtml(state.serviceName)} (${money(state.servicePrice)})</div>
    <div><strong>Professional:</strong> ${escapeHtml(state.professional)}</div>
    <div><strong>Date:</strong> ${escapeHtml(state.date)}</div>
    <div><strong>Time:</strong> ${escapeHtml(state.time)}</div>
    <div><strong>Name:</strong> ${escapeHtml(state.fullName)}</div>
    <div><strong>Email:</strong> ${escapeHtml(state.email)}</div>
    <div><strong>Phone:</strong> ${escapeHtml(state.phone)}</div>
    <div><strong>Payment:</strong> ${escapeHtml(state.paymentMethod)}</div>
    <div><strong>Referral:</strong> ${escapeHtml(state.referralSource)}</div>
    ${state.notes ? `<div><strong>Notes:</strong> ${escapeHtml(state.notes)}</div>` : ""}
  `;

  confirmation.style.display = "block";
  window.scrollTo({ top: confirmation.offsetTop - 20, behavior: "smooth" });
});

document.getElementById("btnStartOver").addEventListener("click", () => {
  Object.assign(state, {
    serviceName: "",
    servicePrice: 0,
    serviceDuration: 0,
    professional: "",
    date: "",
    time: "",
    fullName: "",
    email: "",
    phone: "",
    notes: "",
    paymentMethod: "",
    referralSource: "",
    policyAgree: false
  });

  Array.from(document.querySelectorAll('input[name="service"]')).forEach((r) => {
    r.checked = false;
  });

  btnToDate.style.display = "none";
  btnToInfo.style.display = "none";

  resetStep2Inputs();

  ["fullName", "email", "phone", "notes"].forEach((id) => {
    document.getElementById(id).value = "";
  });

  paymentMethodSelect.value = "";
  referralSourceSelect.value = "";
  policyAgreeInput.checked = false;

  bookingForm.classList.remove("was-validated");
  btnSubmit.disabled = true;
  confirmation.style.display = "none";

  setProgress(0, "Step 1 of 3");
  updateSummary();
  openAccordion("#collapseService");
});

updateSummary();

Array.from(document.querySelectorAll(".gallery-item")).forEach((item) => {
  item.addEventListener("click", function () {
    if (window.innerWidth <= 768) {
      Array.from(document.querySelectorAll(".gallery-item")).forEach((el) => {
        if (el !== item) el.classList.remove("active");
      });
      item.classList.toggle("active");
    }
  });
});

$(document).ready(function () {
  if ($("#testimonialsCarousel").length) {
    $("#testimonialsCarousel").carousel({
      interval: 6500,
      pause: "hover"
    });
  }
});

window.addEventListener("DOMContentLoaded", () => {
  const joinForm = document.getElementById("joinForm");
  const joinEmail = document.getElementById("joinEmail");
  const joinMsg = document.getElementById("joinMsg");

  if (!joinForm || !joinEmail || !joinMsg) return;

  joinForm.addEventListener("submit", (e) => {
    e.preventDefault();
    joinMsg.innerHTML = "";

    if (!joinEmail.checkValidity()) {
      joinForm.classList.add("was-validated");
      joinEmail.focus();
      return;
    }

    joinForm.classList.remove("was-validated");
    joinEmail.classList.remove("is-invalid");
    joinEmail.classList.add("is-valid");
    joinMsg.innerHTML = `
      <div class="alert alert-success mt-3 mb-0" role="alert">
        <strong>Welcome to Lumière Salon.</strong> You're on the list
      </div>
    `;

    setTimeout(() => {
      joinEmail.value = "";
      joinEmail.classList.remove("is-valid");
      joinMsg.innerHTML = "";
    }, 6000);
  });
});
