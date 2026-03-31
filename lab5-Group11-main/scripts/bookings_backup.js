// scripts/booking.js

// Enable Bootstrap tooltips (needs jQuery + Bootstrap JS loaded first)
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
  notes: ""
};

const summaryText = document.getElementById("summaryText");
const btnToDate = document.getElementById("btnToDate");
const btnToInfo = document.getElementById("btnToInfo");
const btnSubmit = document.getElementById("btnSubmit");

const dateInput = document.getElementById("dateInput");
const timeSelect = document.getElementById("timeSelect");
const durationHint = document.getElementById("durationHint");
const proSelect = document.getElementById("proSelect");
const step2Btn = document.querySelector('#headingDate button');
const step3Btn = document.querySelector('#headingInfo button');

const bookingForm = document.getElementById("bookingForm");
const confirmation = document.getElementById("confirmation");
const confirmDetails = document.getElementById("confirmDetails");

const progressBar = document.getElementById("bookingProgressBar");
const progressLabel = document.getElementById("progressLabel");
const progressPercent = document.getElementById("progressPercent");

step2Btn.addEventListener("click", (e) => {
  if(!state.serviceName) {
    e.stopPropagation();
  }
})

//modifed
step3Btn.addEventListener("click", function(e) {
  if(!(state.professional && state.date && state.time)) {
    e.stopPropagation();
  }
});

function setProgress(pct, stepText) {
  const p = Math.max(0, Math.min(100, pct));
  progressBar.style.width = p + "%";
  progressBar.setAttribute("aria-valuenow", String(p));
  progressBar.textContent = p+ "%";
  progressPercent.textContent = p +"%";
  progressLabel.textContent = stepText;
}

function money(n) {
  return "$" + Number(n).toFixed(2);
}

function updateSummary() {
  const parts = [];

  if (state.serviceName) {
    parts.push(`<strong>Service:</strong> ${state.serviceName} (${money(state.servicePrice)})`);
  } else {
    parts.push(`<strong>Service:</strong> not selected`);
  }

  if (state.date && state.time) {
    parts.push(`<strong>When:</strong> ${state.date} at ${state.time}`);
  } else {
    parts.push(`<strong>When:</strong> not selected`);
  }
  if (state.professional) {
    parts.push(`<strong>Professional:</strong> ${state.professional}`);
  } else {
    parts.push(`<strong>Professional:</strong> not selected`);
  }

  if(summaryText){
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
    "10:00 AM","10:30 AM","11:00 AM","11:30 AM","12:00 PM","12:30 PM",
    "1:00 PM","1:30 PM","2:00 PM","2:30 PM","3:00 PM","3:30 PM",
    "4:00 PM","4:30 PM","5:00 PM","5:30 PM","6:00 PM"
  ];

  timeSelect.innerHTML =
    `<option value="">Choose a time</option>` +
    slots.map(t => `<option value="${t}">${t}</option>`).join("");

  timeSelect.disabled = false;
}

//Addeds
function buildProfessionalsForService(serviceName) {
  let pros = [
    { value: "Ava Chen", label: "Ava Chen — Senior Stylist (Short/Medium cuts)" },
    { value: "Marco Silva", label: "Marco Silva — Color Specialist (Balayage/Gloss)" },
    { value: "Sam Patel", label: "Sam Patel — Stylist (Long hair & styling)" }
  ];
  // Reorder professionals based on service type 
  if (serviceName === "Color Refresh") {
    pros = [
      pros[1], pros[0], pros[2]
    ];
  } else if (serviceName === "Long Cut") {
    pros = [
      pros[2], pros[0], pros[1]
    ];
  } else {
    //default
    pros = [
      pros[0], pros[2], pros[1]
    ];
  }

  proSelect.innerHTML =
    `<option value="">Choose a professional</option>` +
    pros.map(p => `<option value="${p.value}">${p.label}</option>`).join("");

  proSelect.disabled = false;
}

function resetStep2Inputs() {
  state.professional = "";
  proSelect.value = "";
  proSelect.innerHTML = `<option value="">Select a service first</option>`;
  proSelect.disabled = true;

  state.date = "";
  state.time = "";
  dateInput.value = "";
  dateInput.disabled = true;

  timeSelect.innerHTML = `<option value="">Select a date first</option>`;
  timeSelect.disabled = true;
}
//modified
function validateStep2() {
  const ready = Boolean(state.professional && state.date && state.time);
  btnToInfo.style.display = ready ? "inline-flex" : "none";

  // progress bar
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

  btnSubmit.disabled = !(
    nameOk &&
    emailOk &&
    phoneOk &&
    state.serviceName &&
    state.professional &&
    state.date &&
    state.time
);

  const step3Ready = !btnSubmit.disabled;
  if (step3Ready) {
    setProgress(100, "Step 3 of 3");
  }
  updateSummary();
}

// Step 1: service selection
document.querySelectorAll('input[name="service"]').forEach(radio => {
  radio.addEventListener("change", (e) => {
    const el = e.target;
    state.serviceName = el.dataset.name;
    state.servicePrice = Number(el.dataset.price);
    state.serviceDuration = Number(el.dataset.duration);

    //modified
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

// Step 2: set min date to today
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

// Step 3: contact info
["fullName", "email", "phone", "notes"].forEach(id => {
  document.getElementById(id).addEventListener("input", (e) => {
    state[id] = e.target.value;
    validateFormReadiness();
  });
});

bookingForm.addEventListener("submit", (e) => {
  e.preventDefault();

  bookingForm.classList.add("was-validated");
  validateFormReadiness();
  if (btnSubmit.disabled) return;

  confirmDetails.innerHTML = `
    <div><strong>Service:</strong> ${state.serviceName} (${money(state.servicePrice)})</div>
    <div><strong>Professional:</strong> ${escapeHtml(state.professional)}</div>
    <div><strong>Date:</strong> ${state.date}</div>
    <div><strong>Time:</strong> ${state.time}</div>
    <div><strong>Name:</strong> ${escapeHtml(state.fullName)}</div>
    <div><strong>Email:</strong> ${escapeHtml(state.email)}</div>
    <div><strong>Phone:</strong> ${escapeHtml(state.phone)}</div>
    ${state.notes ? `<div><strong>Notes:</strong> ${escapeHtml(state.notes)}</div>` : ""}
  `;

  confirmation.style.display = "block";
  window.scrollTo({ top: confirmation.offsetTop - 20, behavior: "smooth" });
});

document.getElementById("btnStartOver").addEventListener("click", () => {
  state.serviceName = "";
  state.servicePrice = 0;
  state.serviceDuration = 0;
  state.professional = "";
  state.date = "";
  state.time = "";
  

  document.querySelectorAll('input[name="service"]').forEach(r => (r.checked = false));
  btnToDate.style.display = "none";
  btnToInfo.style.display = "none";

  dateInput.value = "";
  timeSelect.innerHTML = `<option value="">Select a date first</option>`;
  timeSelect.disabled = true;

  proSelect.innerHTML = `<option value="">Select a service first</option>`;
  proSelect.disabled = true;
  
  ["fullName", "email", "phone", "notes"].forEach(id => (document.getElementById(id).value = ""));
  bookingForm.classList.remove("was-validated");
  btnSubmit.disabled = true;

  confirmation.style.display = "none";
  updateSummary();
  openAccordion("#collapseService");
});


function escapeHtml(str) {
  return String(str)
    .replace("&", "&amp;")
    .replace("<", "&lt;")
    .replace(">", "&gt;")
    .replace('"', "&quot;")
    .replace("'", "&#039;");
}

// Initial summary
updateSummary();

// Tap to show caption for gallery on mobile
document.querySelectorAll(".gallery-item").forEach(item => {
  item.addEventListener("click", function (){
    if(window.innerWidth <= 768) {                        // if screen is small, like a mobile
      document.querySelectorAll(".gallery-item").forEach(el => {
        if(el !== item) el.classList.remove("active");
      });
      item.classList.toggle("active");
    }
  });
});

//Just in case the testimonials carousel is present on the page, initialize it with a longer interval and pause on hover
$(document).ready(function (){
  if ($("#testimonialsCarousel").length){
    $("#testimonialsCarousel").carousel({
      interval: 6500,
      pause:"hover"
    });
  }
});

//Join Validation
window.addEventListener("DOMContentLoaded", () => {
  const joinForm= document.getElementById("joinForm");
  const joinEmail= document.getElementById("joinEmail");
  const joinMsg= document.getElementById("joinMsg");

  if(!joinForm || !joinEmail || !joinMsg) return;
  joinForm.addEventListener("submit", (e) => {
    e.preventDefault();
    joinMsg.innerHTML= "";
    
    if(!joinEmail.checkValidity()){
      joinForm.classList.add("was-validated");
      //joinMsg.innerHTML=`<div class="text-danger mt-2"> Please enter your email (e.g., you@example.com)</div>`;
      joinEmail.focus();
      return;
    }

    joinForm.classList.remove("was-validated");
    joinEmail.classList.remove("is-invalid");
    joinEmail.classList.add("is-valid");
    joinMsg.innerHTML= `
      <div class="alert alert-success mt-3 mb-0" role="alert">
        <strong>Welcome to Lumière Salon.</strong> You're on the list
      </div>
    `;
    //joinMsg.className="mt-2 text-success";
    //alert("You have successfully joined!");

    //joinMsg.scrollIntoView({behavior: "smooth", block: "center"});

  
    setTimeout(() => {
      joinEmail.value="";
      joinEmail.classList.remove("is-valid");
      joinMsg.innerHTML="";
    }, 6000);

  });
});