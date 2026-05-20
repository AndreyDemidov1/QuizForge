import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { QuizTakePage } from "./pages/QuizTakePage";
import { TestCreatePage } from "./pages/TestCreatePage";
import { TestDetailPage } from "./pages/TestDetailPage";
import { TestEditPage } from "./pages/TestEditPage";
import { TestListPage } from "./pages/TestListPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<TestListPage />} />
          <Route path="create" element={<TestCreatePage />} />
          <Route path="tests/:id" element={<TestDetailPage />} />
          <Route path="tests/:id/edit" element={<TestEditPage />} />
          <Route path="tests/:id/take" element={<QuizTakePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
