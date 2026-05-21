const api = "/api/tests";

const state = {
  tests: [],
  editingId: null,
  draft: emptyDraft(),
  takingTest: null,
  selectedAnswers: {},
};

const elements = {
  status: document.querySelector("#status"),
  list: document.querySelector("#listView"),
  listContainer: document.querySelector("#testList"),
  editor: document.querySelector("#editorView"),
  details: document.querySelector("#detailsView"),
  take: document.querySelector("#takeView"),
  form: document.querySelector("#testForm"),
  title: document.querySelector("#titleInput"),
  description: document.querySelector("#descriptionInput"),
  questionsEditor: document.querySelector("#questionsEditor"),
  editorTitle: document.querySelector("#editorTitle"),
};

document.querySelector("#refreshButton").addEventListener("click", loadTests);
document.querySelector("#navCreate").addEventListener("click", createTest);
document.querySelector("#addQuestionButton").addEventListener("click", addQuestion);
document.querySelector("#cancelEditor").addEventListener("click", () => showView("list"));
document.querySelectorAll(".nav-btn[data-view]").forEach((btn) => {
  btn.addEventListener("click", () => {
    if (btn.dataset.view === "list") {
      loadTests();
    } else if (btn.dataset.view === "editor") {
      createTest();
    }
  });
});
elements.form.addEventListener("submit", saveDraft);

loadTests();

function emptyDraft() {
  return {
    title: "",
    description: "",
    questions: [
      {
        text: "",
        type: "SingleChoice",
        options: [
          { text: "", isCorrect: true },
          { text: "", isCorrect: false },
        ],
      },
    ],
  };
}

async function request(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || `HTTP ${response.status}`);
  }

  return response.status === 204 ? null : response.json();
}

async function run(action) {
  elements.status.textContent = "Загрузка…";
  try {
    await action();
    elements.status.textContent = "";
  } catch (error) {
    elements.status.textContent = error.message || "Ошибка";
  }
}

function showView(name) {
  for (const section of [elements.list, elements.editor, elements.details, elements.take]) {
    section.classList.add("hidden");
  }
  document.querySelectorAll(".nav-btn").forEach((b) => b.classList.remove("active"));

  if (name === "list") {
    elements.list.classList.remove("hidden");
    document.querySelector('.nav-btn[data-view="list"]').classList.add("active");
  } else if (name === "editor") {
    elements.editor.classList.remove("hidden");
    document.querySelector("#navCreate").classList.add("active");
  } else if (name === "details") {
    elements.details.classList.remove("hidden");
  } else if (name === "take") {
    elements.take.classList.remove("hidden");
  }
}

async function loadTests() {
  await run(async () => {
    state.tests = await request(api);
    renderList();
    showView("list");
  });
}

function renderList() {
  if (state.tests.length === 0) {
    elements.listContainer.innerHTML =
      '<p class="empty panel">Пока нет тестов. Нажмите «Создать тест» в меню слева.</p>';
    return;
  }

  elements.listContainer.innerHTML = state.tests
    .map(
      (test) => `
        <article class="test-row">
          <div>
            <h3>${escapeHtml(test.title)}</h3>
            <p class="meta">${escapeHtml(test.description || "Без описания")} · ${test.questionCount} вопр.</p>
          </div>
          <div class="actions">
            <button class="btn ghost" onclick="openDetails('${test.id}')">Открыть</button>
            <button class="btn ghost" onclick="editTest('${test.id}')">Править</button>
            <button class="btn primary" onclick="startTaking('${test.id}')">Пройти</button>
          </div>
        </article>
      `
    )
    .join("");
}

function createTest() {
  state.editingId = null;
  state.draft = emptyDraft();
  elements.editorTitle.textContent = "Новый тест";
  renderEditor();
  showView("editor");
}

async function openDetails(id) {
  await run(async () => {
    const test = await request(`${api}/${id}`);
    elements.details.innerHTML = `
      <header class="page-header">
        <div>
          <h2>${escapeHtml(test.title)}</h2>
          <p class="muted">${escapeHtml(test.description || "Без описания")}</p>
        </div>
        <div class="actions">
          <button class="btn primary" onclick="startTaking('${test.id}')">Пройти</button>
          <button class="btn ghost" onclick="editTest('${test.id}')">Редактировать</button>
          <button class="btn danger" onclick="deleteTest('${test.id}')">Удалить</button>
        </div>
      </header>
      ${test.questions.map(renderQuestionDetails).join("")}
      <button class="btn ghost" style="margin-top:16px" onclick="loadTests()">← К списку</button>
    `;
    showView("details");
  });
}

function renderQuestionDetails(question, index) {
  return `
    <article class="detail-q panel">
      <div class="q-type">Вопрос ${index + 1} · ${question.type === "SingleChoice" ? "Один ответ" : "Несколько ответов"}</div>
      <strong>${escapeHtml(question.text)}</strong>
      <ul>
        ${question.options
          .map((o) => `<li class="${o.isCorrect ? "correct" : ""}">${o.isCorrect ? "✓ " : "○ "}${escapeHtml(o.text)}</li>`)
          .join("")}
      </ul>
    </article>
  `;
}

async function editTest(id) {
  await run(async () => {
    const test = await request(`${api}/${id}`);
    state.editingId = id;
    state.draft = {
      title: test.title,
      description: test.description || "",
      questions: test.questions.map((q) => ({
        text: q.text,
        type: q.type,
        options: q.options.map((o) => ({ text: o.text, isCorrect: o.isCorrect })),
      })),
    };
    elements.editorTitle.textContent = "Редактирование";
    renderEditor();
    showView("editor");
  });
}

function renderEditor() {
  elements.title.value = state.draft.title;
  elements.description.value = state.draft.description || "";
  elements.questionsEditor.innerHTML = state.draft.questions.map(renderQuestionEditor).join("");
}

function renderQuestionEditor(question, questionIndex) {
  return `
    <article class="question">
      <div class="question-head">
        <span>Вопрос ${questionIndex + 1}</span>
        ${state.draft.questions.length > 1 ? `<button class="btn danger" type="button" onclick="removeQuestion(${questionIndex})">Удалить</button>` : ""}
      </div>
      <label>Текст вопроса *
        <input required value="${escapeAttribute(question.text)}" oninput="setQuestionText(${questionIndex}, this.value)" />
      </label>
      <label>Тип
        <select onchange="setQuestionType(${questionIndex}, this.value)">
          <option value="SingleChoice" ${question.type === "SingleChoice" ? "selected" : ""}>Одиночный выбор</option>
          <option value="MultipleChoice" ${question.type === "MultipleChoice" ? "selected" : ""}>Множественный выбор</option>
        </select>
      </label>
      ${question.options.map((o, oi) => renderOptionEditor(question, questionIndex, o, oi)).join("")}
      <button class="btn ghost" type="button" onclick="addOption(${questionIndex})">+ Добавить ответ</button>
    </article>
  `;
}

function renderOptionEditor(question, questionIndex, option, optionIndex) {
  return `
    <div class="option-row">
      <input required value="${escapeAttribute(option.text)}" placeholder="Вариант ${optionIndex + 1}" oninput="setOptionText(${questionIndex}, ${optionIndex}, this.value)" />
      <label class="correct-toggle">
        <input type="${question.type === "SingleChoice" ? "radio" : "checkbox"}" name="correct-${questionIndex}" ${option.isCorrect ? "checked" : ""} onchange="toggleCorrect(${questionIndex}, ${optionIndex})" />
        Верный
      </label>
      <button class="btn ghost" type="button" onclick="removeOption(${questionIndex}, ${optionIndex})" ${question.options.length <= 2 ? "disabled" : ""}>Убрать</button>
    </div>
  `;
}

async function saveDraft(event) {
  event.preventDefault();
  state.draft.title = elements.title.value;
  state.draft.description = elements.description.value;

  const payload = {
    title: state.draft.title,
    description: state.draft.description || null,
    questions: state.draft.questions,
  };

  await run(async () => {
    const saved = state.editingId
      ? await request(`${api}/${state.editingId}`, { method: "PUT", body: JSON.stringify(payload) })
      : await request(api, { method: "POST", body: JSON.stringify(payload) });

    await loadTests();
    await openDetails(saved.id);
  });
}

async function deleteTest(id) {
  if (!confirm("Удалить тест?")) return;

  await run(async () => {
    await request(`${api}/${id}`, { method: "DELETE" });
    await loadTests();
  });
}

async function startTaking(id) {
  await run(async () => {
    state.takingTest = await request(`${api}/${id}/quiz`);
    state.selectedAnswers = {};
    renderTaking();
    showView("take");
  });
}

function renderTaking(result = null) {
  const test = state.takingTest;
  elements.take.innerHTML = `
    <header class="page-header">
      <div>
        <h2>${escapeHtml(test.title)}</h2>
        <p class="muted">${escapeHtml(test.description || "Прохождение теста")}</p>
      </div>
    </header>
    ${test.questions.map(renderTakeQuestion).join("")}
    ${result ? "" : '<button class="btn primary" onclick="submitAnswers()">Завершить</button>'}
    ${result ? `
      <section class="result">
        <p class="muted">Результат</p>
        <div class="score">${escapeHtml(result.scoreFormatted)}</div>
        <div class="percent">${escapeHtml(result.percentageFormatted)}</div>
        <div class="actions" style="justify-content:center;margin-top:20px">
          <button class="btn ghost" onclick="openDetails('${test.id}')">К тесту</button>
          <button class="btn primary" onclick="loadTests()">На главную</button>
        </div>
      </section>
    ` : ""}
    <button class="btn ghost" style="margin-top:12px" onclick="loadTests()">← К списку</button>
  `;
}

function renderTakeQuestion(question, index) {
  const selected = state.selectedAnswers[question.id] || [];
  return `
    <article class="question panel">
      <div class="question-head">
        <span>Вопрос ${index + 1}</span>
        <strong style="color:var(--muted);font-size:0.8rem">${question.type === "SingleChoice" ? "Один ответ" : "Несколько ответов"}</strong>
      </div>
      <h3 style="margin-bottom:12px">${escapeHtml(question.text)}</h3>
      ${question.options
        .map(
          (option) => `
            <label class="take-option">
              <input type="${question.type === "SingleChoice" ? "radio" : "checkbox"}" name="answer-${question.id}" ${selected.includes(option.id) ? "checked" : ""} onchange="toggleAnswer('${question.id}', '${option.id}', '${question.type}')" />
              ${escapeHtml(option.text)}
            </label>
          `
        )
        .join("")}
    </article>
  `;
}

async function submitAnswers() {
  await run(async () => {
    const result = await request(`${api}/${state.takingTest.id}/submit`, {
      method: "POST",
      body: JSON.stringify({
        answers: state.takingTest.questions.map((q) => ({
          questionId: q.id,
          selectedOptionIds: state.selectedAnswers[q.id] || [],
        })),
      }),
    });
    renderTaking(result);
    showView("take");
  });
}

function setQuestionText(index, text) {
  state.draft.questions[index].text = text;
}

function setQuestionType(index, type) {
  const question = state.draft.questions[index];
  question.type = type;
  if (type === "SingleChoice") {
    let found = false;
    for (const option of question.options) {
      option.isCorrect = option.isCorrect && !found;
      found ||= option.isCorrect;
    }
    if (!found) question.options[0].isCorrect = true;
  }
  renderEditor();
}

function setOptionText(questionIndex, optionIndex, text) {
  state.draft.questions[questionIndex].options[optionIndex].text = text;
}

function toggleCorrect(questionIndex, optionIndex) {
  const question = state.draft.questions[questionIndex];
  if (question.type === "SingleChoice") {
    question.options.forEach((o, i) => {
      o.isCorrect = i === optionIndex;
    });
  } else {
    question.options[optionIndex].isCorrect = !question.options[optionIndex].isCorrect;
  }
  renderEditor();
}

function addQuestion() {
  state.draft.questions.push(emptyDraft().questions[0]);
  renderEditor();
}

function removeQuestion(index) {
  state.draft.questions.splice(index, 1);
  renderEditor();
}

function addOption(questionIndex) {
  state.draft.questions[questionIndex].options.push({ text: "", isCorrect: false });
  renderEditor();
}

function removeOption(questionIndex, optionIndex) {
  state.draft.questions[questionIndex].options.splice(optionIndex, 1);
  renderEditor();
}

function toggleAnswer(questionId, optionId, type) {
  const selected = state.selectedAnswers[questionId] || [];
  state.selectedAnswers[questionId] =
    type === "SingleChoice"
      ? [optionId]
      : selected.includes(optionId)
        ? selected.filter((id) => id !== optionId)
        : [...selected, optionId];
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll("\n", " ");
}

Object.assign(window, {
  openDetails,
  editTest,
  deleteTest,
  startTaking,
  setQuestionText,
  setQuestionType,
  setOptionText,
  toggleCorrect,
  addOption,
  removeOption,
  removeQuestion,
  toggleAnswer,
  submitAnswers,
});
