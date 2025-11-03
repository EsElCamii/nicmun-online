let scheduleCollapsibleController = null;

function scrollToSection(sectionId, yOffset = -80) {
  const element = document.getElementById(sectionId);
  if (!element) return;

  const targetPosition =
    element.getBoundingClientRect().top + window.pageYOffset + yOffset;

  window.scrollTo({
    top: targetPosition,
    behavior: "smooth",
  });

  setActiveNavLink(sectionId);

  if (sectionId === "schedule" && scheduleCollapsibleController) {
    scheduleCollapsibleController.setExpanded(true);
  }
}

function setActiveNavLink(sectionId) {
  if (!sectionId) return;

  document.querySelectorAll(".nav-link").forEach((link) => {
    const linkTarget = (link.getAttribute("href") || "").replace("#", "");
    const isActive = linkTarget === sectionId;
    link.classList.toggle("active", isActive);
    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

function initNavigation() {
  const navLinksContainer = document.querySelector(".nav-links");
  const navLinks = navLinksContainer
    ? Array.from(navLinksContainer.querySelectorAll(".nav-link"))
    : [];
  const menuToggle = document.querySelector(".menu-toggle");

  const closeMobileMenu = () => {
    if (navLinksContainer) {
      navLinksContainer.classList.remove("open");
    }
    if (menuToggle) {
      menuToggle.classList.remove("open");
    }
  };

  navLinks.forEach((link) => {
    const inlineHandler = link.getAttribute("onclick");
    if (inlineHandler) {
      link.removeAttribute("onclick");
    }
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const targetId = (link.getAttribute("href") || "").replace("#", "");
      if (targetId) {
        scrollToSection(targetId);
      }
      closeMobileMenu();
    });
  });

  if (menuToggle && navLinksContainer) {
    menuToggle.addEventListener("click", () => {
      navLinksContainer.classList.toggle("open");
      menuToggle.classList.toggle("open");
    });
  }
}

function initHeroButtons() {
  document.querySelectorAll(".hero-button").forEach((button) => {
    let targetId = button.dataset.target;
    const inlineHandler = button.getAttribute("onclick");
    if (!targetId && inlineHandler) {
      const match = inlineHandler.match(/scrollToSection\('([^']+)'/);
      if (match) {
        targetId = match[1];
      }
    }
    if (inlineHandler) {
      button.removeAttribute("onclick");
    }
    if (!targetId) return;

    button.addEventListener("click", (event) => {
      event.preventDefault();
      scrollToSection(targetId);
    });
  });
}

function showDay(day, trigger) {
  document.querySelectorAll(".schedule-day").forEach((dayEl) => {
    dayEl.classList.toggle("active", dayEl.id === `day${day}`);
  });

  const buttons = document.querySelectorAll(".tab-button");
  buttons.forEach((button) => {
    button.classList.toggle("active", button === trigger);
  });

  if (!trigger) {
    const fallback = document.querySelector(`.tab-button[data-day="${day}"]`);
    if (fallback) {
      fallback.classList.add("active");
    }
  }
}

function initScheduleTabs() {
  const tabButtons = document.querySelectorAll(".tab-button");
  if (!tabButtons.length) return;

  tabButtons.forEach((button, index) => {
    let day = Number(button.dataset.day);
    const inlineHandler = button.getAttribute("onclick");
    if (!day && inlineHandler) {
      const match = inlineHandler.match(/showDay\((\d+)/);
      if (match) {
        day = Number(match[1]);
      }
    }
    if (!day) {
      day = index + 1;
    }
    button.dataset.day = day.toString();
    if (inlineHandler) {
      button.removeAttribute("onclick");
    }

    button.addEventListener("click", (event) => {
      event.preventDefault();
      showDay(day, button);
    });
  });
}

function initScheduleCollapsible() {
  const scheduleSection = document.getElementById("schedule");
  if (!scheduleSection) return;

  const toggle = scheduleSection.querySelector("[data-schedule-toggle]");
  const content = scheduleSection.querySelector("[data-schedule-content]");
  const indicator = toggle.querySelector(".section-intro--collapsible-indicator");
  if (!toggle || !content) return;

  const setExpanded = (expanded) => {
    toggle.setAttribute("aria-expanded", String(expanded));
    toggle.classList.toggle("is-open", expanded);
    content.hidden = !expanded;
    if (indicator) {
      indicator.textContent = expanded
        ? "Click or tap to collapse"
        : "Click or tap to expand";
    }
  };

  const toggleExpanded = () => {
    const expanded = toggle.getAttribute("aria-expanded") === "true";
    setExpanded(!expanded);
  };

  toggle.addEventListener("click", (event) => {
    // Avoid toggling when selecting text with modifier keys
    if (event.defaultPrevented) return;
    toggleExpanded();
  });

  toggle.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleExpanded();
    }
  });

  scheduleCollapsibleController = {
    setExpanded,
    toggle: toggleExpanded,
  };

  setExpanded(false);

  if (
    window.location.hash.replace("#", "") === "schedule" ||
    window.location.search.includes("schedule=open")
  ) {
    setExpanded(true);
  }
}

function initScrollSpy() {
  const navLinks = Array.from(document.querySelectorAll(".nav-link"));
  const navbar = document.querySelector(".navbar");
  if (!navLinks.length || !navbar) return;

  const sections = navLinks
    .map((link) => {
      const targetId = (link.getAttribute("href") || "").replace("#", "");
      return targetId ? document.getElementById(targetId) : null;
    })
    .filter((section) => section);

  if (!sections.length) return;

  const updateActiveSection = () => {
    const scrollPosition = window.pageYOffset + 120;
    let currentSectionId = sections[0].id;

    for (const section of sections) {
      if (scrollPosition >= section.offsetTop) {
        currentSectionId = section.id;
      }
    }

    setActiveNavLink(currentSectionId);
    if (currentSectionId === "schedule" && scheduleCollapsibleController) {
      scheduleCollapsibleController.setExpanded(true);
    }
    navbar.classList.toggle("is-scrolled", window.scrollY > 24);
  };

  let ticking = false;
  window.addEventListener("scroll", () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateActiveSection();
        ticking = false;
      });
      ticking = true;
    }
  });

  updateActiveSection();
}

function toggleFaq(element) {
  const faqItem = element.parentElement;
  const toggle = faqItem.querySelector(".faq-toggle");
  const isActive = faqItem.classList.toggle("active");
  if (toggle) {
    toggle.textContent = isActive ? "-" : "+";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  initHeroButtons();
  initScheduleTabs();
  initScheduleCollapsible();
  initScrollSpy();
  initCommitteeDetail();
  initStudentPortalLookup();
});
// Committee data for immersive article view
const committeeData = {
  WFP: {
    name: "World Food Programme",
    council: "UN Programme",
    delegateCount: 22,
    format: "Single Delegation",
    moderator: "Arantza Cruz",
    president: "Guadalupe Esparza",
    summary: [
      "Coordinate emergency food relief while investing in resilient supply chains for food insecure communities.",
    ],
    takeaways: [
      "Anchor proposals in logistics capacity, climate resilience, and nutrition outcomes.",
      "Balance immediate humanitarian deliveries with long term agricultural development.",
      "Work with regional partners to keep trade corridors open during crises.",
    ],
    agenda: [
      {
        title: "Safeguarding Global Food Security",
        description:
          "Design funding and logistics frameworks that stabilize vulnerable regions facing conflict or climate shocks.",
      },
    ],
    resources: [],
    countries: [
      {
        country: "Argentina",
        student: "Kerch Bragado, Daniela",
      },
      {
        country: "Bangladesh",
        student: "Expósito Ramos, Lucía Marié",
      },
      {
        country: "Brazil",
        student: "Martínez Salas, Valeria",
      },
      {
        country: "China",
        student: "Ariza Remes, Jose Manuel",
      },
      {
        country: "Egypt",
        student: "Novoa Gómez, Maximiliano",
      },
      {
        country: "Ethiopia",
        student: "Fierro Muñoz, Ana Paula",
      },
      {
        country: "France",
        student: "Diaz Vázquez, Luis Manuel",
      },
      {
        country: "Germany",
        student: "Rodríguez Mendoza, Bárbara",
      },
      {
        country: "India",
        student: "Medina Cardel, Layla Victoria",
      },
      {
        country: "Indonesia",
        student: "Cabrera Navarro, Alejandro",
      },
      {
        country: "Japan",
        student: "Villavicencio Ortiz, Fernanda",
      },
      {
        country: "Kenya",
        student: "González Meneses, Viridiana",
      },
      {
        country: "Mexico",
        student: "Merino Bañuelos, Carlos Antonio",
      },
      {
        country: "Nigeria",
        student: "Ricaño Rullán, Luca",
      },
      {
        country: "Pakistan",
        student: "Rodriguez, Sofia",
      },
      {
        country: "Saudi Arabia",
        student: "Morales Gutiérrez, Aarón",
      },
      {
        country: "South Africa",
        student: "Benítez Pérez, Alejandro",
      },
      {
        country: "South Sudan",
        student: "Pérez Castillo, José María",
      },
      {
        country: "Turkey",
        student: "Hernández García, Salvador",
      },
      {
        country: "United Kingdom",
        student: "Amores Gómez, Aranza Valentina",
      },
      {
        country: "United States of America",
        student: "Aldama Yaroslavtseva, Enrique",
      },
      {
        country: "Venezuela",
        student: "Cruz Cabrera, Daniela Nazareth",
      },
    ],
  },
  UNEP: {
    name: "United Nations Environment Programme",
    council: "United Nations Environment Programme",
    delegateCount: 21,
    format: "Single Delegation",
    moderator: "Camilo Quiros",
    president: "Amaya de Diego",
    summary: [
      "Advance climate mitigation, adaptation, and plastics treaty negotiations with equitable finance pathways.",
    ],
    takeaways: [
      "Reference nationally determined contributions and emissions gap data to justify ambition.",
      "Integrate just transition measures for communities affected by environmental policy shifts.",
      "Promote science based monitoring tools for pollution and biodiversity loss.",
    ],
    agenda: [
      {
        title: "Delivering a Just Global Plastics Treaty",
        description:
          "Craft enforcement, finance, and capacity building tools that help all states cut plastic leakage.",
      },
    ],
    resources: [],
    countries: [
      {
        country: "Australia",
        student: "Trujillo Morales, Andrea",
      },
      {
        country: "Brazil",
        student: "López Mendieta, María Isabel",
      },
      {
        country: "Canada",
        student: "Rivera Venta, Elian",
      },
      {
        country: "Chile",
        student: "Morales Tejada, Manuel Emiliano",
      },
      {
        country: "China",
        student: "Quintero Rodríguez, Cristiane Giselle",
      },
      {
        country: "Egypt",
        student: "Malpica Echeverría, Isabela",
      },
      {
        country: "Ethiopia",
        student: "Morales Rojas, Arianna María",
      },
      {
        country: "France",
        student: "Luna Peréz, Ethan",
      },
      {
        country: "Germany",
        student: "Baca Reyes, Luis Gerardo",
      },
      {
        country: "India",
        student: "Morfin Luna, Daniela",
      },
      {
        country: "Indonesia",
        student: "Hurtado Torres, Brianda",
      },
      {
        country: "Japan",
        student: "Cano Torres, Alejandro",
      },
      {
        country: "Mexico",
        student: "Ríos García, Natalia",
      },
      {
        country: "New Zealand",
        student: "Levet Peralta, David",
      },
      {
        country: "Norway",
        student: "Pérez Capitaine, Victoria",
      },
      {
        country: "Russia",
        student: "Santibañez Rodríguez, Isaac",
      },
      {
        country: "South Africa",
        student: "Sánchez Roa, Leonardo",
      },
      {
        country: "Sweden",
        student: "González Lutrillo, Lizette Alejandra",
      },
      {
        country: "Switzerland",
        student: "Sainz Ruiz De La Peña, Lorenzo",
      },
      {
        country: "United Kingdom",
        student: "Silva Carpinteyro, Franco Paolo",
      },
      {
        country: "United States of America",
        student: "Escobedo Benítez, Ximena",
      },
    ],
  },
  UNICEF: {
    name: "United Nations International Children's Emergency Fund",
    council: "UNICEF",
    delegateCount: 21,
    format: "Single Delegation",
    moderator: "Ramon Velazquez",
    president: "Miel de María",
    summary: [
      "Champion child rights, health, and education in emergency and development settings.",
    ],
    takeaways: [
      "Ensure proposals protect access to schooling, nutrition, and healthcare for displaced children.",
      "Include data driven monitoring for child protection systems.",
      "Coordinate with WHO, WFP, and local actors for integrated support.",
    ],
    agenda: [
      {
        title: "Restoring Essential Services for Children",
        description:
          "Expand vaccination, education, and protection programs in regions affected by conflict and disaster.",
      },
    ],
    resources: [],
    countries: [
      {
        country: "Afghanistan",
        student: "Meyer Pérez, Christopher Anthony",
      },
      {
        country: "Australia",
        student: "Barquin Goris, Thiago",
      },
      {
        country: "Brazil",
        student: "Guevara Valerio, José Gael",
      },
      {
        country: "Canada",
        student: "Huerta León, Marco",
      },
      {
        country: "China",
        student: "Chirra, Camila Belén",
      },
      {
        country: "Colombia",
        student: "Jiménez Tello, Mauricio",
      },
      {
        country: "Egypt",
        student: "Guzmán Martínez, Frida",
      },
      {
        country: "France",
        student: "González Montero, Edgar Mateo",
      },
      {
        country: "Germany",
        student: "Hernández Retana, Julieta",
      },
      {
        country: "Japan",
        student: "Aguilar Galindo, Santiago",
      },
      {
        country: "Mexico",
        student: "Carrasco Cruz, María Inés",
      },
      {
        country: "Netherlands",
        student: "Velázquez López, José Manuel",
      },
      {
        country: "New Zealand",
        student: "Maldonado Cobo-Losey, Ana",
      },
      {
        country: "Nigeria",
        student: "Orozco Fernández, Carlos Antonio",
      },
      {
        country: "Pakistan",
        student: "Melchor Gamboa, Ivanna",
      },
      {
        country: "Philippines",
        student: "Baizabal Ortiz, Arya",
      },
      {
        country: "Spain",
        student: "Luna Arrevillaga, Elías",
      },
      {
        country: "Sweden",
        student: "Terlaud Osorno, Luca Jules",
      },
      {
        country: "Switzerland",
        student: "Linares Mora, Iker",
      },
      {
        country: "United Kingdom",
        student: "Aguilar López, Rodrigo",
      },
      {
        country: "United States of America",
        student: "Aróstegui Huerta, Ander",
      },
    ],
  },
  UNESCO: {
    name: "United Nations Educational, Scientific and Cultural Organization",
    council: "UNESCO",
    delegateCount: 23,
    format: "Single Delegation",
    moderator: "Regina Belchez",
    president: "Sofia Tapia",
    summary: [
      "Protect cultural heritage and expand access to inclusive education and scientific collaboration.",
    ],
    takeaways: [
      "Support initiatives that safeguard heritage sites while uplifting local communities.",
      "Bridge digital divides in education and research.",
      "Advance cultural diplomacy to prevent conflict and promote dialogue.",
    ],
    agenda: [
      {
        title: "Protecting Heritage and Learning in Crisis",
        description:
          "Mobilize resources to preserve culture and keep classrooms open amid conflict and climate disruption.",
      },
    ],
    resources: [],
    countries: [
      {
        country: "Afghanistan",
        student: "Velázquez López, Juan Pablo",
      },
      {
        country: "Argentina",
        student: "Ramírez González, Regina",
      },
      {
        country: "Australia",
        student: "Torres Ochoa, Rodrigo",
      },
      {
        country: "Brazil",
        student: "Faibre Morales, Valeria",
      },
      {
        country: "Canada",
        student: "Palomba Rivera, Roberto",
      },
      {
        country: "Colombia",
        student: "Sánchez Vaillard, Elena",
      },
      {
        country: "Cuba",
        student: "Hernández Velázquez, Bruno",
      },
      {
        country: "France",
        student: "Chavez Garizurieta, Ana Paula",
      },
      {
        country: "Germany",
        student: "Romero Pérez, Nicolás",
      },
      {
        country: "Iraq",
        student: "Lagunes González, José Cruz",
      },
      {
        country: "Italy",
        student: "García Liñero, David",
      },
      {
        country: "Kenya",
        student: "Sosa Rodriguez, Santiago",
      },
      {
        country: "Mexico",
        student: "Yañez Muñoz, Aarón",
      },
      {
        country: "Haiti",
        student: "Medina Cardel, Eleanor",
      },
      {
        country: "Morocco",
        student: "López Mendieta, Ángel Gabriel",
      },
      {
        country: "Nigeria",
        student: "González Hernández, Gonzalo",
      },
      {
        country: "Paraguay",
        student: "Salama De Ochoa, Natalia Elisa",
      },
      {
        country: "Peru",
        student: "Chapa González, Juan Carlos",
      },
      {
        country: "South Korea",
        student: "Hernández Velázquez, Paula",
      },
      {
        country: "Spain",
        student: "Medina Díaz, Germán",
      },
      {
        country: "Sweden",
        student: "García García De León, Iñaki",
      },
      {
        country: "United Kingdom",
        student: "Calderon Sandoval, Valentina",
      },
      {
        country: "United States of America",
        student: "Amerena Lagunes, Ulises",
      },
    ],
  },
  UNHCR: {
    name: "United Nations High Commissioner for Refugees",
    council: "UNHCR",
    delegateCount: 23,
    format: "Single Delegation",
    moderator: "Andrea Montes de Oca",
    president: "Claudiel Jimenez",
    summary: [
      "Safeguard refugees and asylum seekers through protection regimes, durable solutions, and burden sharing.",
    ],
    takeaways: [
      "Align national asylum policies with international refugee law.",
      "Strengthen resettlement, local integration, and voluntary repatriation pathways.",
      "Guarantee humanitarian access and inclusive services for displaced people.",
    ],
    agenda: [
      {
        title: "Building Durable Solutions for Displaced Communities",
        description:
          "Coordinate protection, livelihoods, and responsibility sharing for protracted refugee situations.",
      },
    ],
    resources: [],
    countries: [
      {
        country: "Australia",
        student: "Linares Mora, Alberto",
      },
      {
        country: "Bangladesh",
        student: "López Vichi, Ramsés",
      },
      {
        country: "Brazil",
        student: "Goldsmith Lara, Maximiliano Rafael",
      },
      {
        country: "Canada",
        student: "Vázquez Cruz, Natalie",
      },
      {
        country: "Colombia",
        student: "Morales Gutiérrez, Rodrigo",
      },
      {
        country: "Egypt",
        student: "Hernández Gómez, Emmanuel",
      },
      {
        country: "Finland",
        student: "Aguirre, Luis Alonso",
      },
      {
        country: "France",
        student: "Guerrero Parra, Rodrigo",
      },
      {
        country: "Germany",
        student: "Marquínez Fuentes, Valeria",
      },
      {
        country: "Greece",
        student: "Del Rio Villa, Isabella",
      },
      {
        country: "Italy",
        student: "Ordoñez Kloss, Andrés",
      },
      {
        country: "Japan",
        student: "Castañeda Toxtega, Airana",
      },
      {
        country: "Jordan",
        student: "Sosa Castro, Carlos Fernando",
      },
      {
        country: "Lebanon",
        student: "Santos Ramírez, Emiliano",
      },
      {
        country: "Mexico",
        student: "Romero Hoyos, José Manuel",
      },
      {
        country: "Netherlands",
        student: "Díaz Zapata, Alan Guido",
      },
      {
        country: "Nigeria",
        student: "Garcia Valerio, Diego Rafael",
      },
      {
        country: "Norway",
        student: "García Nieto, Carlos Alfredo",
      },
      {
        country: "Pakistan",
        student: "Ariza Remes, Ian",
      },
      {
        country: "Sweden",
        student: "Zavala Domínguez, Arnoldo",
      },
      {
        country: "Switzerland",
        student: "Padrón Hernández, Ana Sofía",
      },
      {
        country: "United Kingdom",
        student: "Melchor Gamboa, Estefanía",
      },
      {
        country: "United States of America",
        student: "Aguilar Galindo, María José",
      },
    ],
  },
  CSTD: {
    name: "Commission on Science and Technology for Development",
    council: "Economic and Social Council",
    delegateCount: 23,
    format: "Double Delegation",
    moderator: "Mayte Lopez",
    president: "Regina Torres",
    summary: [
      "Explore how innovation, connectivity, and emerging tech can accelerate sustainable development.",
    ],
    takeaways: [
      "Address the digital divide with inclusive infrastructure plans.",
      "Evaluate ethical frameworks for frontier technologies.",
      "Promote knowledge sharing partnerships between member states.",
    ],
    agenda: [
      {
        title: "Harnessing Science for Inclusive Growth",
        description:
          "Scale digital public goods, STEM education, and research collaboration for the Global South.",
      },
    ],
    resources: [],
    countries: [
      {
        country: "Argentina",
        student: "Albores Angulo, Rachel",
      },
      {
        country: "Portugal",
        student: "Sainz Ruiz De La Peña, Diego",
      },
      {
        country: "Australia",
        student: "Meneses Ruiz, Regina",
      },
      {
        country: "Brazil",
        student: "Castelan Mato, Jennifer Celeste",
      },
      {
        country: "Canada",
        student: "Carrillo López, Emir",
      },
      {
        country: "China",
        student: "Trillo Vega, Sofía",
      },
      {
        country: "El Salvador",
        student: "García Liñero, Rodrigo",
      },
      {
        country: "France",
        student: "González Alfaro, Ximena Marlene",
      },
      {
        country: "Germany",
        student: "Ruiz Torres, Emiliano",
      },
      {
        country: "Norway",
        student: "Núñez Quiñones, Rodrigo",
      },
      {
        country: "India",
        student: "Servin Mesinas, Oscar Ernesto",
      },
      {
        country: "Japan",
        student: "Mundo Tenorio, Alan",
      },
      {
        country: "Luxembourg",
        student: "Lozano González, Aarón Eduardo",
      },
      {
        country: "Mexico",
        student: "Maza Sánchez, Santiago",
      },
      {
        country: "Nigeria",
        student: "Lagunes Delon, Leonardo",
      },
      {
        country: "Singapore",
        student: "Razo Estudillo, Ximena",
      },
      {
        country: "South Africa",
        student: "Mariz Porres, Debbie",
      },
      {
        country: "South Korea",
        student: "Fernández Fernández, Juan",
      },
      {
        country: "Sweden",
        student: "Rueda Petriz, Rebeca",
      },
      {
        country: "Switzerland",
        student: "Rodríguez Gasperín, Paola",
      },
      {
        country: "Turkey",
        student: "Robles Zárate, Paula",
      },
      {
        country: "United Kingdom",
        student: "Reyes Marín, Cesar Emmanuel",
      },
      {
        country: "United States of America",
        student: "Ratia Galego, Lucia",
      },
    ],
  },
  CSW: {
    name: "Commission on the Status of Women",
    council: "Economic and Social Council",
    delegateCount: 22,
    format: "Single Delegation",
    moderator: "Ana Chunti",
    president: "Isabella Antúnez",
    summary: [
      "Advance gender equality, women's leadership, and protection from violence across all regions.",
    ],
    takeaways: [
      "Embed gender responsive budgeting and policy design.",
      "Protect women human rights defenders and civic space.",
      "Promote inclusive education and economic opportunities for women and girls.",
    ],
    agenda: [
      {
        title: "Driving Gender-Responsive Recovery",
        description:
          "Design policies that safeguard women's rights during economic transitions and crises.",
      },
    ],
    resources: [],
    countries: [
      {
        country: "Australia",
        student: "Gomez Reynaud, Vayda Josephine",
      },
      {
        country: "Belarus",
        student: "Andrade Sánchez, Jesús Roberto",
      },
      {
        country: "Canada",
        student: "Morales Tejada, Lia Fernanda",
      },
      {
        country: "Chile",
        student: "Zarrabal Montes, Regina",
      },
      {
        country: "Egypt",
        student: "Luna Arrevillaga, Valentina",
      },
      {
        country: "France",
        student: "Rivas Calderón, Aynara",
      },
      {
        country: "Germany",
        student: "Thorpe Romero, Patrick Adam",
      },
      {
        country: "Iceland",
        student: "García Pérez, Samantha Nicole",
      },
      {
        country: "India",
        student: "Novoa Gómez, José María",
      },
      {
        country: "Iraq",
        student: "Rivas Calderón, Alberto",
      },
      {
        country: "Italy",
        student: "Cordero Jiménez, José Daniel",
      },
      {
        country: "Lithuania",
        student: "Barrios Rivadeneyra, Valentina",
      },
      {
        country: "Mongolia",
        student: "Quintero Rodríguez, Christiane Carleigh",
      },
      {
        country: "Netherlands",
        student: "Lagunes Calvo, Denisse",
      },
      {
        country: "Poland",
        student: "Barón Barrera, Regina",
      },
      {
        country: "Saudi Arabia",
        student: "Aguilar López, Alejandro",
      },
      {
        country: "Singapore",
        student: "Castro Gonzalez, Maria José",
      },
      {
        country: "Sweden",
        student: "Rullan Lajud, Juan Arturo",
      },
      {
        country: "Turkey",
        student: "Ramón Jácome, Rodrigo",
      },
      {
        country: "United Arab Emirates",
        student: "Arciniega Mateos, Nina",
      },
      {
        country: "United Kingdom",
        student: "Lagunes Galaviz, Mia",
      },
      {
        country: "United States of America",
        student: "López Vichi, Adrian",
      },
    ],
  },
  WHO: {
    name: "World Health Organization",
    council: "Specialized Agency",
    delegateCount: 22,
    format: "Single Delegation",
    moderator: "Andrea Marin",
    president: "Natalia Amaya",
    summary: [
      "Strengthen resilient health systems, preparedness, and equitable access to care.",
    ],
    takeaways: [
      "Support primary healthcare investment and workforce development.",
      "Address supply chain resilience for vaccines, diagnostics, and therapeutics.",
      "Integrate climate adaptation into health system planning.",
    ],
    agenda: [
      {
        title: "Building Climate-Resilient Health Systems",
        description:
          "Enhance surveillance, financing, and service delivery to withstand emerging health threats.",
      },
    ],
    resources: [],
    countries: [
      {
        country: "Afghanistan",
        student: "Domínguez Betancourt, Luis Carlos",
      },
      {
        country: "Australia",
        student: "Rodríguez Vila, Emma",
      },
      {
        country: "Bangladesh",
        student: "Campa Hernández, Rodrigo",
      },
      {
        country: "Bolivia",
        student: "Camacho Carmona, Mariana",
      },
      {
        country: "Canada",
        student: "Calderón Delgado, Andrea",
      },
      {
        country: "France",
        student: "Benítez Pérez, Valeria",
      },
      {
        country: "Germany",
        student: "Delfin Miranda, Mariano",
      },
      {
        country: "Haiti",
        student: "Robles Macias, Andrea",
      },
      {
        country: "India",
        student: "Marín Athié, Ariane",
      },
      {
        country: "Indonesia",
        student: "Tejeda Orozco, Jorge Manuel",
      },
      {
        country: "Iran",
        student: "Santos Ramírez, Quetzalli",
      },
      {
        country: "Japan",
        student: "Ramírez Hernández, Erika Jaomara",
      },
      {
        country: "Myanmar",
        student: "González Córdova, Regina",
      },
      {
        country: "Nepal",
        student: "Ibarra Rangel, José María",
      },
      {
        country: "Netherlands",
        student: "Carvajal Medina, Emmanuel",
      },
      {
        country: "Norway",
        student: "Castelan Mato, Maximiliano",
      },
      {
        country: "Pakistan",
        student: "Girón Moreno, Florianne",
      },
      {
        country: "South Korea",
        student: "Miravete Arellano, Arath",
      },
      {
        country: "Switzerland",
        student: "Jiménez Méndez, Regina",
      },
      {
        country: "Thailand",
        student: "Vera Ramirez, Mateo",
      },
      {
        country: "United Kingdom",
        student: "Aguirre Vázquez, Héctor",
      },
      {
        country: "United States of America",
        student: "Montes De Oca Gómez, Alan",
      },
    ],
  },
  INTERPOL: {
    name: "International Criminal Police Organization",
    council: "INTERPOL",
    delegateCount: 20,
    format: "Single Delegation",
    summary: [
      "Chair: Mathias Padron.",
      "Enhance cross border policing cooperation to counter organized crime networks.",
    ],
    takeaways: [
      "Prioritize intelligence sharing and mutual legal assistance agreements.",
      "Support capacity building for cybercrime and financial investigation units.",
      "Protect human rights while strengthening security cooperation.",
    ],
    agenda: [
      {
        title: "Coordinating Transnational Crime Enforcement",
        description:
          "Develop joint operations, data systems, and safeguards to dismantle international criminal organizations.",
      },
    ],
    resources: [],
    countries: [
      "Australia",
      "Bolivia",
      "Brazil",
      "Canada",
      "Colombia",
      "El Salvador",
      "France",
      "Germany",
      "Guatemala",
      "Honduras",
      "Italia",
      "Morocco",
      "Nigeria",
      "Panama",
      "Peru",
      "Sierra Leone",
      "Spain",
      "United Kingdom",
      "United States of America",
      "Venezuela",
    ],
  },
  UNSC: {
    name: "United Nations Security Council",
    council: "Principal Organ of the United Nations",
    delegateCount: 13,
    format: "Single Delegation",
    summary: [
      "Chair: Oscar Fernandez.",
      "Issue binding resolutions to maintain international peace and security.",
    ],
    takeaways: [
      "Balance sovereignty and collective security obligations under the UN Charter.",
      "Use targeted sanctions, peacekeeping mandates, and diplomacy responsibly.",
      "Coordinate with regional organizations to implement Council decisions.",
    ],
    agenda: [
      {
        title: "Responding to Emerging Security Flashpoints",
        description:
          "Craft rapid yet sustainable solutions to protect civilians and stabilize conflict zones.",
      },
    ],
    resources: [],
    countries: [
      "Australia",
      "Austria",
      "Belgium",
      "Denmark",
      "Findland",
      "France",
      "Germany",
      "Ireland",
      "Netherlands",
      "Portugal",
      "Sweden",
      "United Kingdom",
      "United States of America",
    ],
  },
  GA: {
    name: "General Assembly",
    council: "Principal Organ of the United Nations",
    delegateCount: 11,
    format: "Single Delegation",
    summary: [
      "Moderator: Pia Zambrano.",
      "Gather every member state to deliberate on global priorities and adopt resolutions.",
    ],
    takeaways: [
      "Build broad coalitions that reflect regional and ideological diversity.",
      "Align draft resolutions with existing UN frameworks and Sustainable Development Goals.",
      "Ensure implementation mechanisms and funding pathways are realistic.",
    ],
    agenda: [
      {
        title: "Strengthening Multilateral Cooperation",
        description:
          "Advance inclusive solutions on development, security, and human rights challenges.",
      },
    ],
    resources: [],
    countries: [
      "Australia",
      "Bangladesh",
      "Brazil",
      "Canada",
      "China",
      "France",
      "India",
      "Singapore",
      "South Korea",
      "United Kingdom",
      "United States of America",
    ],
  },
};

const committeeArticleState = {
  elements: null,
  lastFocusedElement: null,
};

function getCommitteeArticleElements() {
  if (committeeArticleState.elements) {
    return committeeArticleState.elements;
  }

  const article = document.getElementById("committeeArticle");
  if (!article) {
    return {};
  }

  const elements = {
    article,
    title: document.getElementById("committeeTitle"),
    subtitle: document.getElementById("committeeSubtitle"),
    summary: document.getElementById("committeeSummary"),
    takeawaysSection: document.getElementById("committeeTakeaways"),
    takeawaysList: article.querySelector(
      "#committeeTakeaways .committee-article__takeaways-list"
    ),
    agendaSection: document.getElementById("committeeAgenda"),
    agendaList: article.querySelector(
      "#committeeAgenda .committee-article__agenda-items"
    ),
    resourcesSection: document.getElementById("committeeResources"),
    resourcesList: article.querySelector(
      "#committeeResources .committee-article__resources-list"
    ),
    resourcesNote: article.querySelector(".committee-article__resources-note"),
    countriesSection: document.getElementById("committeeCountries"),
    countriesGrid: article.querySelector(
      "#committeeCountries .countries-grid"
    ),
    closeButton: article.querySelector("[data-committee-close]"),
  };

  committeeArticleState.elements = elements;
  return elements;
}

function buildCommitteeSubtitle(data) {
  if (!data) {
    return "";
  }

  const parts = [];
  if (data.council) {
    parts.push(data.council);
  }

  if (data.delegateCount) {
    parts.push(`${data.delegateCount} delegates`);
  }

  if (data.format) {
    parts.push(data.format);
  }

  return parts.join(" · ");
}

function buildCommitteeSummary(data) {
  const hasSummary = Array.isArray(data && data.summary);
  const summary = hasSummary ? [...data.summary] : [];

  const leaders = [];
  if (data && data.moderator) {
    leaders.push(`Moderator: ${data.moderator}`);
  }
  if (data && data.president) {
    leaders.push(`President: ${data.president}`);
  }
  if (data && data.chair && !data.president) {
    leaders.push(`Chair: ${data.chair}`);
  }

  if (leaders.length) {
    summary.unshift(leaders.join(" · "));
  }

  return summary;
}

function renderSummary(section, summary) {
  if (!section) {
    return;
  }

  section.innerHTML = "";
  if (!Array.isArray(summary) || !summary.length) {
    section.hidden = true;
    return;
  }

  section.hidden = false;
  const fragment = document.createDocumentFragment();
  summary.forEach((text) => {
    const paragraph = document.createElement("p");
    paragraph.textContent = text;
    fragment.appendChild(paragraph);
  });
  section.appendChild(fragment);
}

function renderTakeaways(section, takeaways) {
  if (!section) {
    return;
  }

  const list = section.querySelector(".committee-article__takeaways-list");
  if (!list) {
    return;
  }

  list.innerHTML = "";
  if (!Array.isArray(takeaways) || !takeaways.length) {
    section.hidden = true;
    return;
  }

  section.hidden = false;
  takeaways.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    list.appendChild(li);
  });
}

function renderAgenda(section, agenda) {
  if (!section) {
    return;
  }

  const list = section.querySelector(".committee-article__agenda-items");
  if (!list) {
    return;
  }

  list.innerHTML = "";
  if (!Array.isArray(agenda) || !agenda.length) {
    section.hidden = true;
    return;
  }

  section.hidden = false;
  agenda.forEach((item) => {
    const card = document.createElement("article");
    card.className = "committee-article__agenda-item";

    if (item.title) {
      const heading = document.createElement("h4");
      heading.textContent = item.title;
      card.appendChild(heading);
    }

    if (item.description) {
      const paragraph = document.createElement("p");
      paragraph.textContent = item.description;
      card.appendChild(paragraph);
    }

    list.appendChild(card);
  });
}

function renderResources(section, resources) {
  if (!section) {
    return;
  }

  const list = section.querySelector(".committee-article__resources-list");
  const note = section.querySelector(".committee-article__resources-note");
  if (!list) {
    return;
  }

  list.innerHTML = "";
  if (!Array.isArray(resources) || !resources.length) {
    section.hidden = true;
    if (note) {
      note.style.display = "none";
    }
    return;
  }

  section.hidden = false;
  if (note) {
    note.style.display = "";
  }

  resources.forEach((resource) => {
    const card = document.createElement("article");
    card.className = "committee-article__resource-card";

    if (resource.title) {
      const heading = document.createElement("h4");
      heading.textContent = resource.title;
      card.appendChild(heading);
    }

    if (resource.description) {
      const paragraph = document.createElement("p");
      paragraph.textContent = resource.description;
      card.appendChild(paragraph);
    }

    if (resource.link) {
      const anchor = document.createElement("a");
      anchor.href = resource.link;
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
      anchor.textContent = "View resource";
      card.appendChild(anchor);
    }

    list.appendChild(card);
  });
}

function renderCountries(section, countries) {
  if (!section) {
    return;
  }

  const grid = section.querySelector(".countries-grid");
  if (!grid) {
    return;
  }

  grid.innerHTML = "";
  if (!Array.isArray(countries) || !countries.length) {
    section.hidden = true;
    return;
  }

  section.hidden = false;
  const fragment = document.createDocumentFragment();
  countries.forEach((entry) => {
    const badge = document.createElement("span");
    badge.className = "country-tag";
    let label = "";

    if (typeof entry === "string") {
      label = entry;
    } else if (entry && typeof entry === "object") {
      label = entry.country || "";
    } else if (entry != null) {
      label = String(entry);
    }

    label = label.trim();
    if (!label) {
      return;
    }

    badge.textContent = label;
    fragment.appendChild(badge);
  });
  grid.appendChild(fragment);
}

function openCommitteeArticle(committeeId) {
  const data = committeeData[committeeId];
  const elements = getCommitteeArticleElements();
  if (!data || !elements.article) {
    return;
  }

  committeeArticleState.lastFocusedElement = document.activeElement;

  if (elements.title) {
    elements.title.textContent = data.name || "";
  }

  if (elements.subtitle) {
    const subtitle = data.subtitle || buildCommitteeSubtitle(data);
    elements.subtitle.textContent = subtitle;
  }

  renderSummary(elements.summary, buildCommitteeSummary(data));
  renderTakeaways(elements.takeawaysSection, data.takeaways);
  renderAgenda(elements.agendaSection, data.agenda);
  renderResources(elements.resourcesSection, data.resources);
  renderCountries(elements.countriesSection, data.countries);

  elements.article.dataset.activeCommittee = committeeId;
  elements.article.classList.add("is-open");
  elements.article.setAttribute("aria-hidden", "false");
  document.body.classList.add("no-scroll");

  if (elements.closeButton) {
    elements.closeButton.focus();
  }
}

function closeCommitteeArticle() {
  const elements = getCommitteeArticleElements();
  if (!elements.article || !elements.article.classList.contains("is-open")) {
    return;
  }

  elements.article.classList.remove("is-open");
  elements.article.setAttribute("aria-hidden", "true");
  delete elements.article.dataset.activeCommittee;
  document.body.classList.remove("no-scroll");

  if (
    committeeArticleState.lastFocusedElement &&
    typeof committeeArticleState.lastFocusedElement.focus === "function"
  ) {
    committeeArticleState.lastFocusedElement.focus();
  }

  committeeArticleState.lastFocusedElement = null;
}

function initCommitteeDetail() {
  const elements = getCommitteeArticleElements();
  if (!elements.article) {
    return;
  }

  const cards = document.querySelectorAll(".committee-card");
  cards.forEach((card) => {
    const committeeId = card.dataset.committee;
    if (!committeeId) {
      return;
    }

    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");
    const label = card.querySelector("h3")?.textContent?.trim();
    if (label) {
      card.setAttribute("aria-label", `Open details for ${label}`);
    }

    card.addEventListener("click", () => openCommitteeArticle(committeeId));
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openCommitteeArticle(committeeId);
      }
    });
  });

  if (elements.closeButton) {
    elements.closeButton.addEventListener("click", () => closeCommitteeArticle());
  }

  elements.article.addEventListener("click", (event) => {
    if (event.target === elements.article) {
      closeCommitteeArticle();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeCommitteeArticle();
    }
  });
}

function initStudentPortalLookup() {
  const studentForm = document.getElementById("studentForm");
  if (!studentForm) {
    return;
  }

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

  studentForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const studentId = document
      .getElementById("studentId")
      .value.trim()
      .toLowerCase();
    const student = mockStudents[studentId];
    const resultDiv = document.getElementById("searchResult");
    const errorDiv = document.getElementById("searchError");

    resultDiv.style.display = "none";
    errorDiv.style.display = "none";

    if (student) {
      document.getElementById("studentName").textContent = student.name;
      document.getElementById("studentCommittee").textContent =
        student.committee;
      document.getElementById("studentCountry").textContent =
        student.country;

      const templateLink = resultDiv.querySelector(".download-button");
      templateLink.href = student.template;
      resultDiv.style.display = "block";
    } else {
      errorDiv.style.display = "block";
    }
  });
}
