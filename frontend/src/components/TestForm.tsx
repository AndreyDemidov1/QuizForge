import { useState } from "react";
import type { CreateTestPayload, QuestionInput, QuestionType } from "../types";

interface TestFormProps {
  initial?: CreateTestPayload;
  submitLabel: string;
  onSubmit: (payload: CreateTestPayload) => Promise<void>;
  onCancel: () => void;
}

const emptyQuestion = (): QuestionInput => ({
  text: "",
  type: "SingleChoice",
  options: [
    { text: "", isCorrect: true },
    { text: "", isCorrect: false },
  ],
});

export function TestForm({ initial, submitLabel, onSubmit, onCancel }: TestFormProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [questions, setQuestions] = useState<QuestionInput[]>(
    initial?.questions.length ? initial.questions : [emptyQuestion()]
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const updateQuestion = (index: number, patch: Partial<QuestionInput>) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, ...patch } : q))
    );
  };

  const updateOption = (
    qIndex: number,
    oIndex: number,
    patch: Partial<{ text: string; isCorrect: boolean }>
  ) => {
    setQuestions((prev) =>
      prev.map((q, qi) =>
        qi !== qIndex
          ? q
          : {
              ...q,
              options: q.options.map((o, oi) =>
                oi === oIndex ? { ...o, ...patch } : o
              ),
            }
      )
    );
  };

  const setSingleCorrect = (qIndex: number, oIndex: number) => {
    setQuestions((prev) =>
      prev.map((q, qi) =>
        qi !== qIndex
          ? q
          : {
              ...q,
              options: q.options.map((o, oi) => ({
                ...o,
                isCorrect: oi === oIndex,
              })),
            }
      )
    );
  };

  const handleTypeChange = (qIndex: number, type: QuestionType) => {
    updateQuestion(qIndex, { type });
    if (type === "SingleChoice") {
      setSingleCorrect(qIndex, 0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await onSubmit({
        title,
        description: description.trim() || null,
        questions,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card">
      {error && <div className="error-banner">{error}</div>}

      <div className="field">
        <label>Название теста *</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          placeholder="До 200 символов"
          required
        />
      </div>

      <div className="field">
        <label>Описание</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Необязательное описание"
        />
      </div>

      {questions.map((question, qIndex) => (
        <div key={qIndex} className="question-block">
          <header>
            <span>Вопрос {qIndex + 1}</span>
            {questions.length > 1 && (
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={() =>
                  setQuestions((prev) => prev.filter((_, i) => i !== qIndex))
                }
              >
                Удалить
              </button>
            )}
          </header>

          <div className="field">
            <label>Текст вопроса *</label>
            <input
              value={question.text}
              onChange={(e) => updateQuestion(qIndex, { text: e.target.value })}
              required
            />
          </div>

          <div className="field">
            <label>Тип вопроса</label>
            <select
              value={question.type}
              onChange={(e) =>
                handleTypeChange(qIndex, e.target.value as QuestionType)
              }
            >
              <option value="SingleChoice">Одиночный выбор</option>
              <option value="MultipleChoice">Множественный выбор</option>
            </select>
          </div>

          {question.options.map((option, oIndex) => (
            <div key={oIndex} className="option-row">
              <label className="correct-toggle">
                <input
                  type={question.type === "SingleChoice" ? "radio" : "checkbox"}
                  name={`correct-${qIndex}`}
                  checked={option.isCorrect}
                  onChange={() =>
                    question.type === "SingleChoice"
                      ? setSingleCorrect(qIndex, oIndex)
                      : updateOption(qIndex, oIndex, {
                          isCorrect: !option.isCorrect,
                        })
                  }
                />
                Верный
              </label>
              <input
                type="text"
                value={option.text}
                onChange={(e) =>
                  updateOption(qIndex, oIndex, { text: e.target.value })
                }
                placeholder={`Вариант ${oIndex + 1}`}
                required
              />
              {question.options.length > 2 && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() =>
                    setQuestions((prev) =>
                      prev.map((q, qi) =>
                        qi !== qIndex
                          ? q
                          : {
                              ...q,
                              options: q.options.filter((_, oi) => oi !== oIndex),
                            }
                      )
                    )
                  }
                >
                  Убрать
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() =>
              updateQuestion(qIndex, {
                options: [...question.options, { text: "", isCorrect: false }],
              })
            }
          >
            + Добавить ответ
          </button>
        </div>
      ))}

      <button
        type="button"
        className="btn btn-ghost"
        onClick={() => setQuestions((prev) => [...prev, emptyQuestion()])}
      >
        + Добавить вопрос
      </button>

      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          Отмена
        </button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Сохранение…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
