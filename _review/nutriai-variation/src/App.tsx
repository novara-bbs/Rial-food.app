import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Journal from './pages/Journal';
import Planner from './pages/Planner';
import Analyze from './pages/Analyze';
import Cookbook from './pages/Cookbook';
import Profile from './pages/Profile';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route element={<Layout />}>
          <Route path="/journal" element={<Journal />} />
          <Route path="/planner" element={<Planner />} />
          <Route path="/analyze" element={<Analyze />} />
          <Route path="/cookbook" element={<Cookbook />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
