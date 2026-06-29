import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import PageMeta from '../../components/PageMeta';
import ProductCard from '../../components/ProductCards/ProductCards';
import SoonImage from '../../assets/images/soon.png';
import api from '../../services/api';
import "./module.css";

const CollectionDetail = () => {
  const { slug } = useParams();
  const [collection, setCollection] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Database to Client Product Formatter
  const formatServerProduct = (p) => {
    let image = SoonImage;
    if (p.media && p.media.length > 0 && p.media[0].media && p.media[0].media.url) {
      image = p.media[0].media.url;
    }

    const price = p.basePrice ? Number(p.basePrice) : 0;

    let discount = 0;
    if (p.compareAtPrice && Number(p.compareAtPrice) > price) {
      const comparePrice = Number(p.compareAtPrice);
      discount = Math.round(((comparePrice - price) / comparePrice) * 100);
    }

    const category = p.category?.name?.toLowerCase() || 'unassigned';

    let size = 'M';
    if (p.variants && p.variants.length > 0) {
      const sizeAttr = p.variants[0].attributes?.size || p.variants[0].attributes?.Size;
      if (sizeAttr) size = sizeAttr;
    }

    return {
      id: p.id,
      title: p.name,
      description: p.description || "",
      price,
      image,
      category,
      size,
      discount,
      slug: p.slug,
      variants: p.variants,
    };
  };

  useEffect(() => {
    const fetchCollectionData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get(`/collections/${slug}`);
        const collectionData = response.data?.data?.collection;

        if (collectionData) {
          setCollection(collectionData);
          // Format the products that were returned inside the collection
          const serverProducts = collectionData.products || [];
          const formatted = serverProducts.map(formatServerProduct);
          setProducts(formatted);
        } else {
          setError('Collection not found.');
        }
      } catch (err) {
        console.error('Error fetching collection detail:', err);
        setError(err.response?.status === 404 ? 'Collection not found.' : 'Failed to load this collection.');
      } finally {
        setLoading(false);
      }
    };
    fetchCollectionData();
  }, [slug]);

  return (
    <div id="main" className="collection-detail-container">
      <PageMeta
        title={collection ? `${collection.name} Capsule` : 'Streetwear Capsule'}
        description={collection?.description || "Shop the latest exclusive street streetwear capsule release from Kamigami."}
      />

      {loading ? (
        // Loading State Header
        <div className="collection-detail-header loading">
          <div className="skeleton-line detail-title"></div>
          <div className="skeleton-line detail-desc"></div>
        </div>
      ) : error ? (
        <div className="collection-detail-error">
          <h2>{error}</h2>
          <Link to="/collections" className="back-btn">Back to Capsules</Link>
        </div>
      ) : (
        // Collection Banner Header
        <div className="collection-detail-header">
          <Link to="/collections" className="back-link">← All Capsules</Link>
          <div className="header-badge">Exclusive Release</div>
          <h1 className="detail-title-text">{collection.name}</h1>
          <p className="detail-desc-text">
            {collection.description || "Limited-quantity capsule with premium fits, custom graphics, and refined tailoring."}
          </p>
          <div className="collection-product-count">
            {products.length} {products.length === 1 ? 'Product Available' : 'Products Available'}
          </div>
          <div className="detail-header-divider"></div>
        </div>
      )}

      <div className="collection-products-content">
        {loading ? (
          // Skeletons for products grid
          <div className="products-grid">
            {[1, 2, 4].map((n) => (
              <div key={n} className="product-skeleton-card">
                <div className="skeleton-card-image shimmer"></div>
                <div className="skeleton-card-info">
                  <div className="skeleton-card-line w-80 mb-2"></div>
                  <div className="skeleton-card-line w-40"></div>
                </div>
              </div>
            ))}
          </div>
        ) : !error && products.length === 0 ? (
          <div className="collection-products-empty">
            <p>No products are currently cataloged in this collection.</p>
            <p className="empty-subtext">Sign up to our mailing list to be notified when items drop.</p>
            <Link to="/collections" className="back-btn-secondary">Browse Other Capsules</Link>
          </div>
        ) : (
          // Renders the real product grid using premium ProductCard components
          <div className="products-grid">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CollectionDetail;
