const TYPE_LABELS = {
  nonverbal: "Nonverbal Patterns",
  verbal: "Verbal Reasoning",
  quant: "Quantitative Reasoning",
  memory: "Working Memory"
};

const FOCUS_PACKS = {
  pack1: {
    id: "pack1",
    name: "Pack 1 - Balanced Warmup",
    total: 30,
    targetPct: 75,
    mix: { nonverbal: 10, verbal: 10, quant: 6, memory: 4 }
  },
  pack2: {
    id: "pack2",
    name: "Pack 2 - Verbal + Nonverbal",
    total: 30,
    targetPct: 78,
    mix: { nonverbal: 12, verbal: 12, quant: 4, memory: 2 }
  },
  pack3: {
    id: "pack3",
    name: "Pack 3 - Nonverbal Intensive",
    total: 30,
    targetPct: 80,
    mix: { nonverbal: 16, verbal: 8, quant: 4, memory: 2 }
  },
  pack4: {
    id: "pack4",
    name: "Pack 4 - Verbal Intensive",
    total: 30,
    targetPct: 80,
    mix: { nonverbal: 8, verbal: 16, quant: 4, memory: 2 }
  },
  pack5: {
    id: "pack5",
    name: "Pack 5 - Final Simulation",
    total: 36,
    targetPct: 82,
    mix: { nonverbal: 12, verbal: 12, quant: 8, memory: 4 }
  }
};

const SOCCER_LINES = [
  "⚽ Calm touch, smart pass, great answer.",
  "🏆 Think like a Champions League playmaker.",
  "🥇 One question at a time, champion focus.",
  "⚽ Messi vision: read the pattern before you move.",
  "⚽ Ronaldo mindset: discipline every question.",
  "⚽ Mbappe speed, but always check the answer first.",
  "🔵🔴 PSG energy: confident and composed.",
  "🏟️ Big match brain: stay calm under pressure.",
  "🥅 Goal time: solve, verify, then click.",
  "🏅 Champions earn points with patience."
];

const el = {
  lockScreen: document.getElementById("lockScreen"),
  pinInput: document.getElementById("pinInput"),
  pinMessage: document.getElementById("pinMessage"),
  unlockBtn: document.getElementById("unlockBtn"),
  startSessionBtn: document.getElementById("startSessionBtn"),
  resetStatsBtn: document.getElementById("resetStatsBtn"),
  pinSettingsBtn: document.getElementById("pinSettingsBtn"),
  modeSelect: document.getElementById("modeSelect"),
  focusPackRow: document.getElementById("focusPackRow"),
  focusPackSelect: document.getElementById("focusPackSelect"),
  questionCount: document.getElementById("questionCount"),
  questionCountRow: document.getElementById("questionCountRow"),
  typeFieldset: document.getElementById("typeFieldset"),
  configCard: document.getElementById("configCard"),
  gameCard: document.getElementById("gameCard"),
  summaryCard: document.getElementById("summaryCard"),
  progressText: document.getElementById("progressText"),
  scoreText: document.getElementById("scoreText"),
  soccerBanner: document.getElementById("soccerBanner"),
  typePill: document.getElementById("typePill"),
  questionPrompt: document.getElementById("questionPrompt"),
  choices: document.getElementById("choices"),
  feedback: document.getElementById("feedback"),
  nextBtn: document.getElementById("nextBtn"),
  sessionSummary: document.getElementById("sessionSummary"),
  readinessSummary: document.getElementById("readinessSummary"),
  byTypeSummary: document.getElementById("byTypeSummary"),
  playAgainBtn: document.getElementById("playAgainBtn"),
  lifetimeStats: document.getElementById("lifetimeStats")
};

const state = {
  session: [],
  idx: 0,
  score: 0,
  answered: false,
  perType: {},
  currentPack: null
};

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle(arr) {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function uniqueWrongOptions(correct, pool, count = 3) {
  const wrong = new Set();
  while (wrong.size < count) {
    const candidate = pick(pool);
    if (candidate !== correct) wrong.add(candidate);
  }
  return shuffle([correct, ...wrong]);
}

function createQuestion(type, prompt, correct, options, explain) {
  return { type, prompt, correct, options, explain };
}

function toHex(buffer) {
  return Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function sha256(text) {
  const data = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return toHex(hash);
}

function validPin(pin) {
  return typeof pin === "string" && pin.length >= 4 && pin.length <= 12;
}

async function savePin(pin) {
  const hash = await sha256(pin);
  localStorage.setItem("leonGiftedPinHash", hash);
}

async function verifyPin(pin) {
  const stored = localStorage.getItem("leonGiftedPinHash");
  if (!stored) return false;
  return (await sha256(pin)) === stored;
}

async function ensurePinExists() {
  const existing = localStorage.getItem("leonGiftedPinHash");
  if (existing) return true;
  const pin = prompt("Parent setup: create a PIN (4-12 characters).");
  if (!validPin(pin)) {
    alert("PIN not set. Reload and enter a valid PIN (4-12 characters).");
    return false;
  }
  await savePin(pin);
  return true;
}

function lockApp() {
  el.lockScreen.classList.remove("hidden");
  document.querySelector(".app").classList.add("hidden");
  el.pinInput.value = "";
  el.pinMessage.textContent = "";
}

function unlockApp() {
  el.lockScreen.classList.add("hidden");
  document.querySelector(".app").classList.remove("hidden");
}

function genVerbalQuestions() {
  const q = [];

  const analogies = [
    ["puppy", "dog", "kitten", "cat"],
    ["calf", "cow", "foal", "horse"],
    ["author", "book", "artist", "painting"],
    ["bird", "nest", "bee", "hive"],
    ["chef", "kitchen", "teacher", "classroom"],
    ["pilot", "airplane", "captain", "ship"],
    ["finger", "hand", "toe", "foot"],
    ["leaf", "tree", "petal", "flower"],
    ["winter", "cold", "summer", "hot"],
    ["key", "lock", "password", "account"],
    ["eye", "see", "ear", "hear"],
    ["baker", "bread", "farmer", "crop"],
    ["clock", "time", "thermometer", "temperature"],
    ["lion", "roar", "snake", "hiss"],
    ["doctor", "hospital", "chef", "restaurant"]
  ];

  analogies.forEach(([a, b, c, answer]) => {
    const prompt = `${a} is to ${b} as ${c} is to ...`;
    const pool = ["cat", "horse", "hive", "classroom", "ship", "garden", "tree", "house", "painting", "foot", "flower", "hot", "account", "hear", "crop", "temperature", "hiss", "restaurant"];
    q.push(createQuestion("verbal", prompt, answer, uniqueWrongOptions(answer, pool), "Both pairs share the same relationship."));
  });

  const categoryOdd = [
    ["apple", "banana", "orange", "carrot", "carrot", "Carrot is a vegetable; others are fruits."],
    ["triangle", "square", "circle", "table", "table", "Table is furniture; others are shapes."],
    ["red", "blue", "green", "happy", "happy", "Happy is a feeling; others are colors."],
    ["whisper", "talk", "shout", "chair", "chair", "Chair is an object; others are ways to speak."],
    ["piano", "drum", "flute", "window", "window", "Window is not a musical instrument."],
    ["soccer", "basketball", "tennis", "blanket", "blanket", "Blanket is not a sport."],
    ["January", "March", "July", "Monday", "Monday", "Monday is a day, others are months."],
    ["teacher", "doctor", "nurse", "hammer", "hammer", "Hammer is a tool, others are jobs."],
    ["run", "jump", "swim", "purple", "purple", "Purple is a color, others are actions."],
    ["fork", "spoon", "plate", "elephant", "elephant", "Elephant is an animal; others are kitchen items."]
  ];

  categoryOdd.forEach(([a, b, c, d, answer, explain]) => {
    q.push(createQuestion("verbal", `Which word does NOT belong? ${a}, ${b}, ${c}, ${d}`, answer, shuffle([a, b, c, d]), explain));
  });

  const vocab = [
    ["tiny", "small", ["small", "loud", "early", "cold"]],
    ["rapid", "fast", ["slow", "fast", "wide", "quiet"]],
    ["enormous", "very big", ["very big", "very old", "very short", "very wet"]],
    ["silent", "quiet", ["quiet", "bright", "hungry", "bumpy"]],
    ["begin", "start", ["start", "finish", "drop", "bend"]],
    ["close", "near", ["near", "late", "empty", "double"]],
    ["ancient", "very old", ["very old", "very loud", "very short", "very smooth"]],
    ["brave", "not afraid", ["not afraid", "very tired", "too cold", "very noisy"]],
    ["fragile", "easy to break", ["easy to break", "easy to lift", "easy to clean", "easy to fold"]],
    ["swift", "quick", ["quick", "quiet", "square", "sticky"]],
    ["assist", "help", ["help", "hide", "hurt", "hold"]],
    ["observe", "watch", ["watch", "draw", "build", "paint"]]
  ];

  vocab.forEach(([word, answer, opts]) => {
    q.push(createQuestion("verbal", `What does "${word}" mean?`, answer, shuffle(opts), `"${word}" and "${answer}" are close in meaning.`));
  });

  const sentenceMeaning = [
    ["Sam whispered because the baby was sleeping. Why did Sam whisper?", "To stay quiet", ["To stay quiet", "To be louder", "To run fast", "To open a door"]],
    ["Mia wore boots because it was raining. Why boots?", "To keep feet dry", ["To keep feet dry", "To swim", "To play piano", "To cook"]],
    ["The library was silent. What does silent mean here?", "Very quiet", ["Very quiet", "Very bright", "Very crowded", "Very hot"]],
    ["Leo studied every day and improved his score. Why did his score improve?", "Regular practice", ["Regular practice", "He slept less", "He forgot answers", "He skipped class"]],
    ["Nora carried an umbrella when clouds got dark. Why?", "It might rain", ["It might rain", "It might snow indoors", "It was bedtime", "She was hungry"]]
  ];

  sentenceMeaning.forEach(([prompt, answer, options]) => {
    q.push(createQuestion("verbal", prompt, answer, shuffle(options), "Use context clues from the sentence."));
  });

  return q;
}

function genQuantQuestions() {
  const q = [];

  for (let i = 0; i < 20; i += 1) {
    const a = 5 + Math.floor(Math.random() * 30);
    const b = 2 + Math.floor(Math.random() * 15);
    const useAdd = Math.random() > 0.4;
    const prompt = useAdd ? `${a} + ${b} = ?` : `${a} - ${Math.min(a - 1, b)} = ?`;
    const correctNum = useAdd ? a + b : a - Math.min(a - 1, b);
    const options = uniqueWrongOptions(String(correctNum), [
      String(correctNum + 1),
      String(correctNum - 1),
      String(correctNum + 2),
      String(correctNum - 2),
      String(correctNum + 3),
      String(correctNum - 3)
    ]);
    q.push(createQuestion("quant", prompt, String(correctNum), options, "Compute carefully and check your answer."));
  }

  const series = [
    ["2, 4, 6, 8, ?", "10"],
    ["5, 10, 15, 20, ?", "25"],
    ["1, 3, 5, 7, ?", "9"],
    ["30, 25, 20, 15, ?", "10"],
    ["3, 6, 12, 24, ?", "48"]
  ];

  series.forEach(([pattern, answer]) => {
    q.push(createQuestion("quant", `Find the next number: ${pattern}`, answer, uniqueWrongOptions(answer, ["8", "9", "10", "12", "15", "20", "25", "30", "40", "48", "50"]), "Look for the pattern between numbers."));
  });

  const wordProblems = [
    ["Leon has 12 stickers. He gives 4 away. How many are left?", "8"],
    ["There are 3 bags with 5 marbles each. How many marbles total?", "15"],
    ["A class has 18 students. 7 are girls. How many are boys?", "11"],
    ["You read 4 pages each day for 6 days. How many pages?", "24"]
  ];

  wordProblems.forEach(([prompt, answer]) => {
    q.push(createQuestion("quant", prompt, answer, uniqueWrongOptions(answer, ["6", "7", "8", "9", "10", "11", "12", "15", "18", "20", "24"]), "Translate words into a math operation."));
  });

  return q;
}

function genNonverbalQuestions() {
  const q = [];

  const shapeSeries = [
    ["Circle, Square, Circle, Square, ...", "Circle"],
    ["Triangle, Triangle, Square, Triangle, Triangle, Square, ...", "Triangle"],
    ["Star, Moon, Star, Moon, Star, ...", "Moon"],
    ["Red, Blue, Green, Red, Blue, Green, ...", "Red"],
    ["Big circle, small circle, big circle, small circle, ...", "Big circle"],
    ["A, B, A, B, A, ...", "B"],
    ["1 black dot, 2 black dots, 3 black dots, ...", "4 black dots"],
    ["Square, Pentagon, Hexagon, ...", "Heptagon"],
    ["Left, Right, Left, Right, ...", "Left"],
    ["Short line, long line, short line, long line, ...", "Short line"]
  ];

  shapeSeries.forEach(([pattern, answer]) => {
    q.push(createQuestion("nonverbal", `What comes next? ${pattern}`, answer, uniqueWrongOptions(answer, ["Circle", "Square", "Triangle", "Star", "Moon", "Red", "Blue", "Green", "Big circle", "small circle", "A", "B", "4 black dots", "5 black dots", "Heptagon", "Hexagon", "Left", "Right", "Short line", "Long line"]), "The sequence repeats or grows by a clear rule."));
  });

  const matrixText = [
    ["If triangle becomes square and square becomes circle, what does triangle become?", "square"],
    ["If A->1, B->2, C->3, what is D?", "4"],
    ["If one side has 2 dots, opposite side has 5 dots. Opposite of 2?", "5"],
    ["Pattern: 1 shape, then 2 shapes, then 3 shapes. Next group size?", "4"],
    ["A turn to the right (90°), then right, then right. Next turn result?", "Faces original direction"],
    ["A shape rotates 90° four times. Where does it end?", "Back to start"],
    ["If every black square becomes white, what happens to a white square?", "It becomes black"],
    ["Top row has 2 circles, next row has 3 circles, next has 4. Next row?", "5 circles"],
    ["Rule: add one side each step. Triangle -> Square -> Pentagon -> ?", "Hexagon"],
    ["Mirror image of letter b is closest to ...", "d"]
  ];

  matrixText.forEach(([prompt, answer]) => {
    q.push(createQuestion("nonverbal", prompt, answer, uniqueWrongOptions(answer, ["square", "triangle", "circle", "3", "4", "5", "6", "Faces original direction", "Faces left", "Back to start", "It becomes black", "It stays white", "5 circles", "Hexagon", "d", "b"]), "Track each change step by step."));
  });

  const compare = [
    ["Which has the MOST sides?", "Hexagon", ["Triangle", "Square", "Pentagon", "Hexagon"]],
    ["Which is a mirror pair?", "b and d", ["b and d", "b and p", "n and u", "a and e"]],
    ["Which is symmetrical?", "Butterfly", ["Butterfly", "Shoe", "Flag", "Cloud"]],
    ["Which object can be split into two matching halves?", "Heart", ["Heart", "Shoe", "Flag", "Leaf"]],
    ["Which one is rotated, not flipped?", "Arrow up -> Arrow right", ["Arrow up -> Arrow right", "b -> d", "p -> q", "left hand -> right hand"]],
    ["Which pattern is ABAB?", "Circle, square, circle, square", ["Circle, square, circle, square", "Circle, circle, square, square", "Square, circle, circle, circle", "Triangle, square, star, moon"]],
    ["Which set shows growth by +1 each step?", "1 dot, 2 dots, 3 dots, 4 dots", ["1 dot, 2 dots, 3 dots, 4 dots", "2, 4, 8, 16", "5, 4, 3, 2", "3, 3, 3, 3"]]
  ];

  compare.forEach(([prompt, answer, options]) => {
    q.push(createQuestion("nonverbal", prompt, answer, shuffle(options), "Use visual rules like symmetry, rotation, or pattern growth."));
  });

  return q;
}

function genMemoryQuestions() {
  const q = [];

  const sequences = [
    ["7 - 2 - 9", "7-2-9"],
    ["4 - 8 - 1 - 6", "4-8-1-6"],
    ["3 - 5 - 9 - 2", "3-5-9-2"],
    ["cat - sun - map", "cat-sun-map"],
    ["red - train - apple - 4", "red-train-apple-4"]
  ];

  sequences.forEach(([seq, answer]) => {
    const parts = answer.split("-");
    const wrong1 = shuffle(parts).join("-");
    const wrong2 = shuffle(parts).join("-");
    const wrong3 = shuffle(parts).join("-");
    q.push(createQuestion(
      "memory",
      `Remember this order: ${seq}. Which option matches exactly?`,
      answer,
      uniqueWrongOptions(answer, [wrong1, wrong2, wrong3, [...parts].reverse().join("-"), `${parts[0]}-${parts.slice(2).join("-")}-${parts[1]}`]),
      "Memory tasks require exact order, not just the same items."
    ));
  });

  const instructions = [
    ["Touch blue, then clap, then touch red.", "blue -> clap -> red"],
    ["Jump, spin, then sit.", "jump -> spin -> sit"],
    ["Say your name, tap table, then stand.", "say name -> tap table -> stand"],
    ["Point left, point right, then hands up.", "left -> right -> hands up"]
  ];

  instructions.forEach(([prompt, answer]) => {
    const chunks = answer.split(" -> ");
    q.push(createQuestion(
      "memory",
      `Follow the order: ${prompt} Which sequence is correct?`,
      answer,
      uniqueWrongOptions(answer, [
        `${chunks[1]} -> ${chunks[0]} -> ${chunks[2]}`,
        `${chunks[0]} -> ${chunks[2]} -> ${chunks[1]}`,
        `${chunks[2]} -> ${chunks[1]} -> ${chunks[0]}`,
        `${chunks[1]} -> ${chunks[2]} -> ${chunks[0]}`
      ]),
      "Listen for order words: first, next, last."
    ));
  });

  return q;
}

function buildBank() {
  return [
    ...genNonverbalQuestions(),
    ...genVerbalQuestions(),
    ...genQuantQuestions(),
    ...genMemoryQuestions()
  ];
}

function selectedTypes() {
  return Array.from(document.querySelectorAll("fieldset input[type='checkbox']:checked")).map((x) => x.value);
}

function renderStats() {
  const stats = JSON.parse(localStorage.getItem("leonGiftedStats") || "null");
  if (!stats || !stats.sessions) {
    el.lifetimeStats.textContent = "No sessions yet.";
    return;
  }
  const pct = stats.totalQuestions ? Math.round((100 * stats.correctAnswers) / stats.totalQuestions) : 0;
  el.lifetimeStats.textContent = `Sessions: ${stats.sessions} | Correct: ${stats.correctAnswers}/${stats.totalQuestions} (${pct}%)`;
}

function updateProgressUI() {
  el.progressText.textContent = `Question ${state.idx + 1} / ${state.session.length}`;
  el.scoreText.textContent = `Score: ${state.score}`;
}

function renderQuestion() {
  const q = state.session[state.idx];
  state.answered = false;
  el.feedback.textContent = "";
  el.feedback.className = "feedback";
  el.nextBtn.classList.add("hidden");

  updateProgressUI();
  el.typePill.textContent = TYPE_LABELS[q.type];
  el.soccerBanner.textContent = pick(SOCCER_LINES);
  el.questionPrompt.textContent = q.prompt;
  el.choices.innerHTML = "";

  q.options.forEach((choice) => {
    const btn = document.createElement("button");
    btn.className = "choice-btn";
    btn.textContent = choice;
    btn.addEventListener("click", () => answer(choice, btn));
    el.choices.appendChild(btn);
  });
}

function answer(choice, btn) {
  if (state.answered) return;
  state.answered = true;

  const q = state.session[state.idx];
  const all = Array.from(el.choices.querySelectorAll("button"));
  all.forEach((x) => { x.disabled = true; });

  if (choice === q.correct) {
    state.score += 1;
    state.perType[q.type].correct += 1;
    btn.classList.add("correct");
    el.feedback.textContent = `Correct. ${q.explain}`;
    el.feedback.classList.add("ok");
  } else {
    btn.classList.add("wrong");
    const correctBtn = all.find((x) => x.textContent === q.correct);
    if (correctBtn) correctBtn.classList.add("correct");
    el.feedback.textContent = `Not quite. Correct answer: ${q.correct}. ${q.explain}`;
    el.feedback.classList.add("bad");
  }

  updateProgressUI();
  el.nextBtn.classList.remove("hidden");
}

function buildPackSession(bank, pack) {
  let session = [];
  Object.entries(pack.mix).forEach(([type, count]) => {
    const bucket = shuffle(bank.filter((q) => q.type === type)).slice(0, count);
    session = session.concat(bucket);
  });

  if (session.length < pack.total) {
    const used = new Set(session.map((q) => `${q.type}|${q.prompt}`));
    const filler = shuffle(bank.filter((q) => !used.has(`${q.type}|${q.prompt}`))).slice(0, pack.total - session.length);
    session = session.concat(filler);
  }

  return shuffle(session).slice(0, pack.total);
}

function focusReadinessMessage(score, total, pack) {
  const pct = Math.round((100 * score) / total);
  if (pct >= pack.targetPct + 8) {
    return `🏆 Practice estimate: very strong for gifted screening style (${pct}%).`;
  }
  if (pct >= pack.targetPct) {
    return `🥇 Practice estimate: likely competitive right now (${pct}%). Keep training.`;
  }
  if (pct >= pack.targetPct - 10) {
    return `⚽ Practice estimate: close, needs more reps (${pct}%).`;
  }
  return `⚽ Practice estimate: not ready yet (${pct}%). Build skills and retry.`;
}

function finishSession() {
  el.gameCard.classList.add("hidden");
  el.summaryCard.classList.remove("hidden");

  const total = state.session.length;
  const pct = Math.round((100 * state.score) / total);
  el.sessionSummary.textContent = `You scored ${state.score} out of ${total} (${pct}%).`;

  if (state.currentPack) {
    el.readinessSummary.textContent = `${focusReadinessMessage(state.score, total, state.currentPack)} This is a practice estimate only, not an official school decision.`;
  } else {
    el.readinessSummary.textContent = "";
  }

  const rows = Object.entries(state.perType)
    .map(([k, v]) => `${TYPE_LABELS[k]}: ${v.correct}/${v.total}`)
    .join(" | ");
  el.byTypeSummary.textContent = rows;

  const prev = JSON.parse(localStorage.getItem("leonGiftedStats") || "null") || {
    sessions: 0,
    correctAnswers: 0,
    totalQuestions: 0
  };

  const next = {
    sessions: prev.sessions + 1,
    correctAnswers: prev.correctAnswers + state.score,
    totalQuestions: prev.totalQuestions + total
  };

  localStorage.setItem("leonGiftedStats", JSON.stringify(next));
  renderStats();
}

function startFreePractice() {
  const types = selectedTypes();
  if (types.length === 0) {
    alert("Please select at least one question type.");
    return;
  }

  const wanted = Number(el.questionCount.value);
  const bank = buildBank().filter((x) => types.includes(x.type));
  const session = shuffle(bank).slice(0, Math.min(wanted, bank.length));
  startSessionWithSet(session, null);
}

function startFocusPack() {
  const pack = FOCUS_PACKS[el.focusPackSelect.value];
  const bank = buildBank();
  const session = buildPackSession(bank, pack);
  startSessionWithSet(session, pack);
}

function startSessionWithSet(session, pack) {
  state.session = session;
  state.idx = 0;
  state.score = 0;
  state.currentPack = pack;
  state.perType = {
    nonverbal: { correct: 0, total: session.filter((x) => x.type === "nonverbal").length },
    verbal: { correct: 0, total: session.filter((x) => x.type === "verbal").length },
    quant: { correct: 0, total: session.filter((x) => x.type === "quant").length },
    memory: { correct: 0, total: session.filter((x) => x.type === "memory").length }
  };

  el.configCard.classList.add("hidden");
  el.summaryCard.classList.add("hidden");
  el.gameCard.classList.remove("hidden");
  renderQuestion();
}

function onModeChange() {
  const isFocus = el.modeSelect.value === "focus";
  el.focusPackRow.classList.toggle("hidden", !isFocus);
  el.questionCountRow.classList.toggle("hidden", isFocus);
  el.typeFieldset.classList.toggle("hidden", isFocus);
}

el.modeSelect.addEventListener("change", onModeChange);
el.startSessionBtn.addEventListener("click", () => {
  if (el.modeSelect.value === "focus") {
    startFocusPack();
  } else {
    startFreePractice();
  }
});

el.playAgainBtn.addEventListener("click", () => {
  state.currentPack = null;
  el.summaryCard.classList.add("hidden");
  el.configCard.classList.remove("hidden");
});

el.nextBtn.addEventListener("click", () => {
  if (state.idx + 1 >= state.session.length) {
    finishSession();
  } else {
    state.idx += 1;
    renderQuestion();
  }
});

el.resetStatsBtn.addEventListener("click", () => {
  localStorage.removeItem("leonGiftedStats");
  renderStats();
});

el.unlockBtn.addEventListener("click", async () => {
  const pin = el.pinInput.value.trim();
  const ok = await verifyPin(pin);
  if (!ok) {
    el.pinMessage.textContent = "Wrong PIN. Try again.";
    return;
  }
  unlockApp();
});

el.pinInput.addEventListener("keydown", async (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    el.unlockBtn.click();
  }
});

el.pinSettingsBtn.addEventListener("click", async () => {
  const current = prompt("Enter current PIN:");
  if (!current) return;
  const ok = await verifyPin(current.trim());
  if (!ok) {
    alert("Current PIN is incorrect.");
    return;
  }

  const action = prompt("Type NEW to change PIN, or REMOVE to disable PIN.");
  if (!action) return;

  if (action.toUpperCase() === "REMOVE") {
    localStorage.removeItem("leonGiftedPinHash");
    alert("PIN removed. App will ask to create a new PIN on next reload.");
    return;
  }

  if (action.toUpperCase() === "NEW") {
    const next = prompt("Enter new PIN (4-12 characters):");
    if (!validPin(next)) {
      alert("Invalid PIN length. Use 4-12 characters.");
      return;
    }
    await savePin(next);
    alert("PIN updated.");
  }
});

async function init() {
  const ready = await ensurePinExists();
  if (!ready) return;
  onModeChange();
  renderStats();
  lockApp();
}

init();
