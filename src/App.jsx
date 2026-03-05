import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { SiteContentProvider } from "./contexts/SiteContentContext";
import { Home } from "./pages/Home";
import { Admin } from "./pages/Admin";

function App() {
  return (
    <SiteContentProvider>
      <main className="min-h-screen bg-paper font-sans antialiased text-foreground">
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </Router>
      </main>
    </SiteContentProvider>
  );
}

export default App;
