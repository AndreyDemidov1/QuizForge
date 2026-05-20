import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api/client";
import { TestForm } from "../components/TestForm";
import type { CreateTestPayload } from "../types";

export function TestEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [initial, setInitial] = useState<CreateTestPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    api
      .getTest(id)
      .then((test) =>
        setInitial({
          title: test.title,
          description: test.description,
          questions: test.questions.map((q) => ({
            text: q.text,
            type: q.type,
            options: q.options.map((o) => ({ text: o.text, isCorrect: o.isCorrect })),
          })),
        })
      )
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Тест не найден")
      );
  }, [id]);

  if (error) return <div className="error-banner">{error}</div>;
  if (!initial) return <p className="empty-state">Загрузка…</p>;

  return (
    <>
      <header className="page-header">
        <div>
          <h2>Редактирование</h2>
          <p>Измените тест и сохраните</p>
        </div>
      </header>
      <TestForm
        initial={initial}
        submitLabel="Сохранить изменения"
        onSubmit={async (payload) => {
          if (!id) return;
          await api.updateTest(id, payload);
          navigate(`/tests/${id}`);
        }}
        onCancel={() => navigate(id ? `/tests/${id}` : "/")}
      />
    </>
  );
}
