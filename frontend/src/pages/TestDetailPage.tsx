import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api/client";
import type { TestDetail } from "../types";

export function TestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [test, setTest] = useState<TestDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    api
      .getTest(id)
      .then(setTest)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Тест не найден")
      );
  }, [id]);

  const handleDelete = async () => {
    if (!id || !confirm("Удалить этот тест?")) return;
    try {
      await api.deleteTest(id);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка удаления");
    }
  };

  if (error) {
    return <div className="error-banner">{error}</div>;
  }

  if (!test) {
    return <p className="empty-state">Загрузка…</p>;
  }

  return (
    <>
      <header className="page-header">
        <div>
          <h2>{test.title}</h2>
          <p className="detail-meta">{test.description ?? "Без описания"}</p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Link to={`/tests/${test.id}/take`} className="btn btn-primary">
            Пройти
          </Link>
          <Link to={`/tests/${test.id}/edit`} className="btn btn-ghost">
            Редактировать
          </Link>
          <button type="button" className="btn btn-danger" onClick={handleDelete}>
            Удалить
          </button>
        </div>
      </header>

      <div className="glass-card">
        {test.questions.map((q, i) => (
          <div key={q.id} className="detail-question">
            <div className="q-type">
              Вопрос {i + 1} · {q.type === "SingleChoice" ? "Один ответ" : "Несколько ответов"}
            </div>
            <strong>{q.text}</strong>
            <div className="detail-options">
              {q.options.map((o) => (
                <span key={o.id} className={o.isCorrect ? "correct" : ""}>
                  {o.isCorrect ? "✓ " : "○ "}
                  {o.text}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
