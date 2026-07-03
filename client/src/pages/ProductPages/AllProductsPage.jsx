import React, { useContext, useState, useMemo, useEffect } from "react";
import ProductCard from "../../components/ProductCards/ProductCards";
import CartSidebar from "../../components/CartSidebar/CartSidebar";
import { Funnel, Search, X, SlidersHorizontal, RotateCcw, Check, Sparkles } from "lucide-react";
import "../ProductPages/Module.css";

import { ProductDataContext } from "../../Context/ProductDataContext";

// --- GENDER DEMOGRAPHIC DETECTOR ---
const getProductGender = (product) => {
  if (!product) return "unisex";
  
  // 0. Database Metadata Gender selection takes precedence
  if (product.metadata?.gender) {
    return product.metadata.gender.toLowerCase();
  }

  const cat = product.category?.toLowerCase() || "";
  
  // 1. Direct Category Match
  if (cat === "men" || cat === "women" || cat === "kids") return cat;

  // 2. Keyword matching in title and description
  const title = product.title?.toLowerCase() || "";
  const desc = product.description?.toLowerCase() || "";

  // Always check "women" before "men" (since "women" contains "men")
  if (title.includes("women") || desc.includes("women") || title.includes("girls")) return "women";
  if (title.includes("men") || desc.includes("men") || title.includes("boys")) return "men";
  if (title.includes("kids") || title.includes("child") || desc.includes("kids")) return "kids";

  // 3. Fallback to ID prefix prefixes
  const id = String(product.id || "").toLowerCase();
  if (id.startsWith("mn")) return "men";
  if (id.startsWith("wm")) return "women";
  if (id.startsWith("kd")) return "kids";

  return "unisex"; // Fallback default
};

// --- COLOR EXTRACTOR ---
const getProductColors = (product) => {
  if (!product) return [];
  const colors = new Set();

  // 1. Check direct product color fields
  if (product.color) {
    colors.add(product.color.toLowerCase().trim());
  }
  if (product.colour) {
    colors.add(product.colour.toLowerCase().trim());
  }

  // 2. Check metadata
  if (product.metadata?.color) {
    colors.add(product.metadata.color.toLowerCase().trim());
  }
  if (product.metadata?.colors && Array.isArray(product.metadata.colors)) {
    product.metadata.colors.forEach(c => colors.add(c.toLowerCase().trim()));
  }

  // 3. Check variants
  if (product.variants && Array.isArray(product.variants)) {
    product.variants.forEach((v) => {
      const col = v.attributes?.color || v.attributes?.Color;
      if (col) {
        colors.add(col.toLowerCase().trim());
      }
    });
  }

  // 4. Fallback: Keyword search in title/description
  const title = product.title?.toLowerCase() || "";
  const desc = product.description?.toLowerCase() || "";
  const standardColors = ["white", "black", "red", "green", "blue", "purple", "neutrals", "yellow", "brown"];
  standardColors.forEach((color) => {
    if (title.includes(color) || desc.includes(color)) {
      colors.add(color);
    }
  });

  return Array.from(colors);
};

const colorShadeMap = {
  white: ["#ffffff", "#f3f3f3", "#e5e5e5", "#d6d6d6", "#c8c8c8"],
  black: ["#000000", "#222222", "#444444", "#666666", "#888888"],
  red: ["#7f0000", "#b71c1c", "#e53935", "#ef5350", "#ffcdd2"],
  green: ["#1b5e20", "#2e7d32", "#43a047", "#66bb6a", "#c8e6c9"],
  blue: ["#0d47a1", "#1565c0", "#1e88e5", "#64b5f6", "#bbdefb"],
  purple: ["#4a148c", "#6a1b9a", "#8e24aa", "#ba68c8", "#e1bee7"],
  yellow: ["#f57f17", "#f9a825", "#fdd835", "#ffee58", "#fff9c4"],
  brown: ["#3e2723", "#5d4037", "#795548", "#a1887f", "#d7ccc8"],
  neutrals: ["#111827", "#4b5563", "#9ca3af", "#d1d5db", "#f3f4f6"],
};

const AllProductsPage = () => {
  const { productData } = useContext(ProductDataContext);

  // --- FILTER & SORT STATE ---
  const [search, setSearch] = useState("");
  const [selectedGenders, setSelectedGenders] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [sortBy, setSortBy] = useState("default");
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(12);

  // --- AVAILABLE FILTER OPTIONS DYNAMICALLY ---
  const availableCategories = useMemo(() => {
    if (!productData) return [];
    
    // Filter out top-level demographics if they are treated as categories to prevent duplication
    const demographicNames = ["men", "women", "kids"];
    return [
      ...new Set(
        productData
          .map((p) => p.category?.toLowerCase())
          .filter((cat) => cat && !demographicNames.includes(cat))
      ),
    ];
  }, [productData]);

  const availableSizes = ["s", "m", "l", "xl", "xxl"];

  // --- REAL-TIME MATCHING COUNTS ---
  const genderCounts = useMemo(() => {
    const counts = { men: 0, women: 0, kids: 0, unisex: 0 };
    if (!productData) return counts;
    productData.forEach((p) => {
      const g = getProductGender(p);
      counts[g] = (counts[g] || 0) + 1;
    });
    return counts;
  }, [productData]);

  const categoryCounts = useMemo(() => {
    const counts = {};
    if (!productData) return counts;
    productData.forEach((p) => {
      const cat = p.category?.toLowerCase();
      if (cat) counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [productData]);

  const sizeCounts = useMemo(() => {
    const counts = {};
    if (!productData) return counts;
    productData.forEach((p) => {
      const sz = p.size?.toLowerCase();
      if (sz) counts[sz] = (counts[sz] || 0) + 1;
    });
    return counts;
  }, [productData]);

  const colorCounts = useMemo(() => {
    const counts = {
      white: 0,
      black: 0,
      red: 0,
      green: 0,
      blue: 0,
      purple: 0,
      neutrals: 0,
      yellow: 0,
      brown: 0
    };
    if (!productData) return counts;
    productData.forEach((p) => {
      const colors = getProductColors(p);
      colors.forEach((c) => {
        const normalised = c.toLowerCase().trim();
        if (counts[normalised] !== undefined) {
          counts[normalised]++;
        } else if (normalised === "gray" || normalised === "grey" || normalised === "neutral") {
          counts.neutrals++;
        }
      });
    });
    return counts;
  }, [productData]);

  // --- FILTER CASCADE ---
  const filteredProducts = useMemo(() => {
    if (!productData) return [];
    let result = [...productData];

    // 1. Search Query
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q)
      );
    }

    // 2. Gender / Demographics Filter
    if (selectedGenders.length > 0) {
      result = result.filter((p) => {
        const g = getProductGender(p);
        return selectedGenders.includes(g);
      });
    }

    // 3. Categories Checkbox Group
    if (selectedCategories.length > 0) {
      result = result.filter((p) => selectedCategories.includes(p.category?.toLowerCase()));
    }

    // 4. Sizes Checkbox Group
    if (selectedSizes.length > 0) {
      result = result.filter((p) => selectedSizes.includes(p.size?.toLowerCase()));
    }

    // 5. Colors Swatch Group
    if (selectedColors.length > 0) {
      result = result.filter((p) => {
        const productColors = getProductColors(p).map(c => {
          const norm = c.toLowerCase().trim();
          if (norm === "gray" || norm === "grey" || norm === "neutral") return "neutrals";
          return norm;
        });
        return selectedColors.some(c => productColors.includes(c));
      });
    }

    // (Price filters removed)

    // 7. Sorting
    if (sortBy === "price-asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "discount-desc") {
      result.sort((a, b) => (b.discount || 0) - (a.discount || 0));
    } else if (sortBy === "name-asc") {
      result.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    }

    return result;
  }, [
    productData,
    search,
    selectedGenders,
    selectedCategories,
    selectedSizes,
    selectedColors,
    sortBy,
  ]);

  // --- ACTIONS & HANDLERS ---
  const handleGenderToggle = (gender) => {
    const g = gender.toLowerCase();
    setSelectedGenders((prev) =>
      prev.includes(g) ? prev.filter((item) => item !== g) : [...prev, g]
    );
  };

  const handleCategoryToggle = (category) => {
    const cat = category.toLowerCase();
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleSizeToggle = (size) => {
    const sz = size.toLowerCase();
    setSelectedSizes((prev) =>
      prev.includes(sz) ? prev.filter((s) => s !== sz) : [...prev, sz]
    );
  };

  const handleColorToggle = (color) => {
    const c = color.toLowerCase();
    setSelectedColors((prev) =>
      prev.includes(c) ? prev.filter((item) => item !== c) : [...prev, c]
    );
  };

  const clearAllFilters = () => {
    setSearch("");
    setSelectedGenders([]);
    setSelectedCategories([]);
    setSelectedSizes([]);
    setSelectedColors([]);
    setSortBy("default");
  };

  // Check if any filter is active to show active tags or reset button
  const hasActiveFilters = useMemo(() => {
    return (
      search.trim() !== "" ||
      selectedGenders.length > 0 ||
      selectedCategories.length > 0 ||
      selectedSizes.length > 0 ||
      selectedColors.length > 0
    );
  }, [
    search,
    selectedGenders,
    selectedCategories,
    selectedSizes,
    selectedColors,
  ]);

  // Dynamic label helpers for active tags
  const activeTags = useMemo(() => {
    const tags = [];
    if (search.trim()) {
      tags.push({ id: "search", label: `Search: "${search}"`, clear: () => setSearch("") });
    }
    selectedGenders.forEach((gender) => {
      tags.push({
        id: `gender-${gender}`,
        label: `Gender: ${gender.toUpperCase()}`,
        clear: () => handleGenderToggle(gender),
      });
    });
    selectedCategories.forEach((cat) => {
      tags.push({
        id: `cat-${cat}`,
        label: `Category: ${cat.toUpperCase()}`,
        clear: () => handleCategoryToggle(cat),
      });
    });
    // Price tags removed
    selectedSizes.forEach((sz) => {
      tags.push({
        id: `size-${sz}`,
        label: `Size: ${sz.toUpperCase()}`,
        clear: () => handleSizeToggle(sz),
      });
    });
    selectedColors.forEach((color) => {
      tags.push({
        id: `color-${color}`,
        label: `Color: ${color.toUpperCase()}`,
        clear: () => handleColorToggle(color),
      });
    });
    return tags;
  }, [
    search,
    selectedGenders,
    selectedCategories,
    selectedSizes,
    selectedColors,
  ]);

  // Reset visible items when filter variables update
  useEffect(() => {
    setVisibleCount(12);
  }, [
    search,
    selectedGenders,
    selectedCategories,
    selectedSizes,
    selectedColors,
    sortBy,
  ]);

  // Set up IntersectionObserver to trigger infinite loading batches of 12
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + 12, filteredProducts.length));
        }
      },
      { threshold: 0.1 }
    );

    const trigger = document.getElementById("infinite-scroll-trigger");
    if (trigger) observer.observe(trigger);

    return () => {
      if (trigger) observer.unobserve(trigger);
    };
  }, [filteredProducts]);

  const visibleProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleCount);
  }, [filteredProducts, visibleCount]);

  // Sidebar Refinement component (to share between desktop sidebar and mobile drawer)
  const RefinementsContent = () => (
    <div className="refinements-wrapper">
      {/* Header */}
      <div className="refinements-header">
        <h3>
          <SlidersHorizontal size={16} className="neon-red-icon" />
          REFINE PRODUCTS
        </h3>
        {hasActiveFilters && (
          <button onClick={clearAllFilters} className="clear-all-btn">
            <RotateCcw size={13} />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Target Demographic / Gender List */}
      <div className="refinement-group">
        <h4>GENDER / TARGET</h4>
        <div className="checkbox-list">
          {["men", "women", "kids", "unisex"].map((gender) => {
            const isChecked = selectedGenders.includes(gender);
            const count = genderCounts[gender] || 0;
            // Only render genders that actually have items to keep refinement clean
            if (count === 0 && !isChecked) return null;
            return (
              <label key={gender} className={`checkbox-item ${isChecked ? "active" : ""}`}>
                <div className="checkbox-box">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleGenderToggle(gender)}
                  />
                  <div className="checkbox-custom">
                    <Check size={10} className="check-icon" />
                  </div>
                </div>
                <span className="checkbox-label">{gender}</span>
                <span className="checkbox-count">({count})</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Category List */}
      <div className="refinement-group">
        <h4>CATEGORIES</h4>
        <div className="checkbox-list">
          {availableCategories.map((cat) => {
            const isChecked = selectedCategories.includes(cat);
            return (
              <label key={cat} className={`checkbox-item ${isChecked ? "active" : ""}`}>
                <div className="checkbox-box">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleCategoryToggle(cat)}
                  />
                  <div className="checkbox-custom">
                    <Check size={10} className="check-icon" />
                  </div>
                </div>
                <span className="checkbox-label">{cat}</span>
                <span className="checkbox-count">({categoryCounts[cat] || 0})</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Price Filters Removed */}

      {/* Sizes Section */}
      <div className="refinement-group">
        <h4>SIZES</h4>
        <div className="size-grid">
          {availableSizes.map((sz) => {
            const isSelected = selectedSizes.includes(sz);
            return (
              <button
                key={sz}
                onClick={() => handleSizeToggle(sz)}
                className={`size-pill ${isSelected ? "selected" : ""}`}
              >
                <span className="size-name">{sz.toUpperCase()}</span>
                <span className="size-count">{sizeCounts[sz] || 0}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Colors Section */}
      <div className="refinement-group">
        <h4>COLORS</h4>
       <div className="color-swatch-grid">
  {Object.keys(colorShadeMap).map((color) => {
    const isSelected = selectedColors.includes(color);

    return (
      <button
        key={color}
        onClick={() => handleColorToggle(color)}
        className={`color-pill ${isSelected ? "selected" : ""}`}
        title={color}
      >
        <div className="pill-colors">
          {colorShadeMap[color].map((shade, index) => (
            <span
              key={index}
              className="shade-dot"
              style={{ background: shade }}
            />
          ))}
        </div>

        {isSelected && <Check size={14} className="swatch-check" />}
      </button>
    );
  })}
</div>
      </div>

    </div>
  );

  return (
    <section className="product-section">
      <div className="product-container">
        
        {/* ========================================================
            1. LEFT REFINEMENT SIDEBAR (DESKTOP)
            ======================================================== */}
        <aside className="product-sidebar">
          <RefinementsContent />
        </aside>

        {/* ========================================================
            2. MOBILE DRAWER FILTER OVERLAY & BUTTONS
            ======================================================== */}
        <div className="mobile-filter-header">
          <button 
            className="mobile-filter-trigger"
            onClick={() => setIsMobileDrawerOpen(true)}
          >
            <Funnel size={16} />
            <span>Refine & Filter</span>
            {hasActiveFilters && <span className="mobile-active-dot" />}
          </button>

          <div className="mobile-sort-wrapper">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="mobile-sort-select"
            >
              <option value="default">SORT BY: DEFAULT</option>
              <option value="price-asc">PRICE: LOW TO HIGH</option>
              <option value="price-desc">PRICE: HIGH TO LOW</option>
              <option value="discount-desc">DISCOUNT: HIGH TO LOW</option>
              <option value="name-asc">NAME: A - Z</option>
            </select>
          </div>
        </div>

        {/* Mobile Slide-Out Glass Drawer */}
        <div className={`mobile-drawer-overlay ${isMobileDrawerOpen ? "open" : ""}`} onClick={() => setIsMobileDrawerOpen(false)}>
          <div className={`mobile-drawer-body`} onClick={(e) => e.stopPropagation()}>
            <div className="drawer-close-row">
              <h4>FILTERS</h4>
              <button className="drawer-close-btn" onClick={() => setIsMobileDrawerOpen(false)}>
                <X size={22} />
              </button>
            </div>
            <div className="drawer-scroll-content">
              <RefinementsContent />
            </div>
            <div className="drawer-footer-actions">
              <button className="drawer-apply-btn" onClick={() => setIsMobileDrawerOpen(false)}>
                APPLY FILTERS
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================
            3. MAIN CATALOG PANE (RIGHT)
            ======================================================== */}
        <main className="product-main">
          
          {/* ==============================
              A. ABOVE-CATALOG CONTROL BAR
              ============================== */}
          <div className="catalog-control-bar">
            
            {/* Top Search & Stats Control */}
            <div className="control-top-row">
              <div className="search-input-wrapper">
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  placeholder="SEARCH FOR STREETWEAR GEAR..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="stylized-search-input"
                />
                {search && (
                  <button className="search-clear-btn" onClick={() => setSearch("")}>
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="desktop-control-stats">
                <span className="stats-results-count">
                  SHOWING <span className="highlight">{filteredProducts.length}</span> OF <span className="highlight">{productData?.length || 0}</span> ITEMS
                </span>
                
                <div className="sort-dropdown-wrapper">
                  <span className="sort-label">SORT BY</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="stylized-sort-select"
                  >
                    <option value="default">FEATURED</option>
                    <option value="price-asc">PRICE: LOW TO HIGH</option>
                    <option value="price-desc">PRICE: HIGH TO LOW</option>
                    <option value="discount-desc">DISCOUNT: HIGH TO LOW</option>
                    <option value="name-asc">NAME: A - Z</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Middle Category Quick Pills */}
            <div className="control-pills-row">
              <button
                className={`quick-pill ${selectedCategories.length === 0 ? "active" : ""}`}
                onClick={() => setSelectedCategories([])}
              >
                ALL APPAREL
              </button>
              {availableCategories.map((cat) => {
                const isActive = selectedCategories.includes(cat);
                return (
                  <button
                    key={cat}
                    className={`quick-pill ${isActive ? "active" : ""}`}
                    onClick={() => handleCategoryToggle(cat)}
                  >
                    {cat.toUpperCase()}
                  </button>
                );
              })}
            </div>

            {/* Bottom Active Tag Breadcrumbs */}
            {hasActiveFilters && (
              <div className="control-tags-row">
                <span className="tags-label">ACTIVE FILTERS:</span>
                <div className="tags-container">
                  {activeTags.map((tag) => (
                    <span key={tag.id} className="active-tag-bubble">
                      {tag.label}
                      <button onClick={tag.clear} className="tag-remove-btn">
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                  <button onClick={clearAllFilters} className="tags-reset-pill">
                    <RotateCcw size={11} />
                    <span>Clear All</span>
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* ==============================
              B. DYNAMIC CATALOG GRID
              ============================== */}
          <div className="product-grid-container">
            {filteredProducts.length === 0 ? (
              <div className="no-products-container">
                <Sparkles size={40} className="glow-neon-red" />
                <h3>NO GEAR MATCHES YOUR SEARCH</h3>
                <p>Try refining your pricing slider, checkboxes, or click below to reset active search tags.</p>
                <button className="reset-cta-btn" onClick={clearAllFilters}>
                  RESET ALL REFINEMENTS
                </button>
              </div>
            ) : (
              <>
                <div className="product-grid">
                  {visibleProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                
                {visibleCount < filteredProducts.length && (
                  <div id="infinite-scroll-trigger" className="infinite-scroll-loader">
                    <div className="loader-dots">
                      <span></span><span></span><span></span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

        </main>
      </div>

      <CartSidebar />
    </section>
  );
};

export default AllProductsPage;
