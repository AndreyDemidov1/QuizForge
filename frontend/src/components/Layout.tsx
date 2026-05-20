import { NavLink, Outlet } from "react-router-dom";

export function Layout() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">Q</div>
          <div>
            <h1>QuizForge</h1>
            <p>Управление тестами</p>
          </div>
        </div>
        <nav className="nav">
          <NavLink to="/" end>
            Все тесты
          </NavLink>
          <NavLink to="/create">Создать тест</NavLink>
        </nav>
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
