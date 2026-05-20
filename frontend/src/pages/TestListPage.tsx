import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import type { TestListItem } from "../types";

export function TestListPage() {
  const [tests, setTests] = useState<TestListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setTests(await api.getTests());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось загрузить тесты");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <>
      <header className="page-header">
        <div>
          <h2>Библиотека тестов</h2>
          <p>Список всех доступных тестов — откройте, отредактируйте или пройдите</p>
        </div>
        <button type="button" className="btn btn-ghost" onClick={load}>
          Обновить
        </button>
      </header>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <p className="empty-state">Загрузка…</p>
      ) : tests.length === 0 ? (
        <div className="empty-state glass-card">
          <p>Пока нет тестов. Создайте первый!</p>
          <Link to="/create" className="btn btn-primary" style={{ marginTop: 16, display: "inline-block" }}>
            Создать тест
          </Link>
        </div>
      ) : (
        <div className="test-list">
          {tests.map((test) => (
            <article key={test.id} className="test-row">
              <div>
                <h3>{test.title}</h3>
                <p className="meta">
                  {test.description ?? "Без описания"} · {test.questionCount}{" "}
                  {pluralize(test.questionCount, "вопрос", "вопроса", "вопросов")}
                </p>
              </div>
              <div className="actions">
                <Link to={`/tests/${test.id}`} className="btn btn-ghost btn-sm">
                  Открыть
                </Link>
                <Link to={`/tests/${test.id}/edit`} className="btn btn-ghost btn-sm">
                  Править
                </Link>
                <Link to={`/tests/${test.id}/take`} className="btn btn-primary btn-sm">
                  Пройти
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}

function pluralize(n: number, one: string, few: string, many: string) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}
