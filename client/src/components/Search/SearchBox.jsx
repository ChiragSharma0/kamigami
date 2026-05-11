import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import "./module.css";

const dummyProducts = [
  {
    id: 1,
    title: "Wireless Noise-Cancelling Headphones",
    description: "Premium ANC with 30h battery life",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=120&h=120&fit=crop",
  },
  {
    id: 2,
    title: "Minimalist Leather Watch",
    description: "Japanese quartz movement, genuine leather",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=120&h=120&fit=crop",
  },
  {
    id: 3,
    title: "Running Sneakers Pro",
    description: "Lightweight mesh, responsive cushioning",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=120&h=120&fit=crop",
  },
  {
    id: 4,
    title: "Portable Bluetooth Speaker",
    description: "360° sound, waterproof IPX7 rated",
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=120&h=120&fit=crop",
  },
  {
    id: 5,
    title: "Classic Aviator Sunglasses",
    description: "UV400 protection, titanium frame",
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=120&h=120&fit=crop",
  },
  {
    id: 6,
    title: "Organic Cotton T-Shirt",
    description: "Soft-touch fabric, relaxed fit",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=120&h=120&fit=crop",
  },
  {
    id: 7,
    title: "Smart Fitness Tracker",
    description: "Heart rate, sleep & activity monitoring",
    image: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=120&h=120&fit=crop",
  },
  {
    id: 8,
    title: "Canvas Backpack",
    description: "Water-resistant, padded laptop sleeve",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=120&h=120&fit=crop",
  },
];

const SearchOverlay = ({ isOpen, setIsOpen }) => {
  const inputRef = useRef(null);
  const [query, setQuery] = useState("");

  // Filter products based on search query
  const filteredProducts = dummyProducts.filter(
    (p) =>
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      p.description.toLowerCase().includes(query.toLowerCase())
  );

  // Auto-focus the input when the overlay opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 350);
      return () => clearTimeout(timer);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    if (isOpen) window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, setIsOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="search-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          onClick={() => setIsOpen(false)}
        >
          {/* Expanding search panel */}
          <motion.div
            className="search-panel"
            initial={{ width: 90, height: 48, borderRadius: 24 }}
            animate={{ width: 600, height: 520, borderRadius: 14 }}
            exit={{ width: 90, height: 48, borderRadius: 24, opacity: 0 }}
            transition={{
              width: { duration: 0.3, ease: [0.25, 1, 0.5, 1] },
              height: { duration: 0.3, delay: 0.12, ease: [0.25, 1, 0.5, 1] },
              borderRadius: { duration: 0.25 },
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Inner content fades in after the panel expands */}
            <motion.div
              className="search-inner"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.2 }}
            >
              <input
                ref={inputRef}
                type="text"
                placeholder="Search products..."
                className="search-input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />

              <div className="search-results">
                {filteredProducts.length === 0 ? (
                  <p className="search-results-placeholder">
                    No products found
                  </p>
                ) : (
                  filteredProducts.map((product, index) => (
                    <motion.div
                      key={product.id}
                      className="search-result-item"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: 0.35 + index * 0.04,
                        duration: 0.25,
                        ease: "easeOut",
                      }}
                    >
                      <div className="result-thumb">
                        <img
                          src={product.image}
                          alt={product.title}
                          loading="lazy"
                        />
                      </div>
                      <div className="result-info">
                        <span className="result-title">{product.title}</span>
                        <span className="result-desc">
                          {product.description}
                        </span>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchOverlay;