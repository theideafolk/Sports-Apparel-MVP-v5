import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Designer } from './pages/Designer';
import { Cart } from './pages/Cart';
import { Header } from './components/Header';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Designer />} />
            <Route path="/cart" element={<Cart />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;