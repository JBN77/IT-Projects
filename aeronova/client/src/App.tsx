import { Route, Routes } from "react-router-dom";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { AccountPage } from "./pages/AccountPage";
import { AuthPage } from "./pages/AuthPage";
import { BookingPage } from "./pages/BookingPage";
import { DestinationsPage } from "./pages/DestinationsPage";
import { ExperiencePage } from "./pages/ExperiencePage";
import { LandingPage } from "./pages/LandingPage";
import { LegalPage } from "./pages/LegalPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { ResultsPage } from "./pages/ResultsPage";
import { SupportPage } from "./pages/SupportPage";
import { TripsPage } from "./pages/TripsPage";

export default function App() {
  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/flights" element={<ResultsPage />} />
          <Route path="/destinations" element={<DestinationsPage />} />
          <Route path="/experience" element={<ExperiencePage />} />
          <Route path="/trips" element={<TripsPage />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/book/:flightId" element={<BookingPage />} />
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/register" element={<AuthPage mode="register" />} />
          <Route path="/privacy" element={<LegalPage kind="privacy" />} />
          <Route path="/accessibility" element={<LegalPage kind="accessibility" />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
