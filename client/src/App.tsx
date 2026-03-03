import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { PackageSearch } from 'lucide-react';
import { ProductProvider } from './context/ProductContext';
import { ProductList } from './pages/ProductList';
import { ProductForm } from './pages/ProductForm';
import './index.css';

function App() {
  return (
    <ProductProvider>
      <Router>
        <div className="flex justify-between items-center mb-6">
          <Link to="/" className="flex items-center gap-2" style={{ textDecoration: 'none' }}>
            <div
              style={{
                backgroundColor: 'var(--primary)',
                padding: '0.5rem',
                borderRadius: '8px',
                color: 'white',
              }}
            >
              <PackageSearch size={24} />
            </div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-primary)' }}>
              ProManage
            </h1>
          </Link>
        </div>
        <Routes>
          <Route path="/" element={<ProductList />} />
          <Route path="/add" element={<ProductForm />} />
          <Route path="/edit/:id" element={<ProductForm />} />
        </Routes>
      </Router>
    </ProductProvider>
  );
}

export default App;
