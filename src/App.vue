<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";

const modes = [
  { id: "unsafe", title: "Neošetrené", description: "Vstup sa vloží priamo do SQL dotazu.", label: "Raw SQL", number: "01" },
  { id: "safe", title: "Ošetrené", description: "SQL dotaz používa viazaný parameter.", label: "Parametrizovaný SQL", number: "02" },
  { id: "prisma", title: "ORM", description: "Vyhľadávanie cez Prisma ORM.", label: "Prisma", number: "03" },
];
const page = ref(window.location.hash.slice(1));
const mode = computed(() => modes.find((item) => item.id === page.value));
const name = ref("Notebook");
const products = ref<{ id: number; name: string }[]>([]);
const searched = ref(false);
const loading = ref(false);
const error = ref("");
const examples = [
  { title: "Všetky produkty", code: "' OR 1=1 --", description: "V neošetrenom režime vráti všetky produkty." },
  { title: "Štruktúra databázy", code: "' UNION SELECT rowid, sql FROM sqlite_schema WHERE type = 'table' --", description: "Zobrazí definície tabuliek databázy." },
  { title: "Upraviť produkt", code: "'; UPDATE Product SET name = 'Zmenený produkt' WHERE id = 1; --", description: "Premenuje produkt s ID 1 na Zmenený produkt." },
  { title: "Zmazať obsah", code: "'; DELETE FROM Product; --", description: "Zmaže všetky produkty, tabuľka zostane zachovaná." },
  { title: "Zmazať databázu a zhodiť server", code: "'; DROP TABLE Product; --", description: "Odstráni tabuľku produktov a v neošetrenom režime spôsobí zmazanie databázy a vypnutie servera." },
];

function changePage() {
  page.value = window.location.hash.slice(1);
  name.value = "Notebook";
  products.value = [];
  searched.value = false;
  error.value = "";
}

onMounted(() => window.addEventListener("hashchange", changePage));
onUnmounted(() => window.removeEventListener("hashchange", changePage));

async function search() {
  if (!mode.value) return;
  const currentPage = page.value;
  loading.value = true;
  error.value = "";
  searched.value = false;
  products.value = [];
  try {
    const response = await fetch(`/api/products/${mode.value.id}?${new URLSearchParams({ name: name.value })}`);
    if (currentPage !== page.value) return;
    if (!response.ok) {
      error.value = "Dotaz sa nepodarilo vykonať.";
      return;
    }
    const result = await response.json();
    if (currentPage !== page.value) return;
    products.value = result;
    searched.value = true;
  } catch {
    error.value = "Server neodpovedá.";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <main v-if="!mode" class="chooser" aria-label="Vyber spôsob spracovania SQL">
    <a v-for="item in modes" :key="item.id" :href="`#${item.id}`" class="third" :class="item.id">
      <span class="eyebrow">SQL injection lab <span>{{ item.number }}</span></span>
      <div class="choice-copy">
        <p class="label">{{ item.label }}</p>
        <h1>{{ item.title }}</h1>
        <p>{{ item.description }}</p>
      </div>
      <span class="open">Otvoriť formulár <span aria-hidden="true">↗</span></span>
    </a>
  </main>

  <main v-else class="experiment" :class="mode.id">
    <header>
      <a href="#" class="back">← Všetky režimy</a>
      <span class="eyebrow">SQL injection lab / {{ mode.number }}</span>
    </header>
    <div class="workspace">
      <p class="label">{{ mode.label }}</p>
      <h1>{{ mode.title }}</h1>
      <p class="intro">{{ mode.description }} Vyhľadaj produkt podľa presného názvu a porovnaj výsledok s útokom.</p>
      <form @submit.prevent="search">
        <label for="product-name">Názov produktu</label>
        <input id="product-name" v-model="name" type="text" autocomplete="off" spellcheck="false" :disabled="loading" />
        <div class="actions">
          <button class="submit" type="submit" :disabled="loading">{{ loading ? "Vyhľadávam…" : "Vyhľadať" }}</button>
        </div>
      </form>
      <p class="hint">Testovacie produkty: Notebook, Monitor, Klávesnica.</p>
      <section class="examples" aria-labelledby="examples-title">
        <h2 id="examples-title">Ukážkové vstupy</h2>
        <p>V ošetrenom režime a ORM sa vstupy spracujú ako názov produktu a nezmenia databázu. Kliknutie iba vyplní formulár.</p>
        <div v-for="example in examples" :key="example.title" class="example">
          <button type="button" :disabled="loading" @click="name = example.code">{{ example.title }}</button>
          <code>{{ example.code }}</code>
          <p>{{ example.description }}</p>
        </div>
      </section>
      <section class="results" aria-live="polite" :aria-busy="loading">
        <p v-if="error" role="alert">{{ error }}</p>
        <template v-else-if="searched">
          <h2>Výsledky <span>{{ products.length }}</span></h2>
          <table v-if="products.length">
            <thead><tr><th scope="col">ID</th><th scope="col">Produkt</th></tr></thead>
            <tbody><tr v-for="product in products" :key="product.id"><td>{{ product.id }}</td><td>{{ product.name }}</td></tr></tbody>
          </table>
          <p v-else>Žiadny produkt nezodpovedá zadanému názvu.</p>
        </template>
        <p v-else>Výsledok dotazu sa zobrazí tu.</p>
      </section>
    </div>
  </main>
</template>

<style>
:root {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  color: oklch(24% 0.025 250);
  background: oklch(97% 0.008 85);
  font-synthesis: none;
}
* { box-sizing: border-box; }
body { margin: 0; }
button, input { font: inherit; }
a { color: inherit; }
.unsafe { --surface: oklch(88% 0.085 35); }
.safe { --surface: oklch(90% 0.065 155); }
.prisma { --surface: oklch(89% 0.06 255); }
.chooser { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); min-height: 100svh; }
.third {
  background: var(--surface);
  padding: 36px 32px;
  text-decoration: none;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: filter 180ms ease-out;
}
.third:hover { filter: brightness(0.97); }
.eyebrow { display: flex; justify-content: space-between; gap: 20px; font-size: 0.75rem; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; }
.choice-copy { margin: 60px 0; }
.label { font-size: 0.85rem; font-weight: 600; margin: 0 0 14px; }
h1 { font-size: 3rem; letter-spacing: -0.045em; line-height: 1.1; margin: 0 0 22px; }
.choice-copy > p:last-child { max-width: 28ch; font-size: 1rem; line-height: 1.6; }
.open { display: flex; justify-content: space-between; align-items: center; padding-top: 20px; border-top: 1px solid oklch(24% 0.025 250 / 0.25); font-weight: 600; }
.open span { font-size: 1.5rem; }
.experiment { min-height: 100svh; background: var(--surface); padding: 32px 40px 64px; }
header { display: flex; justify-content: space-between; align-items: center; gap: 24px; }
.back { text-decoration: none; font-size: 0.9rem; font-weight: 600; }
.back:hover { text-decoration: underline; }
.workspace { max-width: 640px; margin: 80px auto 0; }
.intro { line-height: 1.65; max-width: 60ch; margin-bottom: 36px; }
form label { display: block; font-size: 0.9rem; font-weight: 600; margin-bottom: 10px; }
input { width: 100%; padding: 15px 16px; color: inherit; background: oklch(98% 0.006 85); border: 1px solid oklch(24% 0.025 250 / 0.4); border-radius: 6px; }
.actions { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 16px; }
button { cursor: pointer; padding: 12px 18px; border: 1px solid oklch(24% 0.025 250 / 0.4); background: transparent; color: inherit; border-radius: 6px; transition: background 180ms ease-out; }
button:hover { background: oklch(24% 0.025 250 / 0.08); }
button.submit { background: oklch(24% 0.025 250); color: oklch(98% 0.006 85); border-color: transparent; }
button.submit:hover { background: oklch(32% 0.025 250); }
button:disabled { opacity: 0.6; cursor: wait; }
a:focus-visible, button:focus-visible, input:focus-visible { outline: 3px solid oklch(36% 0.12 260); outline-offset: 4px; }
.hint { font-size: 0.8rem; line-height: 1.6; margin: 20px 0 36px; }
.examples { margin-bottom: 36px; }
.examples h2 { font-size: 1.2rem; }
.examples p { font-size: 0.85rem; line-height: 1.6; }
.example { padding: 16px 0; border-top: 1px solid oklch(24% 0.025 250 / 0.15); }
.example code { display: block; margin-top: 12px; overflow-wrap: anywhere; font-size: 0.85rem; line-height: 1.6; }
.example p { margin-bottom: 0; }
.results { border-top: 1px solid oklch(24% 0.025 250 / 0.25); padding-top: 24px; line-height: 1.6; }
.results h2 { font-size: 1.2rem; margin: 0 0 16px; }
.results h2 span { font-size: 0.85rem; margin-left: 8px; font-weight: 400; }
table { width: 100%; border-collapse: collapse; text-align: left; }
th, td { padding: 12px 0; border-bottom: 1px solid oklch(24% 0.025 250 / 0.15); }
th:first-child { width: 80px; }
@media (max-width: 900px) { .third { padding: 28px 20px; } h1 { font-size: 2.3rem; } }
@media (max-width: 600px) {
  .chooser { grid-template-columns: 1fr; }
  .third { min-height: 33.33svh; padding: 24px; }
  .choice-copy { margin: 28px 0 16px; }
  h1 { font-size: 2.1rem; margin-bottom: 12px; }
  .choice-copy > p:last-child { margin-bottom: 0; max-width: none; }
  .experiment { padding: 24px 20px 48px; }
  header { align-items: flex-start; }
  header .eyebrow { max-width: 140px; text-align: right; }
  .workspace { margin-top: 48px; }
}
@media (prefers-reduced-motion: reduce) { * { transition: none !important; } }
</style>
