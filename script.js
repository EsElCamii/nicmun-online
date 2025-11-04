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
    moderator: "Elena Navarro",
    president: "Javier Beltrán",
    summary: [
      "Lead strategic food security partnerships that keep humanitarian supply lines open and resilient.",
    ],
    takeaways: [
      "Connect emergency food relief with long-term nutrition and livelihood investments.",
      "Use data on crop yields, logistics capacity, and funding gaps to target interventions.",
      "Coordinate with regional blocs and NGOs to prevent food corridor disruptions.",
    ],
    agenda: [
      {
        title: "Securing Food Corridors in Conflict-Affected Regions",
        description:
          "Develop adaptive supply-chain agreements that protect humanitarian access amid insecurity and climate shocks.",
      },
    ],
    resources: [
      {
        title: "WFP Global Operational Response Plan 2024",
        description:
          "Outlines priority operations, funding requirements, and logistics for food assistance in high-risk contexts.",
        link: "https://www.wfp.org/publications/wfp-global-operational-response-plan",
      },
      {
        title: "FAO Crop Prospects and Food Situation Report",
        description:
          "Provides quarterly analysis of production trends and countries requiring external food assistance.",
        link: "https://www.fao.org/giews/reports/crop-prospects-and-food-situation/en/",
      },
      {
        title: "UN OCHA Global Humanitarian Overview",
        description:
          "Summarizes humanitarian needs, response plans, and financing gaps affecting food security worldwide.",
        link: "https://gho.unocha.org/",
      },
    ],
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
    moderator: "Luciana Torres",
    president: "Mateo Hernández",
    summary: [
      "Drive global environmental action by aligning science, policy, and finance on climate and biodiversity goals.",
    ],
    takeaways: [
      "Link national commitments to measurable emission and nature targets backed by sound data.",
      "Champion just transitions that expand clean jobs while protecting frontline communities.",
      "Strengthen multilateral monitoring systems to track restoration and conservation progress.",
    ],
    agenda: [
      {
        title: "Implementing the Kunming-Montreal Global Biodiversity Framework",
        description:
          "Design financing, reporting, and capacity-building tools that enable countries to deliver 30x30 conservation pledges.",
      },
    ],
    resources: [
      {
        title: "Kunming-Montreal Global Biodiversity Framework",
        description:
          "Official overview of global targets and action areas adopted by parties to the Convention on Biological Diversity.",
        link: "https://www.unep.org/resources/kunming-montreal-global-biodiversity-framework",
      },
      {
        title: "UNEP Emissions Gap Report 2023",
        description:
          "Analyzes the mitigation shortfall and pathways needed to align national plans with the Paris Agreement.",
        link: "https://www.unep.org/resources/emissions-gap-report-2023",
      },
      {
        title: "State of Finance for Nature 2023",
        description:
          "Explores investment trends and policy tools to scale nature-positive finance worldwide.",
        link: "https://www.unep.org/resources/report/state-finance-nature-2023",
      },
    ],
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
    moderator: "Sofía Villalobos",
    president: "Andrés Calderón",
    summary: [
      "Advance comprehensive child protection, health, and learning responses for communities emerging from crises.",
    ],
    takeaways: [
      "Design integrated service packages that link education, nutrition, water, and protection systems.",
      "Ground negotiations in the Convention on the Rights of the Child and evidence on child wellbeing.",
      "Engage youth networks and local partners to co-create resilient support structures for children.",
    ],
    agenda: [
      {
        title: "Restoring Childhood Services in Protracted Emergencies",
        description:
          "Scale safe learning spaces, immunization, and psychosocial care for children displaced by conflict and disaster.",
      },
    ],
    resources: [
      {
        title: "State of the World's Children 2023",
        description:
          "Examines the global outlook on child health, nutrition, and protection with region-specific data.",
        link: "https://www.unicef.org/reports/state-of-worlds-children-2023",
      },
      {
        title: "Humanitarian Action for Children 2024",
        description:
          "Details UNICEF's crisis response priorities, required resources, and country appeal updates.",
        link: "https://www.unicef.org/reports/humanitarian-action-children-2024",
      },
      {
        title: "UNICEF Child Protection Strategy 2021–2030",
        description:
          "Provides the agency's framework for preventing and responding to violence, abuse, and exploitation of children.",
        link: "https://www.unicef.org/media/122151/file/Child-Protection-Strategy-2021-2030.pdf",
      },
    ],
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
    moderator: "Daniela Pineda",
    president: "Héctor Zamora",
    summary: [
      "Promote inclusive education, open science, and heritage protection as foundations for peaceful societies.",
    ],
    takeaways: [
      "Champion equitable access to quality learning and cultural participation worldwide.",
      "Safeguard heritage while supporting community-led resilience and recovery.",
      "Leverage scientific cooperation to inform sustainable development policy.",
    ],
    agenda: [
      {
        title: "Protecting Education and Culture After Disasters",
        description:
          "Coordinate risk-reduction, financing, and heritage rescue strategies that keep classrooms and cultural sites alive.",
      },
    ],
    resources: [
      {
        title: "UNESCO Education in Emergencies",
        description:
          "Outlines approaches to maintain learning continuity and rebuild education systems during crises.",
        link: "https://www.unesco.org/en/education/emergencies",
      },
      {
        title: "UNESCO Heritage Emergency Fund",
        description:
          "Describes rapid-response mechanisms to safeguard cultural heritage threatened by conflict or disaster.",
        link: "https://www.unesco.org/en/heritage/heritage-emergency-fund",
      },
      {
        title: "UNESCO Recommendation on Open Science",
        description:
          "Presents principles and actions for fostering open, collaborative science in support of sustainable development.",
        link: "https://www.unesco.org/en/science-for-sustainable-future/open-science",
      },
    ],
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
    moderator: "María Fernanda León",
    president: "Rafael Cuevas",
    summary: [
      "Protect displaced populations by strengthening asylum systems, responsibility sharing, and durable solutions.",
    ],
    takeaways: [
      "Defend access to territory and fair asylum procedures grounded in international refugee law.",
      "Promote complementary pathways including resettlement, sponsorship, and labor mobility options.",
      "Invest in host community services and climate resilience to support refugees and local residents alike.",
    ],
    agenda: [
      {
        title: "Addressing Climate-Induced Displacement and Protection Gaps",
        description:
          "Craft cooperative frameworks that safeguard people uprooted by climate impacts while bolstering host-country capacity.",
      },
    ],
    resources: [
      {
        title: "UNHCR Global Trends Report 2023",
        description:
          "Provides statistics and analysis on displacement patterns, solutions, and host country responsibilities.",
        link: "https://www.unhcr.org/global-trends-report-2023",
      },
      {
        title: "Legal Considerations on Climate Change and Displacement",
        description:
          "Sets out UNHCR guidance on protecting people displaced across borders by the effects of climate change.",
        link: "https://www.unhcr.org/publications/legal-considerations-on-climate-change-and-displacement",
      },
      {
        title: "Global Compact on Refugees Digital Platform",
        description:
          "Highlights pledges, best practices, and support mechanisms to advance responsibility sharing for refugees.",
        link: "https://www.globalcompactrefugees.org/",
      },
    ],
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
    moderator: "Isabel Gómez",
    president: "Pablo Serrano",
    summary: [
      "Leverage science, technology, and innovation to unlock inclusive and sustainable development pathways.",
    ],
    takeaways: [
      "Advance universal, affordable connectivity as the foundation for digital transformation.",
      "Embed ethical and human rights safeguards into frontier technology deployment.",
      "Scale South-South and triangular cooperation on research, skills, and open data.",
    ],
    agenda: [
      {
        title: "Bridging the Global AI Capacity Gap for Development",
        description:
          "Coordinate investment, governance, and skills initiatives that let all countries harness trustworthy artificial intelligence.",
      },
    ],
    resources: [
      {
        title: "UNCTAD Technology and Innovation Report 2023",
        description:
          "Assesses the readiness of developing countries to adopt frontier technologies and policy priorities for inclusion.",
        link: "https://unctad.org/publication/technology-and-innovation-report-2023",
      },
      {
        title: "UNESCO Ethics of Artificial Intelligence",
        description:
          "Summarizes global normative guidance for responsible, human-centered AI governance.",
        link: "https://www.unesco.org/en/artificial-intelligence/recommendation-ethics",
      },
      {
        title: "World Bank Digital Development Overview",
        description:
          "Highlights programs and financing tools that expand broadband, digital public infrastructure, and skills.",
        link: "https://www.worldbank.org/en/topic/digital",
      },
    ],
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
    moderator: "Valentina Duarte",
    president: "Camila Ríos",
    summary: [
      "Advance women's rights, leadership, and economic justice in sustainable development efforts.",
    ],
    takeaways: [
      "Integrate gender-responsive budgeting and social protection into climate and economic policies.",
      "Champion women's leadership in green industries, care systems, and public decision-making.",
      "Ensure intersectional data guides programs for women and girls facing multiple forms of discrimination.",
    ],
    agenda: [
      {
        title: "Securing Women's Economic Agency in the Green Transition",
        description:
          "Craft policies that create decent work, finance, and safety nets for women driving climate solutions.",
      },
    ],
    resources: [
      {
        title: "Progress on the Sustainable Development Goals: The Gender Snapshot 2023",
        description:
          "Tracks global progress on gender equality indicators and highlights priority actions for governments.",
        link: "https://www.unwomen.org/en/digital-library/publications/2023/09/progress-on-the-sustainable-development-goals-the-gender-snapshot-2023",
      },
      {
        title: "Feminist Climate Justice",
        description:
          "Explores policy pathways to integrate gender equality across climate finance, mitigation, and adaptation.",
        link: "https://www.unwomen.org/en/digital-library/publications?search=feminist%20climate%20justice",
      },
      {
        title: "Introduction to Gender and Climate Change",
        description:
          "Provides UNFCCC guidance on mainstreaming gender considerations in climate policy and action.",
        link: "https://unfccc.int/topics/gender/the-big-picture/introduction-to-gender-and-climate-change",
      },
    ],
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
    moderator: "Gabriela Méndez",
    president: "Diego Rosas",
    summary: [
      "Coordinate global health leadership to expand universal, resilient, and people-centered care.",
    ],
    takeaways: [
      "Prioritize primary health care investments that deliver essential services close to communities.",
      "Close workforce and supply chain gaps through joint procurement and training initiatives.",
      "Integrate climate risk management and digital tools into national health strategies.",
    ],
    agenda: [
      {
        title: "Expanding Universal Health Coverage in Low-Resource Settings",
        description:
          "Mobilize financing, workforce, and community systems that ensure quality care is affordable for all.",
      },
    ],
    resources: [
      {
        title: "WHO Universal Health Coverage Portal",
        description:
          "Provides data dashboards, policy guidance, and case studies on advancing universal health coverage.",
        link: "https://www.who.int/health-topics/universal-health-coverage",
      },
      {
        title: "World Health Statistics 2023",
        description:
          "Offers comparative indicators on health service coverage, life expectancy, and system performance.",
        link: "https://www.who.int/data/gho/publications/world-health-statistics",
      },
      {
        title: "Tracking Universal Health Coverage: 2023 Global Monitoring Report",
        description:
          "Assesses service and financial protection coverage trends and outlines policy priorities for UHC.",
        link: "https://apps.who.int/iris/handle/10665/373456",
      },
    ],
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
    moderator: "Miguel Andrade",
    chair: "Laura Benítez",
    summary: [
      "Enhance cross-border policing partnerships to disrupt illicit finance and organized crime networks.",
    ],
    takeaways: [
      "Strengthen secure intelligence sharing and joint investigative task forces across regions.",
      "Promote capacity building on cybercrime, financial forensics, and asset recovery.",
      "Embed human rights safeguards and accountability in transnational security cooperation.",
    ],
    agenda: [
      {
        title: "Countering Illicit Finance Networks",
        description:
          "Design cooperative investigations, data tools, and legal frameworks to detect and disrupt global money laundering.",
      },
    ],
    resources: [
      {
        title: "INTERPOL Global Crime Trend Report",
        description:
          "Identifies emerging transnational crime threats and operational priorities for member countries.",
        link: "https://www.interpol.int/How-we-work/Global-Crime-Trends",
      },
      {
        title: "UNODC Global Report on Money-Laundering Risks",
        description:
          "Reviews typologies, regional trends, and policy responses to illicit financial flows.",
        link: "https://www.unodc.org/unodc/en/money-laundering/overview.html",
      },
      {
        title: "FATF Recommendations",
        description:
          "Sets the international standards for combating money laundering, terrorist financing, and proliferation financing.",
        link: "https://www.fatf-gafi.org/en/publications/Fatfrecommendations/FATF-Recommendations.html",
      },
    ],
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
    moderator: "Santiago Reyes",
    president: "Isabella Cortés",
    summary: [
      "Issue binding resolutions to prevent conflict, protect civilians, and sustain international peace and security.",
    ],
    takeaways: [
      "Balance state sovereignty with collective security responsibilities under the UN Charter.",
      "Coordinate sanctions, peace operations, and mediation mandates with regional partners.",
      "Ensure civilian protection, humanitarian access, and accountability anchor every Council decision.",
    ],
    agenda: [
      {
        title: "Stabilizing the Sahel Security Landscape",
        description:
          "Forge integrated strategies on governance, counterterrorism, and humanitarian support for the Sahel region.",
      },
    ],
    resources: [
      {
        title: "UN Peacekeeping Support to the G5 Sahel Joint Force",
        description:
          "Explains UN assistance mechanisms that bolster regional security cooperation in the Sahel.",
        link: "https://reports.unocha.org/en/country/sahel/",
      },
      {
        title: "UNOCHA West and Central Africa Humanitarian Overview",
        description:
          "Provides situational updates on humanitarian needs, displacement, and response priorities across the Sahel.",
        link: "https://www.unocha.org/west-and-central-africa",
      },
      {
        title: "UN Africa Renewal: Sahel Security Crisis",
        description:
          "Analyzes root causes and regional initiatives addressing instability across the Sahel belt.",
        link: "https://africarenewal.un.org/en",
      },
    ],
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
    moderator: "Adriana Valdés",
    president: "Tomás Aguilera",
    summary: [
      "Provide the universal forum where every member state advances shared priorities for people and planet.",
    ],
    takeaways: [
      "Build broad, cross-regional coalitions that reflect the diversity of the UN membership.",
      "Align draft resolutions with the 2030 Agenda, financing frameworks, and existing UN mandates.",
      "Embed concrete implementation milestones and accountability mechanisms into negotiated outcomes.",
    ],
    agenda: [
      {
        title: "Financing the Sustainable Development Goals",
        description:
          "Mobilize debt relief, innovative finance, and partnerships to close the SDG investment gap by 2030.",
      },
    ],
    resources: [
      {
        title: "Financing for Sustainable Development Report 2024",
        description:
          "UN DESA's flagship analysis of global finance trends, policy recommendations, and SDG investment needs.",
        link: "https://financing.desa.un.org/iatf/home",
      },
      {
        title: "SDG Stimulus",
        description:
          "Outlines the UN proposal to scale affordable long-term finance for sustainable development and climate action.",
        link: "https://www.un.org/sustainabledevelopment/financing-for-development/",
      },
      {
        title: "President of the 78th UN General Assembly Priorities",
        description:
          "Highlights the thematic focus areas guiding current General Assembly deliberations and initiatives.",
        link: "https://www.un.org/pga/78/priorities/",
      },
    ],
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
