import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client";
import type { AttemptResult, TestForQuiz } from "../types";

export function QuizTakePage() {
  const { id } = useParams<{ id: string }>();
  const [test, setTest] = useState<TestForQuiz | null>(null);
  const [step, setStep] = useState(0);
  const [selections, setSelections] = useState<Record<string, string[]>>({});
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    api
      .getQuiz(id)
      .then(setTest)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Тест не найден")
      );
  }, [id]);

  const questions = test?.questions ?? [];
  const current = questions[step];
  const progress = questions.length ? ((step + 1) / questions.length) * 100 : 0;

  const selectedForCurrent = useMemo(
    () => (current ? selections[current.id] ?? [] : []),
    [current, selections]
  );

  const toggleOption = (questionId: string, optionId: string, type: string) => {
    setSelections((prev) => {
      const currentSel = prev[questionId] ?? [];
      if (type === "SingleChoice") {
        return { ...prev, [questionId]: [optionId] };
      }
      const exists = currentSel.includes(optionId);
      return {
        ...prev,
        [questionId]: exists
          ? currentSel.filter((x) => x !== optionId)
          : [...currentSel, optionId],
      };
    });
  };

  const handleFinish = async () => {
    if (!id) return;
    setSubmitting(true);
    setError(null);
    try {
      const answers = questions.map((q) => ({
        questionId: q.id,
        selectedOptionIds: selections[q.id] ?? [],
      }));
      const res = await api.submitAttempt(id, answers);
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка отправки");
    } finally {
      setSubmitting(false);
    }
  };

  if (error && !test) {
    return <div className="error-banner">{error}</div>;
  }

  if (!test) {
    return <p className="empty-state">Загрузка…</p>;
  }

  if (result) {
    return (
      <div className="quiz-wizard">
        <div className="glass-card result-card">
          <p style={{ color: "var(--text-muted)", marginBottom: 12 }}>Результат</p>
          <div className="score-big">{result.scoreFormatted}</div>
          <div className="percent">{result.percentageFormatted}</div>
          <div style={{ marginTop: 32, display: "flex", gap: 12, justifyContent: "center" }}>
            <Link to={`/tests/${id}`} className="btn btn-ghost">
              К тесту
            </Link>
            <Link to="/" className="btn btn-primary">
              На главную
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-wizard">
      <header className="page-header">
        <div>
          <h2>{test.title}</h2>
          <p>{test.description ?? "Прохождение теста"}</p>
        </div>
      </header>

      {error && <div className="error-banner">{error}</div>}

      <div className="progress-bar">
        <span style={{ width: `${progress}%` }} />
      </div>

      {current && (
        <div className="glass-card quiz-question">
          <div className="quiz-type">
            Вопрос {step + 1} из {questions.length} ·{" "}
            {current.type === "SingleChoice" ? "Один ответ" : "Несколько ответов"}
          </div>
          <h3>{current.text}</h3>

          <div className="answer-list">
            {current.options.map((option) => {
              const selected = selectedForCurrent.includes(option.id);
              return (
                <label
                  key={option.id}
                  className={`answer-choice ${selected ? "selected" : ""}`}
                >
                  <input
                    type={current.type === "SingleChoice" ? "radio" : "checkbox"}
                    name={`q-${current.id}`}
                    checked={selected}
                    onChange={() =>
                      toggleOption(current.id, option.id, current.type)
                    }
                  />
                  <span>{option.text}</span>
                </label>
              );
            })}
          </div>

          <div className="wizard-nav">
            <button
              type="button"
              className="btn btn-ghost"
              disabled={step === 0}
              onClick={() => setStep((s) => s - 1)}
            >
              Назад
            </button>
            {step < questions.length - 1 ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setStep((s) => s + 1)}
              >
                Далее
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                disabled={submitting}
                onClick={handleFinish}
              >
                {submitting ? "Проверка…" : "Завершить"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
