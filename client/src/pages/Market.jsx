// Village Marketplace page where farmers and residents sell and purchase rural produce
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import AlertMessage from '../components/AlertMessage';

// Market component facilitates produce browsing, filtering, details inspection, and cart additions
const Market = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Selected product state for details modal
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Authentication check
  const token = localStorage.getItem('token');

  // Fetch products from backend with active query filters
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');

      const params = {};
      if (search.trim()) params.search = search.trim();
      if (category.trim()) params.category = category.trim();
      if (minPrice !== '') params.minPrice = minPrice;
      if (maxPrice !== '') params.maxPrice = maxPrice;

      const response = await axios.get('/api/products', { params });
      setProducts(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Fetch products error:', err);
      setError('Unable to load market products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search, category, minPrice, maxPrice]);

  // Open details modal
  const handleOpenDetails = (prod) => {
    setSelectedProduct(prod);
    setShowDetailsModal(true);
  };

  // Add product to user shopping cart
  const handleAddToCart = async (prod) => {
    setError('');
    setSuccess('');

    if (!token) {
      setError('Please log in to your account to add items to your cart.');
      return;
    }

    try {
      const response = await axios.post('/api/cart', {
        productId: prod._id,
        quantity: 1
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess(`"${prod.name}" added to your cart!`);
    } catch (err) {
      console.error('Add to cart error:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to add product to cart.');
      }
    }
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearch('');
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
  };

  const categories = [
    { label: 'All Categories', value: '' },
    { label: 'Fresh Vegetables', value: 'vegetables' },
    { label: 'Dairy & Milk', value: 'dairy' },
    { label: 'Food Grains', value: 'grains' },
    { label: 'Fruits', value: 'fruits' },
    { label: 'Handicrafts', value: 'handicrafts' },
    { label: 'Other Rural Goods', value: 'other' }
  ];

  return (
    <div className="container py-4">
      {/* Header and Cart Quick Link */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">
            <span className="text-primary-green me-2">🏪</span> Village Rural Market
          </h2>
          <p className="text-muted small mb-0">
            Direct farm-to-consumer rural commerce. Buy fresh organic produce and handmade crafts from local villagers.
          </p>
        </div>

        <div className="d-flex gap-2">
          <Link to="/cart" className="btn btn-primary btn-sm rounded-pill px-3 shadow-sm d-flex align-items-center gap-2">
            <i className="bi bi-cart3"></i> View Shopping Cart
          </Link>
          <Link to="/dashboard" className="btn btn-outline-secondary btn-sm rounded-pill px-3">
            <i className="bi bi-plus-circle me-1"></i> Sell a Product
          </Link>
        </div>
      </div>

      {/* Global Alerts */}
      <AlertMessage type="danger" message={error} onClose={() => setError('')} />
      <AlertMessage type="success" message={success} onClose={() => setSuccess('')} />

      {/* Filter Toolbar */}
      <div className="card border-0 shadow-sm rounded-4 p-3 mb-4 bg-white">
        <div className="row g-2 align-items-center">
          <div className="col-12 col-md-3">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light border-end-0"><i className="bi bi-search text-muted"></i></span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Search produce name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="col-12 col-md-3">
            <select
              className="form-select form-select-sm"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div className="col-4 col-md-2">
            <input
              type="number"
              className="form-control form-control-sm"
              placeholder="Min Price ₹"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
          </div>

          <div className="col-4 col-md-2">
            <input
              type="number"
              className="form-control form-control-sm"
              placeholder="Max Price ₹"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>

          <div className="col-4 col-md-2 d-flex">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm rounded-pill w-100"
              onClick={handleResetFilters}
            >
              <i className="bi bi-arrow-counterclockwise me-1"></i> Reset
            </button>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="p-5 text-center bg-white rounded-4 shadow-sm border">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Loading products...</span>
          </div>
          <p className="small text-muted mt-2 mb-0">Fetching fresh produce from village farmers...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="p-5 text-center bg-white rounded-4 shadow-sm border">
          <span className="fs-1 text-muted">🛒</span>
          <h5 className="fw-bold text-dark mt-2">No Produce Found</h5>
          <p className="text-muted small mb-3">No products match your search or price criteria.</p>
          <button className="btn btn-sm btn-outline-primary rounded-pill px-3" onClick={handleResetFilters}>
            Show All Items
          </button>
        </div>
      ) : (
        <div className="row g-4">
          {products.map((prod) => (
            <div key={prod._id} className="col-12 col-sm-6 col-md-4 col-lg-3">
              <ProductCard
                product={prod}
                onViewDetails={handleOpenDetails}
                onAddToCart={handleAddToCart}
              />
            </div>
          ))}
        </div>
      )}

      {/* Product Details Modal */}
      {showDetailsModal && selectedProduct && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow rounded-4 p-3">
              <div className="modal-header border-0 pb-0">
                <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-3 py-1 text-capitalize small">
                  {selectedProduct.category}
                </span>
                <button type="button" className="btn-close" onClick={() => setShowDetailsModal(false)}></button>
              </div>

              <div className="modal-body pt-2">
                <h4 className="fw-bold text-dark mb-2">{selectedProduct.name}</h4>

                {/* Seller attribution */}
                <div className="p-2 bg-light rounded-3 small text-secondary border mb-3">
                  <i className="bi bi-person-circle text-primary me-2"></i>
                  Seller: <strong>{selectedProduct.seller?.name || 'Local Farmer'}</strong>
                </div>

                <p className="text-secondary small mb-3" style={{ whiteSpace: 'pre-line' }}>
                  {selectedProduct.description || 'No additional description provided.'}
                </p>

                {/* Price and Stock Metrics */}
                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <div className="p-3 bg-light rounded-3 border text-center">
                      <div className="small text-muted">Unit Rate</div>
                      <div className="fw-bold text-primary-green fs-5">
                        ₹{selectedProduct.price} <span className="small text-muted fw-normal">/ {selectedProduct.unit}</span>
                      </div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-3 bg-light rounded-3 border text-center">
                      <div className="small text-muted">Stock Quantity</div>
                      <div className="fw-bold text-dark fs-5">
                        {selectedProduct.quantity} {selectedProduct.unit}s
                      </div>
                    </div>
                  </div>
                </div>

                {/* Availability Alert */}
                <div className={`p-2 rounded-3 small text-center ${
                  selectedProduct.isAvailable ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'
                }`}>
                  <i className={`bi ${selectedProduct.isAvailable ? 'bi-check-circle-fill' : 'bi-x-circle-fill'} me-1`}></i>
                  {selectedProduct.isAvailable ? 'Currently Available in Village' : 'Currently Out of Stock'}
                </div>
              </div>

              <div className="modal-footer border-0 pt-0">
                <button type="button" className="btn btn-outline-secondary rounded-pill px-3" onClick={() => setShowDetailsModal(false)}>
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-primary rounded-pill px-4"
                  onClick={() => {
                    setShowDetailsModal(false);
                    handleAddToCart(selectedProduct);
                  }}
                  disabled={!selectedProduct.isAvailable}
                >
                  <i className="bi bi-cart-plus me-1"></i> Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Market;
