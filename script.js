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
    scheduleCollapsibleController.setExpanded(true, { force: true });
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

  const container =
    scheduleSection.querySelector("[data-schedule-toggle-container]") ||
    scheduleSection.querySelector(".section-intro--collapsible");
  const toggle = scheduleSection.querySelector("[data-schedule-toggle]");
  const content = scheduleSection.querySelector("[data-schedule-content]");
  const indicator = scheduleSection.querySelector(".section-intro--collapsible-indicator");
  if (!container || !toggle || !content) return;

  let manualPreference = null;

  const applyExpandedState = (expanded) => {
    toggle.setAttribute("aria-expanded", String(expanded));
    container.classList.toggle("is-open", expanded);
    content.hidden = !expanded;
    if (indicator) {
      indicator.textContent = expanded
        ? "Click or tap to collapse"
        : "Click or tap to expand";
    }
  };

  const setExpanded = (expanded, { userInitiated = false, force = false } = {}) => {
    if (!force) {
      if (manualPreference === false && expanded) {
        return;
      }
      if (manualPreference === true && !expanded) {
        return;
      }
    }

    applyExpandedState(expanded);

    if (userInitiated || force) {
      manualPreference = expanded;
    }
  };

  const toggleExpanded = () => {
    const expanded = toggle.getAttribute("aria-expanded") === "true";
    setExpanded(!expanded, { userInitiated: true });
  };

  toggle.addEventListener("click", (event) => {
    // Avoid toggling when selecting text with modifier keys
    if (event.defaultPrevented) return;
    toggleExpanded();
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
    setExpanded(true, { force: true });
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
    moderator: "Arantza Cruz",
    chair: "Guadalupe Esparza",
    summary: [
      "Mobilize rapid, climate-smart food relief when disasters disrupt local supply chains and livelihoods.",
    ],
    takeaways: [
      "Pre-position emergency rations and deploy logistics hubs that withstand extreme-weather events.",
      "Coordinate joint assessments with disaster agencies to target the most food-insecure households.",
      "Blend immediate food aid with cash, nutrition, and resilience programs that speed community recovery.",
    ],
    agenda: [
      {
        title: "Providing Food Aid in Areas Affected by Natural Disasters",
        description:
          "Design multi-phase response packages that deliver immediate rations, restore logistics corridors, and support medium-term recovery after floods, hurricanes, or earthquakes.",
      },
    ],
    resources: [
      {
        title: "WFP Emergency Preparedness Handbook",
        description:
          "Operational guidance on pre-positioning, logistics, and coordination for rapid-onset emergencies.",
        link: "https://docs.wfp.org/api/documents/WFP-0000091066/download/",
      },
      {
        title: "UN OCHA Global Humanitarian Overview",
        description:
          "Summarizes humanitarian needs, funding requirements, and disaster response priorities worldwide.",
        link: "https://gho.unocha.org/",
      },
      {
        title: "Global Report on Food Crises 2024",
        description:
          "Analyzes acute food insecurity drivers, including climate shocks, and recommends targeted relief actions.",
        link: "https://www.fsinplatform.org/report/global-report-food-crises-2024",
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
    moderator: "Camilo Quiros",
    chair: "Amaya de Diego",
    summary: [
      "Accelerate an equitable shift to electric mobility while reducing the environmental footprint of lithium battery supply chains.",
    ],
    takeaways: [
      "Align EV incentives with renewable-powered grids and lifecycle emission standards.",
      "Strengthen environmental and social safeguards across battery mineral extraction, processing, and recycling.",
      "Support developing economies with technology transfer, finance, and workforce training for clean transport systems.",
    ],
    agenda: [
      {
        title:
          "Promoting the Transition to Electric Vehicles While Addressing Lithium Battery Impacts",
        description:
          "Craft policies that expand EV adoption, improve charging infrastructure, and mitigate mining and waste impacts from lithium-ion batteries.",
      },
    ],
    resources: [
      {
        title: "UNEP Global Electric Mobility Programme",
        description:
          "Highlights UN support for policy, finance, and technology pathways that scale clean transport worldwide.",
        link: "https://www.unep.org/explore-topics/transport/what-we-do/electric-mobility",
      },
      {
        title: "IRENA Lithium-ion Battery Value Chain (2023)",
        description:
          "Assesses environmental pressures from lithium-ion batteries and pathways for responsible, circular supply chains.",
        link: "https://www.irena.org/-/media/Files/IRENA/Agency/Publication/2023/Sep/IRENA_Lithium-ion-battery_value_chain_2023.pdf",
      },
      {
        title: "IEA Global EV Outlook 2024",
        description:
          "Provides data on EV deployment, charging infrastructure, and policy measures that enable rapid adoption.",
        link: "https://www.iea.org/reports/global-ev-outlook-2024",
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
    moderator: "Ramon Velazquez",
    chair: "Miel de Maria",
    summary: [
      "Guarantee continuous, safe learning opportunities for children living amid armed conflict.",
    ],
    takeaways: [
      "Establish protected learning spaces that pair education with psychosocial and child-protection services.",
      "Coordinate with local authorities and the Global Education Cluster to deploy trained teachers and adaptable curricula.",
      "Secure flexible funding for learning materials, digital tools, and emergency infrastructure restoration.",
    ],
    agenda: [
      {
        title: "Providing Education to Children in Conflict Zones",
        description:
          "Plan multi-sector responses that protect schools, support educators, and deliver inclusive education during crises.",
      },
    ],
    resources: [
      {
        title: "UNICEF Core Commitments for Children in Humanitarian Action",
        description:
          "Defines minimum standards for delivering education and protection services in emergencies.",
        link: "https://www.humanitarianresponse.info/sites/www.humanitarianresponse.info/files/documents/files/ccc_en.pdf",
      },
      {
        title: "Global Education Cluster: Guide to Education in Emergencies Coordination",
        description:
          "Provides tools for joint needs assessments, response planning, and partner coordination in conflict settings.",
        link: "https://resourcecentre.savethechildren.net/wp-content/uploads/2021/06/guide_to_eie_coordination_en.pdf",
      },
      {
        title: "Education Cannot Wait Strategic Plan 2023-2026",
        description:
          "Details financing priorities and program models for educating children affected by crises.",
        link: "https://www.educationcannotwait.org/sites/default/files/2022-09/f_ecw1016_strategic_report.pdf",
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
    moderator: "Regina Belchez",
    chair: "Sofia Tapia",
    summary: [
      "Safeguard national cultural heritage while fostering inclusive identities in societies shaped by migration.",
    ],
    takeaways: [
      "Promote policies that preserve tangible and intangible heritage alongside diverse cultural expressions.",
      "Invest in community-based programs and cultural institutions that connect newcomers with host communities.",
      "Strengthen intercultural education and media initiatives that counter discrimination and celebrate shared values.",
    ],
    agenda: [
      {
        title:
          "Protecting National Cultural Heritage and Identity Amid the Rise of Global Immigration",
        description:
          "Develop cooperative frameworks that conserve heritage sites and traditions while supporting inclusive cultural participation.",
      },
    ],
    resources: [
      {
        title: "UNESCO Convention for the Safeguarding of the Intangible Cultural Heritage",
        description:
          "Provides legal tools and best practices for protecting living heritage in diverse societies.",
        link: "https://ich.unesco.org/en/convention",
      },
      {
        title: "UNESCO Culture|2030 Indicators: Migration Module",
        description:
          "Offers indicators and policy guidance on integrating culture and migration into sustainable development planning.",
        link: "https://www.unesco.org/en/no-racism-no-discrimination/migration",
      },
      {
        title: "UN Alliance of Civilizations: Intercultural Dialogue Toolkit",
        description:
          "Highlights initiatives that build social cohesion and mutual understanding in multicultural contexts.",
        link: "https://www.unaoc.org/resource/intercultural-dialogue-toolkit/",
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
    moderator: "Andrea Montes de Oca",
    chair: "Claudiel Jimenez",
    summary: [
      "Scrutinize detention practices in the United States to ensure migrants and asylum-seekers are treated in line with international refugee law.",
    ],
    takeaways: [
      "Evaluate detention conditions against UNHCR standards on dignity, medical care, and family unity.",
      "Recommend oversight, accountability, and alternatives to detention that uphold due process and protection needs.",
      "Strengthen access to legal counsel, interpretation, and asylum procedures for individuals in ICE custody.",
    ],
    agenda: [
      {
        title:
          "Addressing the Treatment of Immigrants in U.S. ICE Detention Centers Under International Refugee Law",
        description:
          "Assess compliance gaps and propose coordinated reforms to safeguard the rights of asylum-seekers and migrants in detention.",
      },
    ],
    resources: [
      {
        title: "UNHCR Detention Guidelines (2012)",
        description:
          "Defines international standards on the detention of asylum-seekers and alternatives to detention.",
        link: "https://www.unhcr.org/publications/legal-and-protection-policy-and-guidance-unhcr-detention-guidelines",
      },
      {
        title: "US DHS Office of Inspector General: ICE Detention Facility Oversight Reports",
        description:
          "Provides findings on conditions, medical care, and compliance issues within ICE detention centers.",
        link: "https://www.oig.dhs.gov/sites/default/files/assets/2020-06/OIG-20-43-Jun20.pdf?source=govdelivery",
      },
      {
        title: "Inter-American Commission on Human Rights: Report on Immigration Detention in the United States",
        description:
          "Examines detention practices and offers recommendations consistent with human rights obligations.",
        link: "https://www.oas.org/en/iachr/reports/pdfs/ImmigrationDetentionUS.pdf",
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
    moderator: "Mayte Lopez",
    chair: "Regina Torres",
    summary: [
      "Examine how cryptocurrency adoption influences financial stability, inclusion, and development outcomes.",
    ],
    takeaways: [
      "Assess macroeconomic and regulatory risks stemming from national-level cryptocurrency adoption.",
      "Strengthen consumer protection, anti-money-laundering, and prudential oversight frameworks for digital assets.",
      "Identify inclusive digital payment solutions that support remittances and financial access without undermining stability.",
    ],
    agenda: [
      {
        title:
          "Evaluating the Impact of Cryptocurrency on Global Financial Stability and Development with a Focus on El Salvador's Adoption of Bitcoin",
        description:
          "Review El Salvador's experience to inform international guidelines on digital currencies, financial resilience, and development finance.",
      },
    ],
    resources: [
      {
        title: "IMF 2024 Article IV Consultation with El Salvador",
        description:
          "Provides IMF analysis and documents on El Salvador’s economy, including the latest Article IV consultation materials.",
        link: "https://www.imf.org/en/Countries/SLV",
      },
      {
        title: "BIS Annual Economic Report 2022: Cryptoassets",
        description:
          "Discusses vulnerabilities in crypto markets and regulatory approaches to safeguard financial stability.",
        link: "https://www.bis.org/publ/arpdf/ar2022e3.htm",
      },
      {
        title: "UNCTAD Policy Brief: All that Glitters is not Gold",
        description:
          "Highlights the development challenges of widespread crypto use in emerging economies and policy options.",
        link: "https://unctad.org/system/files/official-document/presspb2023d2_en.pdf",
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
    moderator: "Alejandro Nunez",
    chair: "Isabella Atunez",
    summary: [
      "Expand education, training, and STEM pathways for women and girls across Middle Eastern countries.",
    ],
    takeaways: [
      "Dismantle legal and social barriers that limit girls’ access to secondary and tertiary schooling.",
      "Invest in gender-responsive STEM curricula, scholarships, and mentorship programs linked to the digital economy.",
      "Partner with civil society and private-sector leaders to provide safe learning environments and career pipelines.",
    ],
    agenda: [
      {
        title:
          "Access and Participation of Women and Girls in Education, Training, Science, and Technology in the Middle East",
        description:
          "Design regional frameworks that expand digital infrastructure, teacher training, and financial support for women in STEM fields.",
      },
    ],
    resources: [
      {
        title: "UN Women: Progress on the Sustainable Development Goals – The Gender Snapshot 2023",
        description:
          "Provides regional data on gender gaps in education, technology access, and workforce participation.",
        link: "https://www.unwomen.org/en/digital-library/publications/2023/09/progress-on-the-sustainable-development-goals-the-gender-snapshot-2023",
      },
      {
        title: "UNESCO Cracking the Code: Girls’ and Women’s Education in STEM",
        description:
          "Analyzes barriers to STEM education and offers policy recommendations for gender-transformative approaches.",
        link: "https://unesdoc.unesco.org/ark:/48223/pf0000253479",
      },
      {
        title: "World Bank: Education for Employment in the Middle East and North Africa",
        description:
          "Examines skills gaps and strategies to align women’s training with labor-market opportunities in the region.",
        link: "https://openknowledge.worldbank.org/entities/publication/7e01b8b3-8447-53e6-b073-803ca4f26463",
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
    moderator: "Andy Marin",
    chair: "Natalia Amaya",
    summary: [
      "Lead coordinated action to contain antimicrobial resistance driven by inappropriate antibiotic use in South Asia.",
    ],
    takeaways: [
      "Scale stewardship programs that curb overprescription across community clinics, hospitals, and pharmacies.",
      "Align human, animal, and environmental health regulations to reduce misuse of medically important antimicrobials.",
      "Invest in surveillance, laboratory capacity, and public awareness to detect resistance trends early.",
    ],
    agenda: [
      {
        title:
          "Addressing Antimicrobial Resistance in South Asia Caused by Overprescription and Misuse",
        description:
          "Coordinate national action plans, regulatory reforms, and community outreach to slow the spread of drug-resistant infections.",
      },
    ],
    resources: [
      {
        title: "WHO Global Action Plan on Antimicrobial Resistance",
        description:
          "Sets the five strategic objectives guiding national responses to AMR.",
        link: "https://www.who.int/publications/i/item/9789241509763",
      },
      {
        title: "WHO South-East Asia Regional Strategy on AMR",
        description:
          "Details regional priorities for stewardship, surveillance, and multisectoral coordination.",
        link: "https://www.who.int/southeastasia/health-topics/antimicrobial-resistance",
      },
      {
        title: "World Bank: Drug-Resistant Infections - A Threat to Our Economic Future",
        description:
          "Analyzes the economic burden of AMR and investment needs in low- and middle-income countries.",
        link: "https://documents.worldbank.org/en/publication/documents-reports/documentdetail/323311493396993758/",
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
    moderator: "Emma Vaillard",
    chair: "Mathias Padron",
    summary: [
      "Strengthen multinational policing to dismantle drug trafficking networks and cartel operations impacting Mexico.",
    ],
    takeaways: [
      "Expand secure intelligence sharing and joint task forces with Mexican and regional law-enforcement agencies.",
      "Target cartel logistics by tracing precursor chemicals, weapons flows, and financial supply chains.",
      "Embed anti-corruption safeguards and human rights protections in cooperative enforcement operations.",
    ],
    agenda: [
      {
        title:
          "International Cooperation Against Drug Trafficking Networks and Cartel Operations in Mexico",
        description:
          "Develop coordinated strategies for investigations, asset seizures, and community resilience across the Americas.",
      },
    ],
    resources: [
      {
        title: "INTERPOL Drug Trafficking Operations",
        description:
          "Overview of INTERPOL-led coordinated actions targeting transnational narcotics smuggling networks.",
        link: "https://www.interpol.int/en/Crimes/Drug-trafficking",
      },
      {
        title: "UNODC World Drug Report 2024",
        description:
          "Provides global and regional data on drug markets, trafficking routes, and cartel dynamics.",
        link: "https://www.unodc.org/unodc/en/data-and-analysis/wdr.html",
      },
      {
        title: "International Narcotics Control Strategy Report 2024",
        description:
          "Analyzes national efforts, including Mexico and the United States, to disrupt drug production and trafficking.",
        link: "https://www.state.gov/reports/2024-international-narcotics-control-strategy-report/",
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
    moderator: "Estefania Cerda",
    chair: "Oscar Fernandez",
    summary: [
      "Coordinate decisive, rights-respecting measures to counter terrorism threats impacting Europe amid complex migration dynamics.",
    ],
    takeaways: [
      "Strengthen intelligence sharing and border management partnerships that align with international refugee protections.",
      "Address radicalization drivers through community engagement, integration policies, and strategic communications.",
      "Ensure Security Council mandates reinforce UN counter-terrorism norms while safeguarding human rights and due process.",
    ],
    agenda: [
      {
        title:
          "Addressing Terrorist Threats in Europe Amid Rising Immigration",
        description:
          "Debate coordinated border security, information sharing, and community resilience initiatives that balance security and humanitarian obligations.",
      },
    ],
    resources: [
      {
        title: "UN Security Council Resolution 2396 (2017)",
        description:
          "Sets obligations for member states on countering terrorist travel, information sharing, and reintegration support.",
        link: "https://undocs.org/S/RES/2396(2017)",
      },
      {
        title: "UN Counter-Terrorism Committee Executive Directorate: Trends Alert on Terrorism in Europe",
        description:
          "Summarizes emerging threat patterns, risk factors, and recommended responses for European states.",
        link: "https://www.un.org/securitycouncil/ctc/unite-web-topic/trends-alert",
      },
      {
        title: "EUROPOL European Union Terrorism Situation and Trend Report (TE-SAT)",
        description:
          "Provides annual analysis of terrorism incidents, arrests, and prosecution trends across the EU.",
        link: "https://www.europol.europa.eu/publications-events/main-reports/tesat-report",
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
    moderator: "Pia Zambrano",
    chair: "Ana Chiunti",
    summary: [
      "Shape multilateral guardrails that ensure artificial intelligence advances peace, security, and human rights.",
    ],
    takeaways: [
      "Develop shared principles for responsible AI design, deployment, and oversight in security contexts.",
      "Promote transparency, accountability, and risk assessments for cross-border AI applications.",
      "Empower inclusive participation from member states, civil society, and industry in global AI governance.",
    ],
    agenda: [
      {
        title:
          "Regulating the Development and Use of AI in International Security and Governance",
        description:
          "Debate norms, compliance mechanisms, and capacity-building to manage AI risks while harnessing opportunities for multilateral cooperation.",
      },
    ],
    resources: [
      {
        title: "UN Secretary-General’s Policy Brief: A New Agenda for Peace",
        description:
          "Frames governance recommendations for emerging technologies, including AI, within collective security.",
        link: "https://digitallibrary.un.org/record/4019113/files/Our_Common_Agenda_Policy_Brief_6_A_New_Agenda_for_Peace.pdf?ln=en",
      },
      {
        title: "High-Level Advisory Body on Artificial Intelligence: Interim Report",
        description:
          "Outlines options for global AI governance, risk management, and institutional cooperation.",
        link: "https://digitallibrary.un.org/record/4017518/files/Multistakeholder_Advisory_Body_on_AI_Interim_Report.pdf?ln=en",
      },
      {
        title: "OECD Framework for the Classification of AI Systems",
        description:
          "Provides criteria for assessing AI risk levels and aligning governance tools across jurisdictions.",
        link: "https://oecd.ai/en/classification",
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

  return parts.join(" · ");
}

function buildCommitteeSummary(data) {
  const hasSummary = Array.isArray(data && data.summary);
  const summary = hasSummary ? [...data.summary] : [];

  const leaders = [];
  if (data && data.moderator) {
    leaders.push(`Moderator: ${data.moderator}`);
  }
  if (data && data.chair) {
    leaders.push(`Chair: ${data.chair}`);
  } else if (data && data.president) {
    leaders.push(`Chair: ${data.president}`);
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
  const studentIdInput = document.getElementById("studentId");
  if (!studentForm || !studentIdInput) {
    return;
  }

  const normalizeStudentId = (value) =>
    (value || "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "");

  const studentEntries = [];
  const addCommitteeStudents = (committee, template, students) => {
    students.forEach(({ email, name, country = null }) => {
      const cleanedEmail = (email || "").trim().replace(/\s+/g, "");
      const normalizedEmail = normalizeStudentId(cleanedEmail);
      const normalizedName = normalizeStudentId(name);
      const lookupKeys = Array.from(
        new Set(
          [normalizedEmail, normalizedName].filter((key) => key.length)
        )
      );

      studentEntries.push({
        email: cleanedEmail,
        name,
        committee,
        country: country ?? null,
        template,
        lookupKeys,
        normalizedEmail,
        normalizedName,
      });
    });
  };

  addCommitteeStudents("World Food Programme", "downloads/background-paper-WFP.pdf", [
    { email: "acruza@noordwijk.edu.mx", name: "Arantza Cruz" },
    { email: "gesparzag@noordwijk.edu.mx", name: "Guadalupe Esparza" },
    { email: "dkersch@noordwijk.edu.mx", name: "Daniela Kerch Bragado", country: "Argentina" },
    {
      email: "lmexpositor@noordwijk.edu.mx",
      name: "Lucía Marié Expósito Ramos",
      country: "Bangladesh-Etiopia",
    },
    { email: "vmartinezs@noordwijk.edu.mx", name: "Valeria Martínez Salas", country: "Brazil" },
    { email: "jarizae@noordwijk.edu.mx", name: "Jose Manuel Ariza Remes", country: "China" },
    { email: "mnovoag@noordwijk.edu.mx", name: "Maximiliano Novoa Gómez", country: "Egypt" },
    { email: "afierrom@noordwijk.edu.mx", name: "Ana Paula Fierro Muñoz", country: "Ethiopia" },
    { email: "ldiazv@noordwijk.edu.mx", name: "Luis Manuel Diaz Vázquez", country: "France" },
    { email: "brodriguezm@noordwijk.edu.mx", name: "Bárbara Rodríguez Mendoza", country: "Germany" },
    { email: "lmedinac@noordwijk.edu.mx", name: "Layla Victoria Medina Cardel", country: "India" },
    {
      email: "acabreran@noordwijk.edu.mx",
      name: "Alejandro Cabrera Navarro",
      country: "Indonesia-Bolivia",
    },
    {
      email: "fvillavicencioo@noordwijk.edu.mx",
      name: "Fernanda Villavicencio Ortiz",
      country: "Japan",
    },
    { email: "vgonzalezm@noordwijk.edu.mx", name: "Viridiana González Meneses", country: "Kenya" },
    {
      email: "cmerinob@noordwijk.edu.mx",
      name: "Carlos Antonio Merino Bañuelos",
      country: "Mexico",
    },
    { email: "lricanor@noordwijk.edu.mx", name: "Luca Ricaño Rullán", country: "Nigeria" },
    { email: "srodriguez@noordwijk.edu.mx", name: "Sofia Rodriguez", country: "Pakistan" },
    { email: "amoralesg@noordwijk.edu.mx", name: "Aarón Morales Gutiérrez", country: "Saudi Arabia" },
    { email: "abenitezp@noordwijk.edu.mx", name: "Alejandro Benítez Pérez", country: "South Africa" },
    { email: "jperezc@noordwijk.edu.mx", name: "José María Pérez Castillo", country: "South Sudan" },
    { email: "shernandezg@noordwijk.edu.mx", name: "Salvador Hernández García", country: "Turkey" },
    { email: "aamoresg@noordwijk.edu.mx", name: "Aranza Valentina Amores Gómez", country: "United Kingdom" },
    {
      email: "ealdamay@noordwijk.edu.mx",
      name: "Enrique Aldama Yaroslavtseva",
      country: "United States of America",
    },
    { email: "dcruzc@noordwijk.edu.mx", name: "Daniela Nazareth Cruz Cabrera", country: "Venezuela" },
  ]);

  addCommitteeStudents(
    "United Nations Environment Programme",
    "downloads/background-paper-UNEP.pdf",
    [
      { email: "cquirosm@noordwijk.edu.mx", name: "Camilo Quirós Mendoza" },
      { email: "adediego@noordwijk.edu.mx", name: "Amaya de Diego" },
      { email: "atrujillom@noordwijk.edu.mx", name: "Andrea Trujillo Morales", country: "Australia" },
      { email: "mlopezm@noordwijk.edu.mx", name: "María Isabel López Mendieta", country: "Brazil" },
      { email: "eriverav@noordwijk.edu.mx", name: "Elian Rivera Venta", country: "Canada" },
      { email: "mmoralest@noordwijk.edu.mx", name: "Manuel Emiliano Morales Tejada", country: "Chile" },
      { email: "cquinteror@noordwijk.edu.mx", name: "Cristiane Giselle Quintero Rodríguez", country: "China" },
      { email: "imalpicae@noordwijk.edu.mx", name: "Isabela Malpica Echeverría", country: "Egypt" },
      { email: "amoralesr@noordwijk.edu.mx", name: "Arianna María Morales Rojas", country: "Ethiopia" },
      { email: "elunap@noordwijk.edu.mx", name: "Ethan Luna Peréz", country: "France" },
      { email: "lbacareyes@noordwijk.edu.mx", name: "Luis Gerardo Baca Reyes", country: "Germany" },
      { email: "dmorfinl@noordwijk.edu.mx", name: "Daniela Morfin Luna", country: "India" },
      { email: "bhurtadot@noordwijk.edu.mx", name: "Brianda Hurtado Torres", country: "Indonesia" },
      { email: "acano@noordwijk.edu.mx", name: "Alejandro Cano Torres", country: "Japan" },
      { email: "nriosg@noordwijk.edu.mx", name: "Natalia Ríos García", country: "Mexico" },
      { email: "dlevetp@noordwijk.edu.mx", name: "David Levet Peralta", country: "New Zealand" },
      { email: "vperezc@noordwijk.edu.mx", name: "Victoria Pérez Capitaine", country: "Norway" },
      { email: "isantibanezr@noordwijk.edu.mx", name: "Isaac Santibañez Rodríguez", country: "Russia" },
      { email: "lsanchezr@noordwijk.edu.mx", name: "Leonardo Sánchez Roa", country: "South Africa" },
      { email: "lgonzalezl@noordwijk.edu.mx", name: "Lizette Alejandra González Lutrillo", country: "Sweden" },
      { email: "lsainzr@noordwijk.edu.mx", name: "Lorenzo Sainz Ruiz De La Peña", country: "Switzerland" },
      { email: "fsilvac@noordwijk.edu.mx", name: "Franco Paolo Silva Carpinteyro", country: "United Kingdom" },
      {
        email: "xescobedob@noordwijk.edu.mx",
        name: "Ximena Escobedo Benítez",
        country: "United States of America",
      },
    ]
  );

  addCommitteeStudents(
    "United Nations International Children's Emergency Fund",
    "downloads/background-paper-UNICEF.pdf",
    [
      { email: "rvelazquez@noordwijk.edu.mx", name: "Ramon Velazquez" },
      { email: "mdemaria@noordwijk.edu.mx", name: "Miel de María" },
      {
        email: "cmeyerp@noordwijk.edu.mx",
        name: "Christopher Anthony Meyer Pérez",
        country: "Afghanistan",
      },
      { email: "tbarquing@noordwijk.edu.mx", name: "Thiago Barquin Goris", country: "Australia" },
      { email: "jguevarav@noordwijk.edu.mx", name: "José Gael Guevara Valerio", country: "Brasil" },
      { email: "mhuertal@noordwijk.edu.mx", name: "Marco Huerta León", country: "Canada" },
      { email: "cchirrab@noordwijk.edu.mx", name: "Camila Belén Chirra", country: "China" },
      { email: "mjimenezt@noordwijk.edu.mx", name: "Mauricio Jiménez Tello", country: "Colombia" },
      { email: "fguzmanm@noordwijk.edu.mx", name: "Frida Guzmán Martínez", country: "Egypt" },
      { email: "egonzalezm@noordwijk.edu.mx", name: "Edgar Mateo González Montero", country: "France" },
      { email: "jhernandezr@noordwijk.edu.mx", name: "Julieta Hernández Retana", country: "Germany" },
      { email: "saguilarg@noordwijk.edu.mx", name: "Santiago Aguilar Galindo", country: "Japan" },
      { email: "mcarrascoc@noordwijk.edu.mx", name: "María Inés Carrasco Cruz", country: "Mexico" },
      { email: "jvelazquezl@noordwijk.edu.mx", name: "José Manuel Velázquez López", country: "Netherlands" },
      { email: "amaldonadoc@noordwijk.edu.mx", name: "Ana Maldonado Cobo-Losey", country: "New Zealand" },
      {
        email: "corozcof@noordwijk.edu.mx",
        name: "Carlos Antonio Orozco Fernández",
        country: "Nigeria",
      },
      { email: "imelchorg@noordwijk.edu.mx", name: "Ivanna Melchor Gamboa", country: "Pakistan" },
      { email: "abaizabalo@noordwijk.edu.mx", name: "Arya Baizabal Ortiz", country: "Philippines" },
      { email: "elunaa@noordwijk.edu.mx", name: "Elías Luna Arrevillaga", country: "Spain" },
      { email: "lterlaudo@noordwijk.edu.mx", name: "Luca Jules Terlaud Osorno", country: "Sweden" },
      { email: "ilinaresm@noordwijk.edu.mx", name: "Iker Linares Mora", country: "Switzerland" },
      { email: "raguilarl@noordwijk.edu.mx", name: "Rodrigo Aguilar López", country: "United Kingdom" },
      {
        email: "aarostegu h@noordwijk.edu.mx",
        name: "Ander Aróstegui Huerta",
        country: "United States of America",
      },
    ]
  );

  addCommitteeStudents(
    "United Nations Educational, Scientific and Cultural Organization",
    "downloads/background-paper-UNESCO.pdf",
    [
      { email: "rbelchez@noordwijk.edu.mx", name: "Regina Belchez" },
      { email: "stapia@noordwijk.edu.mx", name: "Sofia Tapia" },
      {
        email: "jvelazquezl@noordwijk.edu.mx",
        name: "Juan Pablo Velázquez López",
        country: "Afganistan",
      },
      { email: "rramirezg@noordwijk.edu.mx", name: "Regina Ramírez González", country: "Argentina" },
      { email: "rtorreso@noordwijk.edu.mx", name: "Rodrigo Torres Ochoa", country: "Australia" },
      { email: "vfaibrem@noordwijk.edu.mx", name: "Valeria Faibre Morales", country: "Brazil" },
      { email: "rpalombar@noordwijk.edu.mx", name: "Roberto Palomba Rivera", country: "Canada" },
      { email: "esanchezv@noordwijk.edu.mx", name: "Elena Sánchez Vaillard", country: "Colombia" },
      { email: "bhernandezv@noordwijk.edu.mx", name: "Bruno Hernández Velázquez", country: "Cuba" },
      { email: "achavezg@noordwijk.edu.mx", name: "Ana Paula Chavez Garizurieta", country: "France" },
      { email: "nromerop@noordwijk.edu.mx", name: "Nicolás Romero Pérez", country: "Germany" },
      { email: "jlagunesg@noordwijk.edu.mx", name: "José Cruz Lagunes González", country: "Iraq" },
      { email: "dgarcial@noordwijk.edu.mx", name: "David García Liñero", country: "Italy" },
      { email: "ssosar@noordwijk.edu.mx", name: "Santiago Sosa Rodriguez", country: "Kenya" },
      { email: "ayanezm@noordwijk.edu.mx", name: "Aarón Yañez Muñoz", country: "Mexico" },
      { email: "emedinac@noordwijk.edu.mx", name: "Eleanor Medina Cardel", country: "Haiti" },
      { email: "alopezm@noordwijk.edu.mx", name: "Ángel Gabriel López Mendieta", country: "Morocco" },
      { email: "ggonzalezh@noordwijk.edu.mx", name: "Gonzalo González Hernández", country: "Nigeria" },
      { email: "nsalamad@noordwijk.edu.mx", name: "Natalia Elisa Salama De Ochoa", country: "Paraguay" },
      { email: "jchapag@noordwijk.edu.mx", name: "Juan Carlos Chapa González", country: "Peru" },
      { email: "phernandezv@noordwijk.edu.mx", name: "Paula Hernández Velázquez", country: "South Korea" },
      { email: "gmedinad@noordwijk.edu.mx", name: "Germán Medina Díaz", country: "Spain" },
      { email: "igarciag@noordwijk.edu.mx", name: "Iñaki García García De León", country: "Sweden" },
      { email: "vcalderons@noordwijk.edu.mx", name: "Valentina Calderon Sandoval", country: "United Kingdom" },
      {
        email: "uamerena l@noordwijk.edu.mx",
        name: "Ulises Amerena Lagunes",
        country: "United States of America",
      },
    ]
  );

  addCommitteeStudents(
    "United Nations High Commissioner for Refugees",
    "downloads/background-paper-UNHCR.pdf",
    [
      { email: "amontesd@noordwijk.edu.mx", name: "Andrea Montes de Oca" },
      { email: "cjimenez@noordwijk.edu.mx", name: "Claudiel Jimenez" },
      { email: "alinaresm@noordwijk.edu.mx", name: "Alberto Linares Mora", country: "Australia" },
      { email: "rlopezv@noordwijk.edu.mx", name: "Ramsés López Vichi", country: "Bangladesh" },
      {
        email: "mrgoldsmithl@noordwijk.edu.mx",
        name: "Maximiliano Rafael Goldsmith Lara",
        country: "Brazil",
      },
      { email: "nvazquezc@noordwijk.edu.mx", name: "Natalie Vázquez Cruz", country: "Canada" },
      { email: "rmoralesg@noordwijk.edu.mx", name: "Rodrigo Morales Gutiérrez", country: "Colombia" },
      { email: "ehernandezg@noordwijk.edu.mx", name: "Emmanuel Hernández Gómez", country: "Egypt" },
      { email: "laaguirre@noordwijk.edu.mx", name: "Luis Alonso Aguirre", country: "Findland" },
      { email: "rguerrerop@noordwijk.edu.mx", name: "Rodrigo Guerrero Parra", country: "France" },
      { email: "vmarquinezf@noordwijk.edu.mx", name: "Valeria Marquínez Fuentes", country: "Germany" },
      { email: "idelriov@noordwijk.edu.mx", name: "Isabella Del Rio Villa", country: "Greece" },
      { email: "aordonezk@noordwijk.edu.mx", name: "Andrés Ordoñez Kloss", country: "Italy" },
      { email: "acastanedat@noordwijk.edu.mx", name: "Airana Castañeda Toxtega", country: "Japan" },
      { email: "cfsosac@noordwijk.edu.mx", name: "Carlos Fernando Sosa Castro", country: "Jordan" },
      { email: "esantosr@noordwijk.edu.mx", name: "Emiliano Santos Ramírez", country: "Lebanon" },
      { email: "jmromeroh@noordwijk.edu.mx", name: "José Manuel Romero Hoyos", country: "Mexico" },
      { email: "agdiazz@noordwijk.edu.mx", name: "Alan Guido Díaz Zapata", country: "Netherlands" },
      { email: "drgarciav@noordwijk.edu.mx", name: "Diego Rafael Garcia Valerio", country: "Nigeria" },
      { email: "cagarcian@noordwijk.edu.mx", name: "Carlos Alfredo García Nieto", country: "Norway" },
      { email: "iarizar@noordwijk.edu.mx", name: "Ian Ariza Remes", country: "Pakistan" },
      { email: "azavalad@noordwijk.edu.mx", name: "Arnoldo Zavala Domínguez", country: "Sweden" },
      { email: "aspadronh@noordwijk.edu.mx", name: "Ana Sofía Padrón Hernández", country: "Switzerland" },
      { email: "emelchorg@noordwijk.edu.mx", name: "Estefanía Melchor Gamboa", country: "United Kingdom" },
      {
        email: "mjaguilarg@noordwijk.edu.mx",
        name: "María José Aguilar Galindo",
        country: "United States of America",
      },
    ]
  );

  addCommitteeStudents(
    "Commission on Science and Technology for Development",
    "downloads/background-paper-CSTD.pdf",
    [
      { email: "mlopez@noordwijk.edu.mx", name: "Mayte Lopez" },
      { email: "rtorres@noordwijk.edu.mx", name: "Regina Torres" },
      { email: "ralboresa@noordwijk.edu.mx", name: "Rachel Albores Angulo", country: "Argentina" },
      { email: "dsainzr@noordwijk.edu.mx", name: "Diego Sainz Ruiz De La Peña", country: "Portugal" },
      { email: "rmenesesr@noordwijk.edu.mx", name: "Regina Meneses Ruiz", country: "Australia" },
      { email: "jccastelanm@noordwijk.edu.mx", name: "Jennifer Celeste Castelan Mato", country: "Brazil" },
      { email: "ecarrillol@noordwijk.edu.mx", name: "Emir Carrillo López", country: "Canada" },
      { email: "strillov@noordwijk.edu.mx", name: "Sofía Trillo Vega", country: "China" },
      { email: "rgarcial@noordwijk.edu.mx", name: "Rodrigo García Liñero", country: "El Salvador" },
      {
        email: "xmgonzaleza@noordwijk.edu.mx",
        name: "Ximena Marlene González Alfaro",
        country: "France",
      },
      { email: "eruizt@noordwijk.edu.mx", name: "Emiliano Ruiz Torres", country: "Germany" },
      { email: "rnunezq@noordwijk.edu.mx", name: "Rodrigo Núñez Quiñones", country: "Norway" },
      { email: "oeservinm@noordwijk.edu.mx", name: "Oscar Ernesto Servin Mesinas", country: "India" },
      { email: "amundot@noordwijk.edu.mx", name: "Alan Mundo Tenorio", country: "Japan" },
      {
        email: "aelozanog@noordwijk.edu.mx",
        name: "Aarón Eduardo Lozano González",
        country: "Luxembourg",
      },
      { email: "smazas@noordwijk.edu.mx", name: "Santiago Maza Sánchez", country: "Mexico" },
      { email: "llagunesd@noordwijk.edu.mx", name: "Leonardo Lagunes Delon", country: "Nigeria" },
      { email: "xrazoe@noordwijk.edu.mx", name: "Ximena Razo Estudillo", country: "Singapore" },
      { email: "dmarizp@noordwijk.edu.mx", name: "Debbie Mariz Porres", country: "South Africa" },
      { email: "jfernandezf@noordwijk.edu.mx", name: "Juan Fernández Fernández", country: "South Kores" },
      { email: "rruedap@noordwijk.edu.mx", name: "Rebeca Rueda Petriz", country: "Sweden" },
      { email: "prodriguezg@noordwijk.edu.mx", name: "Paola Rodríguez Gasperín", country: "Switzerland" },
      { email: "problesz@noordwijk.edu.mx", name: "Paula Robles Zárate", country: "Turkey" },
      { email: "cereyesm@noordwijk.edu.mx", name: "Cesar Emmanuel Reyes Marín", country: "United Kingdom" },
      { email: "lratiag@noordwijk.edu.mx", name: "Lucia Ratia Galego", country: "United States of America" },
    ]
  );

  addCommitteeStudents(
    "Commission on the Status of Women",
    "downloads/background-paper-CSW.pdf",
    [
      { email: "achunti@noordwijk.edu.mx", name: "Ana Chunti" },
      { email: "iantunez@noordwijk.edu.mx", name: "Isabella Antúnez" },
      { email: "vjgomezr@noordwijk.edu.mx", name: "Vayda Josephine Gomez Reynaud", country: "Australia" },
      { email: "jrandrades@noordwijk.edu.mx", name: "Jesús Roberto Andrade Sánchez", country: "Belarus" },
      { email: "lfmoralest@noordwijk.edu.mx", name: "Lia Fernanda Morales Tejada", country: "Canada" },
      { email: "rzarrabalm@noordwijk.edu.mx", name: "Regina Zarrabal Montes", country: "Chile" },
      { email: "vlunaa@noordwijk.edu.mx", name: "Valentina Luna Arrevillaga", country: "Egypt" },
      { email: "arivasc@noordwijk.edu.mx", name: "Aynara Rivas Calderón", country: "France" },
      { email: "pathorper@noordwijk.edu.mx", name: "Patrick Adam Thorpe Romero", country: "Germany" },
      { email: "sngarciap@noordwijk.edu.mx", name: "Samantha Nicole García Pérez", country: "Iceland" },
      { email: "jmnovoag@noordwijk.edu.mx", name: "José María Novoa Gómez", country: "India" },
      { email: "arivas c@noordwijk.edu.mx", name: "Alberto Rivas Calderón", country: "Irak" },
      { email: "jdcorderoj@noordwijk.edu.mx", name: "José Daniel Cordero Jiménez", country: "Italy" },
      { email: "vbarriosr@noordwijk.edu.mx", name: "Valentina Barrios Rivadeneyra", country: "Lithuania" },
      {
        email: "ccquinteror@noordwijk.edu.mx",
        name: "Christiane Carleigh Quintero Rodríguez",
        country: "Mongolia",
      },
      { email: "dlagunesc@noordwijk.edu.mx", name: "Denisse Lagunes Calvo", country: "Netherlands" },
      { email: "rbaronb@noordwijk.edu.mx", name: "Regina Barón Barrera", country: "Poland" },
      { email: "aaguilarl@noordwijk.edu.mx", name: "Alejandro Aguilar López", country: "Saudi Arabia" },
      { email: "mjcastrog@noordwijk.edu.mx", name: "Maria José Castro Gonzalez", country: "Singapore" },
      { email: "jarullanl@noordwijk.edu.mx", name: "Juan Arturo Rullan Lajud", country: "Sweden" },
      { email: "rramonj@noordwijk.edu.mx", name: "Rodrigo Ramón Jácome", country: "Turkey" },
      { email: "narciniegam@noordwijk.edu.mx", name: "Nina Arciniega Mateos", country: "United Arab Emirates" },
      { email: "mlagunesg@noordwijk.edu.mx", name: "Mia Lagunes Galaviz", country: "United Kingdom" },
      { email: "alopezv@noordwijk.edu.mx", name: "Adrian López Vichi", country: "United States of America" },
    ]
  );

  addCommitteeStudents(
    "World Health Organization",
    "downloads/background-paper-WHO.pdf",
    [
      { email: "amarin@noordwijk.edu.mx", name: "Andrea Marin" },
      { email: "namaya@noordwijk.edu.mx", name: "Natalia Amaya" },
      {
        email: "lcdominguezb@noordwijk.edu.mx",
        name: "Luis Carlos Domínguez Betancourt",
        country: "Afghanistan",
      },
      { email: "erodriguezv@noordwijk.edu.mx", name: "Emma Rodríguez Vila", country: "Australia" },
      { email: "rcampah@noordwijk.edu.mx", name: "Rodrigo Campa Hernández", country: "Bangladesh" },
      { email: "mcamachoc@noordwijk.edu.mx", name: "Mariana Camacho Carmona", country: "Bolivia" },
      { email: "acalderond@noordwijk.edu.mx", name: "Andrea Calderón Delgado", country: "Canada" },
      { email: "vbenitezp@noordwijk.edu.mx", name: "Valeria Benítez Pérez", country: "France" },
      { email: "mdelfinm@noordwijk.edu.mx", name: "Mariano Delfin Miranda", country: "Germany" },
      { email: "aroblesm@noordwijk.edu.mx", name: "Andrea Robles Macias", country: "Haiti" },
      { email: "amarina@noordwijk.edu.mx", name: "Ariane Marín Athié", country: "India" },
      { email: "jmtejedao@noordwijk.edu.mx", name: "Jorge Manuel Tejeda Orozco", country: "Indonesia" },
      { email: "qsantosr@noordwijk.edu.mx", name: "Quetzalli Santos Ramírez", country: "Iran" },
      {
        email: "ejramirezh@noordwijk.edu.mx",
        name: "Erika Jaomara Ramírez Hernández",
        country: "Japan",
      },
      { email: "rgonzalezc@noordwijk.edu.mx", name: "Regina González Córdova", country: "Myanmar" },
      { email: "jmibarrar@noordwijk.edu.mx", name: "José María Ibarra Rangel", country: "Nepal" },
      { email: "ecarvajalm@noordwijk.edu.mx", name: "Emmanuel Carvajal Medina", country: "Netherlands" },
      { email: "mcastelanm@noordwijk.edu.mx", name: "Maximiliano Castelan Mato", country: "Norway" },
      { email: "fgironm@noordwijk.edu.mx", name: "Florianne Girón Moreno", country: "Pakistan" },
      { email: "amiravetea@noordwijk.edu.mx", name: "Arath Miravete Arellano", country: "South Korea" },
      { email: "rjimenezm@noordwijk.edu.mx", name: "Regina Jiménez Méndez", country: "Switzerland" },
      { email: "mverar@noordwijk.edu.mx", name: "Mateo Vera Ramirez", country: "Thailand" },
      { email: "haguirrev@noordwijk.edu.mx", name: "Héctor Aguirre Vázquez", country: "United Kingdom" },
      {
        email: "amontesdeocag@noordwijk.edu.mx",
        name: "Alan Montes De Oca Gómez",
        country: "United States of America",
      },
    ]
  );

  addCommitteeStudents(
    "International Criminal Police Organization",
    "downloads/background-paper-INTERPOL.pdf",
    [
      { email: "mpadron@noordwijk.edu.mx", name: "Mathias Padrón" },
      { email: "gbarradast@noordwijk.edu.mx", name: "Gregorio Barradas Tress", country: "Australia" },
      { email: "xcamberop@noordwijk.edu.mx", name: "Xareni Cambero Pérez Salazar", country: "Bolivia" },
      { email: "dsoquif@noordwijk.edu.mx", name: "Diego Soqui Fernández", country: "Brazil" },
      { email: "vbeldag@noordwijk.edu.mx", name: "Valentina Belda García", country: "Canada" },
      { email: "pferreiram@noordwijk.edu.mx", name: "Paulina Ferreira Martínez", country: "Colombia" },
      { email: "mpenar@noordwijk.edu.mx", name: "Mauricio Peña Rico Utreta", country: "El Salvador" },
      { email: "chuescaf@noordwijk.edu.mx", name: "Camila Huesca Fernández", country: "France" },
      { email: "smenesesr@noordwijk.edu.mx", name: "Santiago Meneses Ruiz", country: "Germany" },
      { email: "agomeza@noordwijk.edu.mx", name: "Arley Gómez Amador", country: "Guatemala" },
      { email: "psfloresc@noordwijk.edu.mx", name: "Paloma Sara María Flores Castro", country: "Honduras" },
      { email: "aroblesm@noordwijk.edu.mx", name: "Anllela Robles Macias", country: "Italia" },
      { email: "capensamientor@noordwijk.edu.mx", name: "Camila Azul Pensamiento Ramírez", country: "Morocco" },
      { email: "ivelazquezt@noordwijk.edu.mx", name: "Ivanna Velázquez Tejeda", country: "Nigeria" },
      { email: "omartinezr@noordwijk.edu.mx", name: "Omar Martínez Rivera", country: "Panama" },
      { email: "kdelahuertal@noordwijk.edu.mx", name: "Katalina De La Huerta López", country: "Peru" },
      { email: "pcanop@noordwijk.edu.mx", name: "Paulina Cano Pérez", country: "Sierra Leone" },
      { email: "mjimenezg@noordwijk.edu.mx", name: "Mateo Jiménez González", country: "Spain" },
      { email: "rgarciam@noordwijk.edu.mx", name: "Rogelio García Martínez", country: "United Kingdom" },
      { email: "mvillegasm@noordwijk.edu.mx", name: "María Villegas Martínez", country: "United States of America" },
      { email: "rvillavicencioo@noordwijk.edu.mx", name: "Renata Villavicencio Ortiz", country: "Venezuela" },
    ]
  );

  addCommitteeStudents(
    "United Nations Security Council",
    "downloads/background-paper-UNSC.pdf",
    [
      { email: "ofernandez@noordwijk.edu.mx", name: "Oscar Fernandez" },
      {
        email: "jfbritog@noordwijk.edu.mx",
        name: "Juan Fernando Brito García",
        country: "Australia",
      },
      {
        email: "fgramirezm@noordwijk.edu.mx",
        name: "Fernando Guadalupe Ramírez Méndez",
        country: "Austria",
      },
      { email: "deeliass@noordwijk.edu.mx", name: "David Eduardo Elías Sánchez", country: "Belgium" },
      { email: "aahuedr@noordwijk.edu.mx", name: "Alexandra Ahued Rodríguez", country: "Denmark" },
      { email: "epedrerol@noordwijk.edu.mx", name: "Emilio Pedrero Lara", country: "Findland" },
      { email: "nfaibrem@noordwijk.edu.mx", name: "Natalia Faibre Morales", country: "France" },
      { email: "epfrancol@noordwijk.edu.mx", name: "Edgar Paolo Franco López", country: "Germany" },
      { email: "gmayam@noordwijk.edu.mx", name: "Gabriel Amaya Morales", country: "Ireland" },
      { email: "egmunozp@noordwijk.edu.mx", name: "Edher Gael Muñoz Prado", country: "Netherlands" },
      { email: "dponcef@noordwijk.edu.mx", name: "Diego Ponce Figueroa", country: "Portugal" },
      { email: "imoralesr@noordwijk.edu.mx", name: "Ivanna Morales Rojas", country: "Sweden" },
      { email: "iromeroh@noordwijk.edu.mx", name: "Israel Romero Hoyos", country: "United Kingdom" },
      { email: "amundot@noordwijk.edu.mx", name: "André Mundo Tenorio", country: "United States of America" },
    ]
  );

  addCommitteeStudents(
    "General Assembly",
    "downloads/background-paper-GA.pdf",
    [
      { email: "pzambrano@noordwijk.edu.mx", name: "Pia Zambrano" },
      { email: "abchiuntio@noordwijk.edu.mx", name: "Ana Chiunti" },
      { email: "emjimenezg@noordwijk.edu.mx", name: "Estrella Mariel Jiménez Gallegos", country: "Australia" },
      { email: "envelazquezt@noordwijk.edu.mx", name: "Elba Nabila Velázquez Tejeda", country: "Bangladesh" },
      { email: "msanchezr@noordwijk.edu.mx", name: "Miranda Sánchez Roa", country: "Brazil" },
      { email: "esanchezv@noordwijk.edu.mx", name: "Emma Sánchez Vaillard", country: "Canada" },
      { email: "nvikhrovh@noordwijk.edu.mx", name: "Natalia Vikhrov Hermida", country: "China" },
      { email: "iponcedeleonm@noordwijk.edu.mx", name: "Ivana Ponce de León Martínez", country: "France" },
      { email: "ftinocog@noordwijk.edu.mx", name: "Fabricio Tinoco González", country: "India" },
      { email: "mmthorper@noordwijk.edu.mx", name: "Meghan Martha Thorpe Romero", country: "Singapore" },
      { email: "emoralese@noordwijk.edu.mx", name: "Elan Morales Elvira", country: "South Korea" },
      { email: "anunezq@noordwijk.edu.mx", name: "Alejandro Núñez Quiñones", country: "United Kingdom" },
      { email: "jratiag@noordwijk.edu.mx", name: "Javier Ratia Galego", country: "United States of America" },
    ]
  );

  const studentDirectory = studentEntries.reduce((acc, entry) => {
    const { lookupKeys, normalizedEmail, normalizedName, ...record } = entry;
    lookupKeys.forEach((key) => {
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(record);
    });
    return acc;
  }, {});

  const resultDiv = document.getElementById("searchResult");
  const errorDiv = document.getElementById("searchError");

  if (resultDiv) {
    resultDiv.style.display = "none";
    resultDiv.innerHTML = "";
  }
  if (errorDiv) {
    errorDiv.style.display = "none";
  }

  const suggestionPanel = document.createElement("div");
  suggestionPanel.className = "portal-autocomplete";
  const suggestionList = document.createElement("ul");
  suggestionList.className = "portal-autocomplete__list";
  suggestionList.id = "studentId-autocomplete-list";
  suggestionList.setAttribute("role", "listbox");
  suggestionPanel.appendChild(suggestionList);

  studentIdInput.setAttribute("role", "combobox");
  studentIdInput.setAttribute("aria-autocomplete", "list");
  studentIdInput.setAttribute("aria-controls", suggestionList.id);
  studentIdInput.setAttribute("aria-expanded", "false");
  studentIdInput.setAttribute("autocomplete", "off");
  studentIdInput.insertAdjacentElement("afterend", suggestionPanel);

  const MIN_CHARACTERS = 2;
  const MAX_SUGGESTIONS = 10;
  let currentSuggestions = [];
  let activeIndex = -1;
  let blurTimeoutId = null;

  const clearPendingBlur = () => {
    if (blurTimeoutId !== null) {
      window.clearTimeout(blurTimeoutId);
      blurTimeoutId = null;
    }
  };

  const closeSuggestions = () => {
    clearPendingBlur();
    suggestionPanel.classList.remove("is-open");
    suggestionList.innerHTML = "";
    currentSuggestions = [];
    activeIndex = -1;
    studentIdInput.setAttribute("aria-expanded", "false");
    studentIdInput.removeAttribute("aria-activedescendant");
  };

  const focusOption = (index) => {
    const options = suggestionList.querySelectorAll(".portal-autocomplete__option");
    if (!options.length) {
      activeIndex = -1;
      studentIdInput.removeAttribute("aria-activedescendant");
      return;
    }

    if (index < 0) {
      options.forEach((option) => {
        option.classList.remove("is-active");
        option.setAttribute("aria-selected", "false");
      });
      activeIndex = -1;
      studentIdInput.removeAttribute("aria-activedescendant");
      return;
    }

    const boundedIndex = Math.max(0, Math.min(index, options.length - 1));

    options.forEach((option, optionIndex) => {
      const isActive = optionIndex === boundedIndex;
      option.classList.toggle("is-active", isActive);
      option.setAttribute("aria-selected", isActive ? "true" : "false");
      if (isActive) {
        studentIdInput.setAttribute("aria-activedescendant", option.id);
        option.scrollIntoView({ block: "nearest" });
      }
    });

    activeIndex = boundedIndex;
  };

  const selectSuggestion = (index) => {
    const suggestion = currentSuggestions[index];
    if (!suggestion) {
      return;
    }

    studentIdInput.value = suggestion.value;
    closeSuggestions();
    studentIdInput.focus();
    const { length } = studentIdInput.value;
    studentIdInput.setSelectionRange(length, length);
  };

  const formatSecondaryText = (entry, type) => {
    const details = [];
    if (type === "email") {
      details.push(entry.name);
    } else {
      details.push(entry.email);
    }
    if (entry.country) {
      details.push(entry.country);
    }
    if (entry.committee) {
      details.push(entry.committee);
    }
    return details.join(" • ");
  };

  const buildSuggestions = (query) => {
    if (!query.length) {
      return [];
    }

    const matches = [];

    studentEntries.forEach((entry) => {
      const emailIndex = entry.normalizedEmail.indexOf(query);
      if (emailIndex !== -1) {
        matches.push({
          type: "email",
          value: entry.email,
          primary: entry.email,
          secondary: formatSecondaryText(entry, "email"),
          matchIndex: emailIndex,
        });
      }

      const nameIndex = entry.normalizedName.indexOf(query);
      if (nameIndex !== -1) {
        matches.push({
          type: "name",
          value: entry.name,
          primary: entry.name,
          secondary: formatSecondaryText(entry, "name"),
          matchIndex: nameIndex,
        });
      }
    });

    const unique = [];
    const seen = new Set();
    matches.forEach((suggestion) => {
      const key = `${suggestion.type}:${suggestion.value.toLowerCase()}`;
      if (!seen.has(key)) {
        unique.push(suggestion);
        seen.add(key);
      }
    });

    unique.sort((a, b) => {
      if (a.matchIndex !== b.matchIndex) {
        return a.matchIndex - b.matchIndex;
      }
      return a.primary.localeCompare(b.primary);
    });

    return unique.slice(0, MAX_SUGGESTIONS);
  };

  const renderSuggestions = (suggestions) => {
    currentSuggestions = suggestions;
    suggestionList.innerHTML = "";

    if (!suggestions.length) {
      closeSuggestions();
      return;
    }

    suggestions.forEach((suggestion, index) => {
      const item = document.createElement("li");
      item.className = "portal-autocomplete__item";

      const option = document.createElement("button");
      option.type = "button";
      option.className = "portal-autocomplete__option";
      option.id = `${suggestionList.id}-option-${index}`;
      option.setAttribute("role", "option");
      option.setAttribute("aria-selected", "false");
      option.dataset.index = String(index);

      const primary = document.createElement("span");
      primary.className = "portal-autocomplete__primary";
      primary.textContent = suggestion.primary;
      option.appendChild(primary);

      if (suggestion.secondary) {
        const secondary = document.createElement("span");
        secondary.className = "portal-autocomplete__meta";
        secondary.textContent = suggestion.secondary;
        option.appendChild(secondary);
      }

      option.addEventListener("mousedown", (event) => {
        event.preventDefault();
        selectSuggestion(index);
      });

      item.appendChild(option);
      suggestionList.appendChild(item);
    });

    suggestionPanel.classList.add("is-open");
    studentIdInput.setAttribute("aria-expanded", "true");
    focusOption(-1);
  };

  const requestSuggestions = () => {
    const normalizedValue = normalizeStudentId(studentIdInput.value);
    if (normalizedValue.length < MIN_CHARACTERS) {
      closeSuggestions();
      return;
    }

    const suggestions = buildSuggestions(normalizedValue);
    if (!suggestions.length) {
      closeSuggestions();
      return;
    }

    renderSuggestions(suggestions);
  };

  studentIdInput.addEventListener("input", () => {
    clearPendingBlur();
    requestSuggestions();
  });

  studentIdInput.addEventListener("focus", () => {
    clearPendingBlur();
    requestSuggestions();
  });

  studentIdInput.addEventListener("blur", () => {
    blurTimeoutId = window.setTimeout(() => {
      closeSuggestions();
    }, 120);
  });

  studentIdInput.addEventListener("keydown", (event) => {
    const isOpen = suggestionPanel.classList.contains("is-open");

    if (event.key === "ArrowDown") {
      if (!isOpen) {
        const normalizedValue = normalizeStudentId(studentIdInput.value);
        if (normalizedValue.length >= MIN_CHARACTERS) {
          const suggestions = buildSuggestions(normalizedValue);
          if (suggestions.length) {
            renderSuggestions(suggestions);
          }
        }
      }
      if (currentSuggestions.length) {
        event.preventDefault();
        const nextIndex = activeIndex + 1 >= currentSuggestions.length ? 0 : activeIndex + 1;
        focusOption(nextIndex);
      }
    } else if (event.key === "ArrowUp") {
      if (isOpen && currentSuggestions.length) {
        event.preventDefault();
        const nextIndex =
          activeIndex <= 0 ? currentSuggestions.length - 1 : activeIndex - 1;
        focusOption(nextIndex);
      }
    } else if (event.key === "Enter") {
      if (isOpen && activeIndex >= 0) {
        event.preventDefault();
        selectSuggestion(activeIndex);
      } else {
        closeSuggestions();
      }
    } else if (event.key === "Escape") {
      if (isOpen) {
        event.preventDefault();
        closeSuggestions();
      }
    }
  });

  document.addEventListener("mousedown", (event) => {
    if (
      event.target !== studentIdInput &&
      !suggestionPanel.contains(event.target)
    ) {
      closeSuggestions();
    }
  });

  studentForm.addEventListener("submit", (event) => {
    event.preventDefault();
    closeSuggestions();
    const normalizedId = normalizeStudentId(studentIdInput.value || "");
    const matches =
      normalizedId && Object.prototype.hasOwnProperty.call(studentDirectory, normalizedId)
        ? studentDirectory[normalizedId]
        : undefined;

    if (resultDiv) {
      resultDiv.innerHTML = "";
      resultDiv.style.display = "none";
    }
    if (errorDiv) {
      errorDiv.style.display = "none";
    }

    if (matches && matches.length && resultDiv) {
      if (matches.length > 1) {
        const notice = document.createElement("p");
        notice.className = "search-result__notice";
        notice.textContent =
          "Multiple assignments found for this email or name. Please review each entry below.";
        resultDiv.appendChild(notice);
      }

      matches.forEach((student, index) => {
        const card = document.createElement("div");
        card.className = "student-info";

        const heading = document.createElement("h4");
        heading.textContent =
          matches.length > 1
            ? `Student Information ${index + 1}`
            : "Student Information";
        card.appendChild(heading);

        const emailPara = document.createElement("p");
        emailPara.innerHTML = `<strong>Email:</strong> ${student.email}`;
        card.appendChild(emailPara);

        const namePara = document.createElement("p");
        namePara.innerHTML = `<strong>Name:</strong> ${student.name}`;
        card.appendChild(namePara);

        const committeePara = document.createElement("p");
        committeePara.innerHTML = `<strong>Committee:</strong> ${student.committee}`;
        card.appendChild(committeePara);

        const countryPara = document.createElement("p");
        const countryValue = student.country ?? "Pending Assignment";
        countryPara.innerHTML = `<strong>Country:</strong> ${countryValue}`;
        card.appendChild(countryPara);

        const downloadLink = document.createElement("a");
        downloadLink.className = "download-button";
        downloadLink.href = student.template;
        downloadLink.textContent = "Access Background Paper";
        downloadLink.setAttribute("download", "");
        card.appendChild(downloadLink);

        resultDiv.appendChild(card);
      });

      resultDiv.style.display = "block";
    } else if (errorDiv) {
      errorDiv.style.display = "block";
    }
  });
}
