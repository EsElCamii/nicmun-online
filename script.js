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

function initScrollSpy() {
  const sections = Array.from(document.querySelectorAll("section[id]"));
  const navbar = document.querySelector(".navbar");
  if (!sections.length || !navbar) return;

  const updateActiveSection = () => {
    const scrollPosition = window.pageYOffset + 120;
    let currentSectionId = sections[0].id;

    for (const section of sections) {
      if (scrollPosition >= section.offsetTop) {
        currentSectionId = section.id;
      }
    }

    setActiveNavLink(currentSectionId);
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
  const answer = faqItem.querySelector(".faq-answer");
  faqItem.classList.toggle("active");
}

document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  initHeroButtons();
  initScheduleTabs();
  initScrollSpy();
  initCommitteeDetail();
  initStudentPortalLookup();
});
// Committee data for immersive article view
const committeeData = {
  CPD: {
    name: "Commission on Population and Development",
    council: "Economic and Social Council Commission",
    delegateCount: 24,
    format: "Double Delegation",
    summary: [
      "The Commission on Population and Development monitors progress on the Programme of Action adopted at the International Conference on Population and Development. For NICMUN 2025 this body examines how demographic shifts intersect with climate migration, social protection, and inclusive economic growth.",
      "Delegates should compare national census capacity, financing mechanisms, and cross-border partnerships that protect vulnerable communities while maintaining sustainable development momentum.",
    ],
    takeaways: [
      "Ground every solution in recent demographic data sets such as the World Population Prospects 2024 and SDG indicator 17.19 to demonstrate feasibility.",
      "Balance national sovereignty concerns with the need for regional compacts that manage climate driven migration corridors.",
      "Outline financing pathways such as domestic resource mobilization, development banks, or public private models that can scale social safety nets and resilient infrastructure.",
    ],
    agenda: [
      {
        title: "Designing Climate-Responsive Urban Demographic Policies",
        description:
          "Integrate population data with climate risk modeling so cities can plan inclusive housing, health, and social protection for incoming climate migrants.",
      },
    ],
    resources: [
      {
        title: "UN DESA World Population Prospects 2024",
        description:
          "Provides demographic baselines and projections that underpin urban planning for climate-affected migration corridors.",
        link: "https://population.un.org/wpp/",
      },
      {
        title: "UNFPA State of World Population 2024",
        description:
          "Explores how demographic trends, rights, and climate resilience intersect when designing people-centered population policies.",
        link: "https://www.unfpa.org/swop",
      },
      {
        title: "UN-Habitat World Cities Report 2024",
        description:
          "Details policy tools for sustainable urbanization and service delivery in rapidly growing climate destination cities.",
        link: "https://unhabitat.org/world-cities-report",
      },
    ],
    countries: [
      "Argentina",
      "Bangladesh",
      "Brazil",
      "China",
      "Egypt",
      "Ethiopia",
      "France",
      "Germany",
      "India",
      "Indonesia",
      "Japan",
      "Kenya",
      "Mexico",
      "Nigeria",
      "Pakistan",
      "Saudi Arabia",
      "South Africa",
      "South Sudan",
      "Turkey",
      "United Kingdom",
      "United States of America",
      "Venezuela",
    ],
  },
  UNSC: {
    name: "United Nations Security Council",
    council: "Principal Organ of the United Nations",
    delegateCount: 15,
    format: "Single Delegation",
    summary: [
      "As the only UN organ that can issue binding resolutions, the Security Council simulation calls on delegates to de escalate concurrent security flashpoints in the Red Sea and Sahel regions.",
      "Delegates will weigh targeted sanctions, peacekeeping mandates, and confidence building measures while safeguarding humanitarian access and compliance with international law.",
    ],
    takeaways: [
      "Reference Charter Chapters VI and VII when calibrating diplomatic, economic, and military tools.",
      "Draft clear language on arms embargo enforcement, maritime security, and humanitarian corridors.",
      "Coordinate with regional organizations such as the African Union and the League of Arab States to secure buy in for Council action.",
    ],
    agenda: [
      {
        title: "Securing Maritime Corridors in the Red Sea and Gulf of Aden",
        description:
          "Coordinate naval deconfliction, targeted sanctions, and humanitarian access to deter attacks on international shipping lanes.",
      },
    ],
    resources: [
      {
        title: "UN Security Council Resolution 2722 (2024)",
        description:
          "Mandates collective action to protect commercial vessels transiting the Red Sea amid escalating attacks.",
        link: "https://undocs.org/S/RES/2722(2024)",
      },
      {
        title: "IMO Djibouti Code of Conduct (Jeddah Amendment)",
        description:
          "Provides the regional counter-piracy framework for western Indian Ocean states coordinating maritime security operations.",
        link: "https://wwwcdn.imo.org/localresources/en/OurWork/Security/Documents/DCoC%20JA%202017.pdf",
      },
      {
        title: "OCHA Red Sea Situation Update Hub",
        description:
          "Consolidates humanitarian and security reporting on disruptions to Red Sea shipping lanes and affected coastal states.",
        link: "https://reports.unocha.org/en/country/yemen/",
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
  WHO: {
    name: "World Health Organization",
    council: "Specialized Agency",
    delegateCount: 32,
    format: "Double Delegation",
    summary: [
      "The World Health Organization committee examines how countries can build resilient health systems as climate shocks and zoonotic outbreaks grow more frequent.",
      "Delegates should integrate financing, supply chain, and surveillance perspectives to strengthen preparedness while narrowing equity gaps.",
    ],
    takeaways: [
      "Align proposals with the International Health Regulations core capacities and the Pandemic Accord negotiations.",
      "Detail strategies for scaling digital health tools, frontline workforce training, and supply chain redundancy.",
      "Prioritize equitable access to vaccines, diagnostics, and therapeutics for low and middle income countries.",
    ],
    agenda: [
      {
        title: "Building Climate-Resilient Primary Health Care Networks",
        description:
          "Scale frontline facilities, surveillance, and supply chains that can operate through extreme weather and emerging disease threats.",
      },
    ],
    resources: [
      {
        title: "WHO Operational Framework for Building Climate Resilient Health Systems",
        description:
          "Outlines actions ministries of health can take to climate-proof primary care, surveillance, and supply chains.",
        link: "https://apps.who.int/iris/handle/10665/329438",
      },
      {
        title: "WHO Guidance for Climate Resilient and Environmentally Sustainable Health Care Facilities",
        description:
          "Provides facility-level standards for climate-smart infrastructure, energy, and water systems.",
        link: "https://apps.who.int/iris/handle/10665/335751",
      },
      {
        title: "WHO Health Emergency Preparedness, Response and Resilience Global Report 2023",
        description:
          "Tracks HEPR capacities that support resilient community health services before, during, and after shocks.",
        link: "https://www.who.int/publications/m/item/health-emergency-preparedness-response-and-resilience-global-report-2023",
      },
    ],
    countries: [
      "Afghanistan",
      "Australia",
      "Bangladesh",
      "Bolivia",
      "Canada",
      "France",
      "Germany",
      "Haiti",
      "India",
      "Indonesia",
      "Iran",
      "Japan",
      "Myanmar",
      "Nepal",
      "Netherlands",
      "Norway",
      "Pakistan",
      "South Korea",
      "Switzerland",
      "Thailand",
      "United Kingdom",
      "United States of America",
    ],
  },
  UNHRC: {
    name: "UN Human Rights Council",
    council: "Subsidiary Body of the General Assembly",
    delegateCount: 47,
    format: "Single Delegation",
    summary: [
      "The Human Rights Council addresses emerging patterns of repression, digital surveillance, and environmental displacement through country specific and thematic mandates.",
      "Delegates must balance state security narratives with the universality of rights while designing monitoring mechanisms that deliver accountability.",
    ],
    takeaways: [
      "Cite treaty body recommendations, Universal Periodic Review outcomes, and regional jurisprudence to evidence claims.",
      "Design independent monitoring or fact finding mandates with feasible timelines, reporting channels, and protection measures for witnesses.",
      "Center the voices of human rights defenders, journalists, Indigenous peoples, and other at risk groups during debate.",
    ],
    agenda: [
      {
        title: "Protecting Climate-Displaced Communities through Human Rights Mechanisms",
        description:
          "Leverage UN mandates to safeguard the rights of people relocating because of climate impacts, including access to justice, housing, and remedy.",
      },
    ],
    resources: [
      {
        title: "OHCHR Fact Sheet on Human Rights and Climate Change",
        description:
          "Summarizes state obligations to respect, protect, and fulfill human rights when addressing climate-related displacement.",
        link: "https://www.ohchr.org/en/resources/educators/human-rights-education-training/fact-sheet-series/fact-sheet-no-36-human-rights-and-climate-change",
      },
      {
        title: "UNHCR Climate Change and Disasters Portal",
        description:
          "Provides guidance on protecting people displaced across borders by disasters and climate impacts.",
        link: "https://www.unhcr.org/climate-change-and-disasters",
      },
      {
        title: "UNFCCC Task Force on Displacement Recommendations",
        description:
          "Offers policy measures under the Warsaw International Mechanism to address climate-related displacement and human mobility.",
        link: "https://unfccc.int/topics/adaptation-and-resilience/workstreams/loss-and-damage-related-to-climate-change-impacts/task-force-on-displacement",
      },
    ],
    countries: [
      "Australia",
      "Bangladesh",
      "Brazil",
      "Canada",
      "Colombia",
      "Egypt",
      "Findland",
      "France",
      "Germany",
      "Greece",
      "Italy",
      "Japan",
      "Jordan",
      "Lebanon",
      "Mexico",
      "Netherlands",
      "Nigeria",
      "Norway",
      "Pakistan",
      "Sweden",
      "Switzerland",
      "United Kingdom",
      "United States of America",
    ],
  },
  UNODC: {
    name: "UN Office on Drugs and Crime",
    council: "United Nations Secretariat Programme",
    delegateCount: 28,
    format: "Single Delegation",
    summary: [
      "The UN Office on Drugs and Crime confronts synthetic drug proliferation, cyber enabled money laundering, and trafficking networks that exploit vulnerable populations.",
      "Delegates are expected to integrate law enforcement cooperation, capacity building, and community based prevention to reduce harm.",
    ],
    takeaways: [
      "Map the entire illicit ecosystem from precursor chemicals to digital payment channels before proposing enforcement tools.",
      "Pair interdiction with harm reduction, victim support, and reintegration services that address root causes.",
      "Leverage regional conventions such as the Palermo Convention and coordinate intelligence sharing task forces.",
    ],
    agenda: [
      {
        title: "Disrupting Synthetic Drug Supply Chains",
        description:
          "Coordinate precursor monitoring, financial intelligence, and community partnerships to reduce the availability of synthetic narcotics.",
      },
    ],
    resources: [
      {
        title: "UNODC World Drug Report 2024",
        description:
          "Provides global evidence on synthetic drug production, trafficking routes, and enforcement gaps.",
        link: "https://www.unodc.org/unodc/en/data-and-analysis/wdr.html",
      },
      {
        title: "INCB Precursors and Chemicals Report",
        description:
          "Tracks the chemicals most frequently diverted into illicit manufacture, supporting targeted precursor control measures.",
        link: "https://www.incb.org/incb/en/precursors/technical_reports.html",
      },
      {
        title: "UN Convention against Illicit Traffic in Narcotic Drugs and Psychotropic Substances (1988)",
        description:
          "Establishes the international legal framework for cooperation on precursor controls, mutual legal assistance, and asset forfeiture.",
        link: "https://www.unodc.org/pdf/convention_1988_en.pdf",
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
  UNEP: {
    name: "UN Environment Programme",
    council: "United Nations Environment Programme",
    delegateCount: 36,
    format: "Double Delegation",
    summary: [
      "The UN Environment Programme advances science based action on climate mitigation, adaptation, and pollution control to deliver the COP28 outcomes.",
      "Delegates must align national contributions with finance mechanisms that protect frontline communities and accelerate the transition to net zero economies.",
    ],
    takeaways: [
      "Incorporate the latest Emissions Gap metrics and nationally determined contribution updates when setting ambition.",
      "Identify innovative finance tools such as debt for nature swaps, blended finance, and green bonds to scale implementation.",
      "Prioritize nature based solutions and Indigenous stewardship to deliver co benefits for biodiversity and resilience.",
    ],
    agenda: [
      {
        title: "Negotiating a Global Treaty to End Plastic Pollution",
        description:
          "Advance binding measures on production, product design, and waste management to curb plastic leakage while supporting just transitions.",
      },
    ],
    resources: [
      {
        title: "UNEP INC on Plastic Pollution Negotiations Portal",
        description:
          "Hosts official mandates, meeting reports, and technical papers guiding the plastics treaty negotiations.",
        link: "https://www.unep.org/inc-plastic-pollution",
      },
      {
        title: "UNEA Resolution 5/14: End Plastic Pollution",
        description:
          "Establishes the negotiating framework and timeline for a legally binding instrument to end plastic pollution.",
        link: "https://wedocs.unep.org/bitstream/handle/20.500.11822/39825/K2200677.pdf",
      },
      {
        title: "UNEP Turning off the Tap Report",
        description:
          "Details systems-change pathways and policy levers to reduce plastic pollution in line with treaty objectives.",
        link: "https://www.unep.org/resources/report/turning-tide-negotiations-new-plastic-pollution-treaty",
      },
    ],
    countries: [
      "Australia",
      "Brazil",
      "Canada",
      "Chile",
      "China",
      "Egypt",
      "Ethiopia",
      "France",
      "Germany",
      "India",
      "Indonesia",
      "Japan",
      "Mexico",
      "New Zealand",
      "Norway",
      "Russia",
      "South Africa",
      "Sweden",
      "Switzerland",
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
  countries.forEach((country) => {
    const badge = document.createElement("span");
    badge.className = "country-tag";
    badge.textContent = country;
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

  renderSummary(elements.summary, data.summary);
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
