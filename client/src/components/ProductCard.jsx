// Reusable card component for village marketplace produce sold directly by farmers
import React from 'react';

// ProductCard renders produce name, price with unit, category badge, seller details, and contact button
const ProductCard = ({ product, onContact }) => {
  // Category badge color helper
  const getCategoryBadgeClass = (category) => {
    switch (category) {
      case 'vegetables':
        return 'bg-success text-white';
      case 'dairy':
        return 'bg-primary text-white';
      case 'grains':
        return 'bg-warning text-dark';
      case 'fruits':
        return 'bg-danger text-white';
      default:
        return 'bg-secondary text-white';
    }
  };

  return (
    <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden bg-white">
      <div className="card-body p-4 d-flex flex-column">
        {/* Category & Availability Badges */}
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className={`badge rounded-pill px-3 py-1 small text-capitalize ${getCategoryBadgeClass(product.category)}`}>
            {product.category}
          </span>
          {product.isAvailable ? (
            <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill small">
              In Stock
            </span>
          ) : (
            <span className="badge bg-danger-subtle text-danger border border-danger-subtle rounded-pill small">
              Sold Out
            </span>
          )}
        </div>

        {/* Product Title */}
        <h5 className="card-title fw-bold text-dark mt-2 mb-1">
          {product.name}
        </h5>

        {/* Seller Info & Location */}
        <div className="small text-muted mb-1">
          <i className="bi bi-person me-1"></i> Farmer: <strong>{product.seller?.name || 'Local Farmer'}</strong>
        </div>
        <div className="small text-muted mb-2">
          <i className="bi bi-geo-alt me-1"></i> {product.location || 'Gram Panchayat Rampur'}
        </div>

        {/* Description snippet */}
        <p className="card-text text-secondary small flex-grow-1 mb-3">
          {product.description && product.description.length > 85
            ? `${product.description.substring(0, 85)}...`
            : product.description || 'Farm-fresh rural produce direct from farmer.'}
        </p>

        {/* Price & Available Quantity */}
        <div className="bg-light p-2 rounded-3 mb-3 border d-flex justify-content-between align-items-center">
          <span className="small text-muted">Available: <strong>{product.quantity} {product.unit}</strong></span>
          <span className="fw-bold text-primary-green fs-5">
            ₹{product.price} <span className="small text-muted fw-normal">/ {product.unit}</span>
          </span>
        </div>

        {/* Action Button: View Details & Contact Farmer */}
        <button
          type="button"
          className="btn btn-outline-success btn-sm rounded-pill w-100 d-flex align-items-center justify-content-center gap-1 py-2 fw-semibold"
          onClick={() => onContact(product)}
        >
          <i className="bi bi-telephone me-1"></i> Contact Farmer (सम्पर्क करें)
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
