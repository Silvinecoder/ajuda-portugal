import { Routes, Route } from 'react-router-dom';
import MapView from './components/MapView';
import ManageRequest from './pages/ManageRequest';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MapView />} />
      <Route path="/pedido/:slug" element={<ManageRequest />} />
    </Routes>
  );
}
