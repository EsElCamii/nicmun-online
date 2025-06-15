// Smooth scrolling function
function scrollToSection(sectionId, yOffset = -30) {
  const element = document.getElementById(sectionId);
  if (element) {
    const yPosition =
      element.getBoundingClientRect().top + window.pageYOffset + yOffset;
    window.scrollTo({
      top: yPosition,
      behavior: "smooth",
    });
  }
}
// Initialize navigation
function initNavigation() {
  // Add smooth scrolling to all navigation links
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("href").substring(1);
      scrollToSection(targetId);
    });
  });
  // Add smooth scrolling to all hero buttons
  document.querySelectorAll(".hero-button").forEach((button) => {
    button.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("onclick").match(
        /scrollToSection\('([^']+)\)/,
      )[1];
      scrollToSection(targetId);
    });
  });
}
document.addEventListener("DOMContentLoaded", function () {
  // Initialize navigation
  initNavigation();
  // Add hover effects to hero buttons
  document.querySelectorAll(".hero-button").forEach((button) => {
    button.addEventListener("mouseenter", function () {
      this.style.transform = "scale(1.05)";
    });
    button.addEventListener("mouseleave", function () {
      this.style.transform = "scale(1)";
    });
  });
  // Additional hover effects for red button
  const redButton = document.querySelector(".red-button");
  if (redButton) {
    redButton.addEventListener("mouseenter", function () {
      this.style.backgroundColor = "#dc2626";
    });
    redButton.addEventListener("mouseleave", function () {
      this.style.backgroundColor = "#ef4444";
    });
  }
  // Additional hover effects for white buttons
  document.querySelectorAll(".white-button").forEach((button) => {
    button.addEventListener("mouseenter", function () {
      this.style.backgroundColor = "#f3f4f6";
    });
    button.addEventListener("mouseleave", function () {
      this.style.backgroundColor = "#ffffff";
    });
  });
});
// Schedule tab functionality
function showDay(day) {
  // Hide all schedule days
  document.querySelectorAll(".schedule-day").forEach((dayEl) => {
    dayEl.classList.remove("active");
  });
  // Remove active class from all tabs
  document.querySelectorAll(".tab-button").forEach((tab) => {
    tab.classList.remove("active");
  });
  // Show selected day
  document.getElementById("day" + day).classList.add("active");
  // Add active class to clicked tab
  event.target.classList.add("active");
}
// FAQ toggle functionality
function toggleFaq(element) {
  const faqItem = element.parentElement;
  const answer = faqItem.querySelector(".faq-answer");
  faqItem.classList.toggle("active");
}
// Committee modal data
const committeeData = {
  CPD: {
    name: "Commission on Population and Development",
    description:
      "The Commission on Population and Development addresses global population trends, demographic transitions, and sustainable development challenges in the 21st century. Delegates will discuss aging populations, youth demographics, migration patterns, and their impacts on sustainable development.",
    countries: [
      "United States",
      "China",
      "India",
      "Germany",
      "Brazil",
      "Nigeria",
      "Japan",
      "United Kingdom",
      "France",
      "Russia",
      "Mexico",
      "Indonesia",
      "Turkey",
      "Iran",
      "Vietnam",
      "Philippines",
      "Ethiopia",
      "Egypt",
      "South Africa",
      "Kenya",
      "Bangladesh",
      "Pakistan",
      "South Korea",
      "Italy",
    ],
  },
  UNSC: {
    name: "United Nations Security Council",
    description:
      "The United Nations Security Council is responsible for maintaining international peace and security. This committee will address current global conflicts, peacekeeping operations, and threats to international stability through diplomatic solutions and collective action.",
    countries: [
      "United States",
      "United Kingdom",
      "France",
      "Russia",
      "China",
      "Japan",
      "Germany",
      "Brazil",
      "India",
      "South Africa",
      "Nigeria",
      "Kenya",
      "Egypt",
      "Jordan",
      "Norway",
    ],
  },
  WHO: {
    name: "World Health Organization",
    description:
      "The World Health Organization focuses on global health security and addressing public health emergencies in an interconnected world. Delegates will tackle issues like pandemic preparedness, health equity, antimicrobial resistance, and health system strengthening.",
    countries: [
      "United States",
      "China",
      "India",
      "Germany",
      "Brazil",
      "United Kingdom",
      "France",
      "Japan",
      "Canada",
      "Australia",
      "South Korea",
      "Mexico",
      "Indonesia",
      "Turkey",
      "Saudi Arabia",
      "South Africa",
      "Nigeria",
      "Kenya",
      "Ethiopia",
      "Egypt",
      "Bangladesh",
      "Pakistan",
      "Vietnam",
      "Philippines",
      "Thailand",
      "Malaysia",
      "Singapore",
      "New Zealand",
      "Chile",
      "Argentina",
      "Colombia",
      "Peru",
    ],
  },
  UNHRC: {
    name: "UN Human Rights Council",
    description:
      "The UN Human Rights Council is dedicated to protecting and promoting human rights worldwide, addressing violations and strengthening international human rights law. This committee will examine contemporary human rights challenges and develop mechanisms for protection and accountability.",
    countries: [
      "United States",
      "Germany",
      "United Kingdom",
      "France",
      "Japan",
      "Canada",
      "Australia",
      "Netherlands",
      "Sweden",
      "Norway",
      "Denmark",
      "Switzerland",
      "Austria",
      "Belgium",
      "Finland",
      "Ireland",
      "New Zealand",
      "South Korea",
      "Chile",
      "Uruguay",
      "Costa Rica",
      "Brazil",
      "Argentina",
      "Mexico",
      "India",
      "South Africa",
      "Ghana",
      "Botswana",
      "Senegal",
      "Tunisia",
      "Morocco",
      "Jordan",
      "Indonesia",
      "Philippines",
      "Malaysia",
      "Thailand",
      "Mongolia",
      "Fiji",
      "Samoa",
      "Tonga",
      "Vanuatu",
      "Solomon Islands",
      "Palau",
      "Micronesia",
      "Marshall Islands",
      "Kiribati",
      "Tuvalu",
    ],
  },
  UNODC: {
    name: "UN Office on Drugs and Crime",
    description:
      "The UN Office on Drugs and Crime combats transnational organized crime, drug trafficking, and corruption through international cooperation. Delegates will address cybercrime, human trafficking, money laundering, and the global drug problem.",
    countries: [
      "United States",
      "Mexico",
      "Colombia",
      "Peru",
      "Bolivia",
      "Afghanistan",
      "Pakistan",
      "Turkey",
      "Iran",
      "Russia",
      "China",
      "India",
      "Thailand",
      "Myanmar",
      "Laos",
      "Vietnam",
      "Philippines",
      "Indonesia",
      "Malaysia",
      "Singapore",
      "Australia",
      "Japan",
      "South Korea",
      "Germany",
      "Netherlands",
      "Belgium",
      "France",
      "Italy",
    ],
  },
  UNEP: {
    name: "UN Environment Programme",
    description:
      "The UN Environment Programme leads global environmental action and promotes sustainable development for future generations. This committee will tackle climate change mitigation, biodiversity conservation, pollution control, and the transition to a green economy.",
    countries: [
      "United States",
      "China",
      "India",
      "Germany",
      "Japan",
      "United Kingdom",
      "France",
      "Canada",
      "Australia",
      "Brazil",
      "Russia",
      "South Africa",
      "Mexico",
      "Indonesia",
      "Turkey",
      "South Korea",
      "Saudi Arabia",
      "Argentina",
      "Poland",
      "Thailand",
      "Egypt",
      "Nigeria",
      "Kenya",
      "Ethiopia",
      "Morocco",
      "Algeria",
      "Ghana",
      "Tanzania",
      "Uganda",
      "Rwanda",
      "Botswana",
      "Namibia",
      "Zimbabwe",
      "Zambia",
      "Malawi",
      "Madagascar",
    ],
  },
};
// Committee modal functions
function openCommitteeModal(committeeId) {
  const modal = document.getElementById("committeeModal");
  const data = committeeData[committeeId];
  if (data) {
    document.getElementById("modalTitle").textContent = data.name;
    document.getElementById("modalDescription").textContent = data.description;
    const countriesDiv = document.getElementById("modalCountries");
    countriesDiv.innerHTML =
      '<h3>Participating Countries:</h3><div class="countries-grid">' +
      data.countries
        .map((country) => `<span class="country-tag">${country}</span>`)
        .join("") +
      "</div>";
    modal.style.display = "block";
  }
}
function closeModal() {
  document.getElementById("committeeModal").style.display = "none";
}

document.addEventListener("DOMContentLoaded", function () {
  const studentForm = document.getElementById("studentForm");
  if (studentForm) {
    // Expanded mock students database for testing
    const mockStudents = {
      "cquirosm@noordwijk.edu.mx": {
        name: "Camilo Quirós",
        committee: "United Nations Security Council",
        country: "United States",
        template: "downloads/position-paper-template.docx",
      },
      "achiuntib@noordwijk.edu.mx": {
        name: "Ana Chiunti",
        committee: "World Health Organization",
        country: "Germany",
        template: "downloads/position-paper-template.docx",
      },
      "testmail@noordwijk.edu.mx": {
        name: "DEMO",
        committee: "DEMO",
        country: "DEMO",
        template: "downloads/position-paper-template.docx",
      },
    };

    studentForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const studentId = document
        .getElementById("studentId")
        .value.trim()
        .toLowerCase();
      const student = mockStudents[studentId];
      const resultDiv = document.getElementById("searchResult");
      const errorDiv = document.getElementById("searchError");

      // Hide both result and error divs first
      resultDiv.style.display = "none";
      errorDiv.style.display = "none";

      if (student) {
        // Update student information
        document.getElementById("studentName").textContent = student.name;
        document.getElementById("studentCommittee").textContent =
          student.committee;
        document.getElementById("studentCountry").textContent = student.country;

        // Update download link
        const templateLink = resultDiv.querySelector(".download-button");
        templateLink.href = student.template;
        resultDiv.style.display = "block";
      } else {
        errorDiv.style.display = "block";
      }
    });
  }
});

// Add CSS for modal countries grid
const additionalCSS = `
  .countries-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-top: 1rem;
  }
  
  .country-tag {
      background: #e3f2fd;
      color: #1976d2;
      padding: 0.3rem 0.8rem;
      border-radius: 20px;
      font-size: 0.9rem;
  }
  `;
// Add the additional CSS to the document
const style = document.createElement("style");
style.textContent = additionalCSS;
document.head.appendChild(style);
// Navbar scroll effect
window.addEventListener("scroll", function () {
  const navbar = document.querySelector(".navbar");
  if (window.scrollY > 100) {
    navbar.style.background = "rgba(255, 255, 255, 0.98)";
  } else {
    navbar.style.background = "rgba(255, 255, 255, 0.95)";
  }
});
