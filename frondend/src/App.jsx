import Home from "./pages/HomePage";
import PracticeJLPT from "./pages/PracticeJLPT";
import PracticeEJU from "./pages/PracticeEJU";
import MockExamJLPT from "./pages/MockExamJLPT";
import PracticeByType from "./pages/PracticeByType";
import PracticeLevelDetail from "./pages/PracticeLevelDetail";

export default function App() {
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';

  let Page = Home;
  if (pathname === '/practice-jlpt') Page = PracticeJLPT;
  if (pathname === '/practice-eju') Page = PracticeEJU;
  if (pathname === '/mock-exam-jlpt') Page = MockExamJLPT;
  if (pathname === '/practice-by-type') Page = PracticeByType;
  if (pathname === '/practice-level-detail') Page = PracticeLevelDetail;

  return (
    <div className="font-sans">
      <Page />
    </div>
  );
}