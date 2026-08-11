(function () {
  const rail = document.getElementById("timeline-rail");
  const content = document.getElementById("content");

  // ----- 연도 타임라인 렌더링 -----
  WIKI_DATA.forEach((yearBlock) => {
    const sectionId = `y-${yearBlock.year}`;

    // rail button
    const btn = document.createElement("button");
    btn.className = "rail-year";
    btn.textContent = yearBlock.year;
    btn.dataset.target = sectionId;
    btn.addEventListener("click", () => {
      document.getElementById(sectionId).scrollIntoView({ behavior: "smooth", block: "start" });
    });
    rail.appendChild(btn);

    // section
    const section = document.createElement("section");
    section.className = "year-section";
    section.id = sectionId;

    const heading = document.createElement("div");
    heading.className = "year-heading";
    heading.innerHTML = `<span class="num">${yearBlock.year}</span><span class="label">${yearBlock.groups.reduce((n, g) => n + g.items.length, 0)}건</span>`;
    section.appendChild(heading);

    yearBlock.groups.forEach((group) => {
      const groupEl = document.createElement("div");
      groupEl.className = "group";

      const title = document.createElement("h3");
      title.className = "group-title";
      title.textContent = group.group;
      groupEl.appendChild(title);

      const list = document.createElement("ul");
      list.className = "item-list";

      group.items.forEach((item) => {
        const li = document.createElement("li");
        li.className = "item";
        const a = document.createElement("a");
        a.href = item.url;
        a.target = "_blank";
        a.rel = "noopener";
        a.textContent = item.title;
        li.appendChild(a);
        if (item.note) {
          const note = document.createElement("span");
          note.className = "note";
          note.textContent = item.note;
          li.appendChild(note);
        }
        list.appendChild(li);
      });

      groupEl.appendChild(list);
      section.appendChild(groupEl);
    });

    content.appendChild(section);
  });

  // ----- 하단 기타 섹션 렌더링 -----
  const extraWrap = document.createElement("div");
  extraWrap.className = "extra";
  extraWrap.innerHTML = `<h2>그 밖의 교실 · 답사 · 학과 자료</h2>`;

  const grid = document.createElement("div");
  grid.className = "extra-grid";

  EXTRA_SECTIONS.forEach((block) => {
    const blockEl = document.createElement("div");
    blockEl.className = "extra-block";

    const h3 = document.createElement("h3");
    h3.textContent = block.title;
    blockEl.appendChild(h3);

    const ul = document.createElement("ul");
    block.items.forEach((item) => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = item.url;
      a.target = "_blank";
      a.rel = "noopener";
      a.textContent = item.title;
      li.appendChild(a);
      if (item.note) {
        const note = document.createElement("span");
        note.className = "note";
        note.textContent = " — " + item.note;
        li.appendChild(note);
      }
      ul.appendChild(li);
    });
    blockEl.appendChild(ul);
    grid.appendChild(blockEl);
  });

  extraWrap.appendChild(grid);
  content.appendChild(extraWrap);

  // ----- 스크롤에 따른 활성 연도 표시 -----
  const railButtons = Array.from(rail.querySelectorAll(".rail-year"));
  const sections = Array.from(document.querySelectorAll(".year-section"));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          railButtons.forEach((b) => b.classList.toggle("active", b.dataset.target === id));
        }
      });
    },
    { rootMargin: "-15% 0px -70% 0px", threshold: 0 }
  );

  sections.forEach((s) => observer.observe(s));
  if (railButtons.length) railButtons[0].classList.add("active");
})();
