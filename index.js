const JIKAN_BASE = "https://api.jikan.moe/v4";
const HIANIME_BASE = "#";
const MANGA_BASE = "#";

function buildCard(anime, index = 0) {
  const title = anime.title || "Unknown";
  const score = anime.score ? `★ ${anime.score}` : "";
  const episodes = anime.episodes ? `${anime.episodes} eps` : anime.type || "";
  const img =
    anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || "";
  const malId = anime.mal_id;

  return `
    <div class="anime-card" style="animation-delay:${index * 0.04}s" onclick="goWatch(${malId})">
      <img class="anime-card-img" src="${img}" alt="${title}" loading="lazy"
           onerror="this.src='https://placehold.co/300x420/1a1a26/888?text=No+Image'"/>
      ${score ? `<div class="anime-card-score">${score}</div>` : ""}
      <div class="anime-card-play">▶</div>
      <div class="anime-card-overlay">
        <div class="anime-card-title">${title}</div>
        ${episodes ? `<div class="anime-card-meta">${episodes}</div>` : ""}
      </div>
    </div>
  `;
}

function goWatch(malId, ep = 1) {
  window.location.href = `watch.html?id=${malId}&ep=${ep}`;
}

function goManga(mangaId) {
  window.location.href = `manga.html?id=${encodeURIComponent(mangaId)}`;
}

async function loadSection(url, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  try {
    const res = await fetch(url);
    const data = await res.json();
    container.innerHTML = "";
    data.data.forEach((anime, i) => {
      container.insertAdjacentHTML("beforeend", buildCard(anime, i));
    });
  } catch (e) {
    if (container)
      container.innerHTML =
        '<p style="color:var(--muted);font-size:14px">Failed to load.</p>';
  }
}

const HiAnime = {
  async search(query, page = 1) {
    const url = `${HIANIME_BASE}/api/v2/hianime/search?q=${encodeURIComponent(query)}&page=${page}`;
    const res = await fetch(url);
    const json = await res.json();
    if (!json.success) throw new Error("HiAnime search failed");
    return json.data;
  },

  async getInfo(animeId) {
    const url = `${HIANIME_BASE}/api/v2/hianime/anime/${encodeURIComponent(animeId)}`;
    const res = await fetch(url);
    const json = await res.json();
    if (!json.success)
      throw new Error(`HiAnime getInfo failed for "${animeId}"`);
    return json.data;
  },

  async getEpisodes(animeId) {
    const url = `${HIANIME_BASE}/api/v2/hianime/anime/${encodeURIComponent(animeId)}/episodes`;
    const res = await fetch(url);
    const json = await res.json();
    if (!json.success)
      throw new Error(`HiAnime getEpisodes failed for "${animeId}"`);
    return json.data;
  },

  async getSources(episodeId, server = "hd-1", category = "sub") {
    const params = new URLSearchParams({
      animeEpisodeId: episodeId,
      server,
      category,
    });
    const url = `${HIANIME_BASE}/api/v2/hianime/episode/sources?${params}`;
    const res = await fetch(url);
    const json = await res.json();
    if (!json.success)
      throw new Error(`HiAnime getSources failed for "${episodeId}"`);
    return json.data;
  },

  async getHome() {
    const res = await fetch(`${HIANIME_BASE}/api/v2/hianime/home`);
    const json = await res.json();
    if (!json.success) throw new Error("HiAnime getHome failed");
    return json.data;
  },

  buildCard(anime, index = 0) {
    const title = anime.name || "Unknown";
    const img = anime.poster || "";
    const sub = anime.episodes?.sub ?? "";
    const dub = anime.episodes?.dub ?? "";
    const badge = sub ? `SUB ${sub}` : "";

    return `
      <div class="anime-card" style="animation-delay:${index * 0.04}s"
           onclick="window.location.href='watch.html?hiid=${encodeURIComponent(anime.id)}&ep=1'">
        <img class="anime-card-img" src="${img}" alt="${title}" loading="lazy"
             onerror="this.src='https://placehold.co/300x420/1a1a26/888?text=No+Image'"/>
        ${badge ? `<div class="anime-card-score">${badge}</div>` : ""}
        <div class="anime-card-play">▶</div>
        <div class="anime-card-overlay">
          <div class="anime-card-title">${title}</div>
          ${dub ? `<div class="anime-card-meta">DUB ${dub}</div>` : ""}
        </div>
      </div>
    `;
  },
};

const MangaHook = {
  async getList(page = 1, type = "newest", state = "", category = "all") {
    const params = new URLSearchParams({ page, type, state, category });
    const res = await fetch(`${MANGA_BASE}/api/mangaList?${params}`);
    const data = await res.json();
    return data;
  },

  async getManga(mangaId) {
    const res = await fetch(
      `${MANGA_BASE}/api/mangaList/${encodeURIComponent(mangaId)}`,
    );
    const data = await res.json();
    return data;
  },

  async getChapter(mangaId, chapterId) {
    const res = await fetch(
      `${MANGA_BASE}/api/mangaList/${encodeURIComponent(mangaId)}/${encodeURIComponent(chapterId)}`,
    );
    const data = await res.json();
    return data;
  },

  async search(query, page = 1) {
    const res = await fetch(
      `${MANGA_BASE}/api/search/${encodeURIComponent(query)}?page=${page}`,
    );
    const data = await res.json();
    return data;
  },

  buildCard(manga, index = 0) {
    const title = manga.title || "Unknown";
    const img = manga.image || "";
    const chapter = manga.chapter || "";
    const views = manga.view ? `👁 ${manga.view}` : "";

    return `
      <div class="manga-card" style="animation-delay:${index * 0.04}s"
           onclick="goManga('${manga.id}')">
        <img class="manga-card-img" src="${img}" alt="${title}" loading="lazy"
             onerror="this.src='https://placehold.co/300x420/1a1a26/888?text=No+Image'"/>
        <div class="manga-card-overlay">
          <div class="manga-card-title">${title}</div>
          ${chapter ? `<div class="manga-card-meta">${chapter.replace(/-/g, " ")}</div>` : ""}
          ${views ? `<div class="manga-card-views">${views}</div>` : ""}
        </div>
      </div>
    `;
  },
};

function navSearchGo(e) {
  if (e.key !== "Enter") return;
  const val = document.getElementById("navSearch")?.value?.trim();
  if (val) window.location.href = `search.html?q=${encodeURIComponent(val)}`;
}

function toggleMenu() {
  document.getElementById("mobileMenu")?.classList.toggle("open");
}

let _toastTimer;
function showToast(msg, duration = 2500) {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => t.classList.remove("show"), duration);
}

document.addEventListener("click", (e) => {
  const menu = document.getElementById("mobileMenu");
  const ham = document.querySelector(".hamburger");
  if (
    menu?.classList.contains("open") &&
    !menu.contains(e.target) &&
    !ham?.contains(e.target)
  ) {
    menu.classList.remove("open");
  }
});

if (typeof module !== "undefined") {
  module.exports = {
    HiAnime,
    MangaHook,
    buildCard,
    goWatch,
    goManga,
    loadSection,
    showToast,
  };
}
