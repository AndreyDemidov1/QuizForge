import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { TestForm } from "../components/TestForm";

export function TestCreatePage() {
  const navigate = useNavigate();

  return (
    <>
      <header className="page-header">
        <div>
          <h2>Новый тест</h2>
          <p>Заполните информацию и добавьте вопросы</p>
        </div>
      </header>
      <TestForm
        submitLabel="Сохранить"
        onSubmit={async (payload) => {
          const created = await api.createTest(payload);
          navigate(`/tests/${created.id}`);
        }}
        onCancel={() => navigate("/")}
      />
    </>
  );
}
