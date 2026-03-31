(function () {
  const toggle = document.getElementById("chatbotToggle");
  const panel = document.getElementById("chatbotPanel");
  const closeBtn = document.getElementById("chatbotClose");
  const form = document.getElementById("chatbotForm");
  const input = document.getElementById("chatbotInput");
  const messages = document.getElementById("chatbotMessages");
  const chips = document.querySelectorAll(".chatbot-chip");

  if (!toggle || !panel || !form || !input || !messages) return;

  const salon = {
    services: {
      "short cut": { name: "Short Cut", price: 35, duration: 30, pros: ["Ava Chen", "Sam Patel"] },
      "medium cut": { name: "Medium Cut", price: 45, duration: 45, pros: ["Ava Chen", "Sam Patel"] },
      "long cut": { name: "Long Cut", price: 55, duration: 60, pros: ["Sam Patel", "Ava Chen"] },
      "color refresh": { name: "Color Refresh", price: 85, duration: 90, pros: ["Marco Silva", "Ava Chen"] }
    },
    hours: "Tue–Sat 10:00 AM–7:00 PM, Sun 11:00 AM–4:00 PM.",
    location: "123 Bank St, Ottawa, ON",
    phone: "(613) 555-0199",
    email: "hello@lumieresalon.ca"
  };

  const botState = {
    mode: "idle",
    booking: {
      service: "",
      date: "",
      time: "",
      name: "",
      contact: ""
    },
    fallbackCount: 0
  };

  function openChat() {
    panel.hidden = false;
    toggle.setAttribute("aria-expanded", "true");
    input.focus();
  }

  function closeChat() {
    panel.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
  }

  function addMessage(text, sender) {
    const row = document.createElement("div");
    row.className = `chatbot-msg chatbot-msg--${sender}`;

    const bubble = document.createElement("div");
    bubble.className = "chatbot-bubble";
    bubble.innerHTML = text.replace(/\n/g, "<br>");

    row.appendChild(bubble);
    messages.appendChild(row);
    messages.scrollTop = messages.scrollHeight;
  }

  function startGreeting() {
    addMessage(
      "Hi, I’m the Lumière Assistant. I can help you with services, hours/location, or booking an appointment. Try: ‘I want a haircut tomorrow at 3.’",
      "bot"
    );
  }

  function normalize(text) {
    return text.toLowerCase().trim();
  }

  function titleCase(str) {
    return str
      .split(/\s+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
  }

  function parseService(text) {
    const t = normalize(text);
    if (/(short|pixie|fade|clipper)/.test(t)) return salon.services["short cut"].name;
    if (/(medium|bob|lob)/.test(t)) return salon.services["medium cut"].name;
    if (/(long|layers|blowout|style)/.test(t)) return salon.services["long cut"].name;
    if (/(color|colour|balayage|gloss|tone|root)/.test(t)) return salon.services["color refresh"].name;
    return "";
  }

  function parseDate(text) {
    const t = normalize(text);
    const now = new Date();
    if (t.includes("today")) return formatDate(now);
    if (t.includes("tomorrow")) {
      const d = new Date(now);
      d.setDate(d.getDate() + 1);
      return formatDate(d);
    }

    const weekdays = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    for (let i = 0; i < weekdays.length; i += 1) {
      if (t.includes(weekdays[i])) {
        const d = new Date(now);
        const diff = (i - d.getDay() + 7) % 7 || 7;
        d.setDate(d.getDate() + diff);
        return formatDate(d);
      }
    }

    const m = t.match(/\b(\d{4}-\d{2}-\d{2})\b/);
    return m ? m[1] : "";
  }

  function parseTime(text) {
    const t = normalize(text);
    let m = t.match(/\b(1[0-2]|0?[1-9])(?::([0-5]\d))?\s*(am|pm)\b/);
    if (m) {
      return `${Number(m[1])}:${(m[2] || "00").padStart(2, "0")} ${m[3].toUpperCase()}`;
    }

    m = t.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);
    if (m) {
      let hour = Number(m[1]);
      const min = m[2];
      const suffix = hour >= 12 ? "PM" : "AM";
      hour = hour % 12 || 12;
      return `${hour}:${min} ${suffix}`;
    }

    return "";
  }

  function parseName(text) {
    const explicit = text.match(/(?:my name is|i am|i'm)\s+([a-z][a-z\-']+(?:\s+[a-z][a-z\-']+){0,2})/i);
    if (explicit) return titleCase(explicit[1]);
    return "";
  }

  function parseContact(text) {
    const email = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
    if (email) return email[0];
    const phone = text.match(/(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/);
    if (phone) return phone[0];
    return "";
  }

  function formatDate(d) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  function serviceSummary(name) {
    const key = Object.keys(salon.services).find((k) => salon.services[k].name === name);
    if (!key) return "";
    const svc = salon.services[key];
    return `${svc.name} — $${svc.price}, about ${svc.duration} minutes. Recommended stylists: ${svc.pros.join(", ")}.`;
  }

  function missingFields() {
    const b = botState.booking;
    const missing = [];
    if (!b.service) missing.push("service");
    if (!b.date) missing.push("date");
    if (!b.time) missing.push("time");
    if (!b.name) missing.push("name");
    if (!b.contact) missing.push("phone or email");
    return missing;
  }

  function askForMissing() {
    const missing = missingFields();
    if (!missing.length) {
      confirmBooking();
      return;
    }

    if (missing.length === 1) {
      addMessage(`Almost done — I just need your ${missing[0]}.`, "bot");
      return;
    }

    addMessage(`I can help with that. I still need your ${missing.slice(0, -1).join(", ")} and ${missing[missing.length - 1]}.`, "bot");
  }

  function confirmBooking() {
    const b = botState.booking;
    addMessage(
      `Please confirm this appointment:\nService: ${b.service}\nDate: ${b.date}\nTime: ${b.time}\nName: ${b.name}\nContact: ${b.contact}\nReply with “confirm” to save it or send a correction.`,
      "bot"
    );
    botState.mode = "confirming";
  }

  function syncToForm() {
    const b = botState.booking;
    const serviceRadio = Array.from(document.querySelectorAll('input[name="service"]')).find((el) => el.dataset.name === b.service);
    if (serviceRadio) {
      serviceRadio.checked = true;
      serviceRadio.dispatchEvent(new Event("change", { bubbles: true }));
    }

    const dateInput = document.getElementById("dateInput");
    const timeSelect = document.getElementById("timeSelect");
    const proSelect = document.getElementById("proSelect");
    const fullName = document.getElementById("fullName");
    const email = document.getElementById("email");
    const phone = document.getElementById("phone");

    if (b.date && dateInput) {
      dateInput.value = b.date;
      dateInput.dispatchEvent(new Event("change", { bubbles: true }));
    }

    if (b.service && proSelect) {
      const wanted = Array.from(proSelect.options).find((opt) => opt.value && opt.value !== "" );
      if (wanted) {
        proSelect.value = wanted.value;
        proSelect.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }

    if (b.time && timeSelect) {
      const match = Array.from(timeSelect.options).find((opt) => opt.value === b.time);
      if (match) {
        timeSelect.value = b.time;
        timeSelect.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }

    if (b.name && fullName) {
      fullName.value = b.name;
      fullName.dispatchEvent(new Event("input", { bubbles: true }));
    }

    if (b.contact && email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.contact)) {
      email.value = b.contact;
      email.dispatchEvent(new Event("input", { bubbles: true }));
    } else if (b.contact && phone) {
      phone.value = b.contact;
      phone.dispatchEvent(new Event("input", { bubbles: true }));
    }
  }

  function resetBooking() {
    botState.mode = "idle";
    botState.booking = { service: "", date: "", time: "", name: "", contact: "" };
  }

  function fillFromMessage(text) {
    const parsedService = parseService(text);
    const parsedDate = parseDate(text);
    const parsedTime = parseTime(text);
    const parsedName = parseName(text);
    const parsedContact = parseContact(text);

    if (parsedService) botState.booking.service = parsedService;
    if (parsedDate) botState.booking.date = parsedDate;
    if (parsedTime) botState.booking.time = parsedTime;
    if (parsedName) botState.booking.name = parsedName;
    if (parsedContact) botState.booking.contact = parsedContact;
  }

  function handleMessage(raw) {
    const text = raw.trim();
    if (!text) return;

    addMessage(text, "user");
    const t = normalize(text);

    if (/^(hi|hello|hey)\b/.test(t) && botState.mode === "idle") {
      addMessage("Hi again. You can ask about services, hours/location, or start a booking.", "bot");
      return;
    }

    if (/(hours|open|location|address|where|phone|contact)/.test(t) && !/(book|appointment|reserve)/.test(t)) {
      addMessage(`We’re at ${salon.location}. Our hours are ${salon.hours} Call us at ${salon.phone} or email ${salon.email}.`, "bot");
      return;
    }

    if (/(services|offer|price|pricing|haircut|cut|color)/.test(t) && !/(book|appointment|reserve)/.test(t)) {
      const service = parseService(t);
      if (service) {
        addMessage(serviceSummary(service), "bot");
      } else {
        addMessage(
          "We currently offer Short Cut ($35), Medium Cut ($45), Long Cut ($55), and Color Refresh ($85). Tell me which one you want more details about, or say something like ‘Book a long cut tomorrow at 3 PM.’",
          "bot"
        );
      }
      return;
    }

    if (botState.mode === "confirming") {
      if (/\b(confirm|yes|looks good|correct)\b/.test(t)) {
        syncToForm();
        addMessage("Your appointment has been confirmed in the chat. I also copied the details into the booking form on the page so you can finish the website form if needed.", "bot");
        resetBooking();
        return;
      }

      fillFromMessage(text);
      addMessage("Got it — I updated the details.", "bot");
      confirmBooking();
      return;
    }

    if (/(book|booking|appointment|reserve)/.test(t) || parseService(t) || parseDate(t) || parseTime(t)) {
      botState.mode = "booking";
      fillFromMessage(text);
      askForMissing();
      return;
    }

    if (botState.mode === "booking") {
      fillFromMessage(text);
      askForMissing();
      return;
    }

    botState.fallbackCount += 1;
    addMessage(
      botState.fallbackCount % 2 === 1
        ? "I’m not fully sure what you mean. You can ask about services, hours/location, or book an appointment. Example: ‘I want a medium cut on Friday at 2 PM.’"
        : "Sorry, I still didn’t catch that. Try one of these: ‘What services do you offer?’, ‘What are your hours?’, or ‘Book a short cut tomorrow at 11 AM.’",
      "bot"
    );
  }

  toggle.addEventListener("click", () => {
    if (panel.hidden) openChat();
    else closeChat();
  });

  closeBtn.addEventListener("click", closeChat);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value;
    input.value = "";
    handleMessage(text);
  });

  chips.forEach((chip) => {
    chip.addEventListener("click", () => handleMessage(chip.dataset.message || chip.textContent || ""));
  });

  startGreeting();
})();
