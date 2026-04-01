import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import EDA from './pages/EDA';
import ModelComparison from './pages/ModelComparison';
import FeatureImportance from './pages/FeatureImportance';
import Predict from './pages/Predict';

function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <div className="main-content">
        <main className="page-container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/eda" element={<EDA />} />
            <Route path="/model-comparison" element={<ModelComparison />} />
            <Route path="/feature-importance" element={<FeatureImportance />} />
            <Route path="/predict" element={<Predict />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default App;
