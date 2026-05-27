import React, { useState, useContext, useEffect } from "react"; // ← add useEffect
import PageMeta from "../../components/PageMeta";
import api from "../../services/api";
import SoonImage from "../../assets/images/soon.png";

import { Heart, Truck, Calendar, Package, Percent } from "lucide-react";

import { useParams } from "react-router-dom";

import ReviewsSection from "../../components/ReviewsSection/ReviewsSection";
import RelatedProducts from "../../components/RelatedProducts/RelatedProducts";

import { ProductDataContext } from "../../context/ProductDataContext";
import "./module.css";
import { CartContext } from "../../Context/CartContext";

const ProductDetails = () => {
  const { cartItems, setCartItems, setIsCartOpen } = useContext(CartContext);
  const { id } = useParams();
  const { productData } = useContext(ProductDataContext);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState(null);
  const [size, setSize] = useState("M");

  useEffect(() => {
    const contextProduct = productData.find((p) => p.id === id);
    if (contextProduct) {
      setProduct(contextProduct);
      setMainImage(contextProduct.image);
      setSize(contextProduct.size || "M");
      setLoading(false);
      return;
    }

    const fetchProductDetails = async () => {
      try {
        const response = await api.get(`/products/${id}`);
        const p = response.data.data.product;
        
        if (p) {
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
          let sizeVal = 'M';
          if (p.variants && p.variants.length > 0) {
            const sizeAttr = p.variants[0].attributes?.size || p.variants[0].attributes?.Size;
            if (sizeAttr) sizeVal = sizeAttr;
          }

          const formatted = {
            id: p.id,
            title: p.name,
            description: p.description || "",
            price,
            image,
            category,
            size: sizeVal,
            discount,
            slug: p.slug,
            variants: p.variants,
          };
          setProduct(formatted);
          setMainImage(image);
          setSize(sizeVal);
        }
      } catch (error) {
        console.error("Error fetching product details directly:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProductDetails();
  }, [id, productData]);
  // Extract all variants
  const variants = product?.variants || [];

  // Get unique sizes and colors from variants (deduplicated)
  const uniqueSizes = [...new Set(variants.map(v => v.attributes?.size || v.attributes?.Size || v.attributes?.SIZE).filter(Boolean))];
  const uniqueColors = [...new Set(variants.map(v => v.attributes?.color || v.attributes?.Color || v.attributes?.COLOR).filter(Boolean))];

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");

  // Set default selection on load
  useEffect(() => {
    if (product && variants.length > 0) {
      const defaultVariant = variants.find(v => (v.inventory?.stockAvailable || 0) > 0) || variants[0];
      const initialSize = defaultVariant.attributes?.size || defaultVariant.attributes?.Size || defaultVariant.attributes?.SIZE || "";
      const initialColor = defaultVariant.attributes?.color || defaultVariant.attributes?.Color || defaultVariant.attributes?.COLOR || "";
      
      setSelectedSize(initialSize);
      setSelectedColor(initialColor);
    }
  }, [product, variants]);

  // ← KEY FIX: jab bhi id change ho, scroll top + image reset
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (product) {
      setMainImage(product.image);
    }
  }, [id, product?.image]); // ← id change hone pe re-run

  const getProductMetaDescription = () => {
    if (!product) return "";
    const rawDesc = product.description || "";
    const fallback = `Buy ${product.title} at Kamigami. Experience the ultimate in premium Japanese streetwear, featuring exclusive graphic designs, oversized fits, and luxury comfort.`;
    
    let desc = rawDesc ? `${product.title} — ${rawDesc}` : fallback;
    
    if (desc.length >= 140 && desc.length <= 160) {
      return desc;
    }
    
    if (desc.length > 160) {
      return desc.substring(0, 157) + "...";
    }
    
    const suffix = " | Discover premium Japanese streetwear, oversized graphic hoodies, and high-fashion luxury apparel at the official Kamigami store.";
    const padded = desc + suffix;
    return padded.substring(0, 157) + "...";
  };

  if (loading) {
    return (
      <div className="bg-black text-white min-h-screen pt-40 flex items-center justify-center">
        <h2 className="text-xl">Loading product...</h2>
      </div>
    );
  }

  if (!product) {
    return (
      <>
        <PageMeta 
          title="Product Not Found" 
          description="We couldn't find the product you're looking for. Browse the Kamigami store to explore our exclusive range of graphic hoodies, tees, and premium streetwear." 
        />
        <h2 className="text-white text-center mt-40">Product Not Found</h2>
      </>
    );
  }

  // Get active variant based on current selections
  const activeVariant = variants.find(v => 
    (!selectedSize || (v.attributes?.size || v.attributes?.Size || v.attributes?.SIZE) === selectedSize) &&
    (!selectedColor || (v.attributes?.color || v.attributes?.Color || v.attributes?.COLOR) === selectedColor)
  );

  const activePrice = activeVariant?.price ? Number(activeVariant.price) : product.price;

  const isOutOfStock = activeVariant 
    ? (activeVariant.inventory?.stockAvailable ?? 0) <= 0 
    : (product.totalStockAvailable !== undefined ? product.totalStockAvailable <= 0 : false);

  const isSizeDisabled = (sizeOption) => {
    // If no colors, check if the variant matching this size has stock
    if (uniqueColors.length === 0) {
      const match = variants.find(v => (v.attributes?.size || v.attributes?.Size || v.attributes?.SIZE) === sizeOption);
      return !match || (match.inventory?.stockAvailable ?? 0) <= 0;
    }
    // If color selected, check if the specific combination variant has stock
    if (selectedColor) {
      const match = variants.find(v => 
        (v.attributes?.size || v.attributes?.Size || v.attributes?.SIZE) === sizeOption && 
        (v.attributes?.color || v.attributes?.Color || v.attributes?.COLOR) === selectedColor
      );
      return !match || (match.inventory?.stockAvailable ?? 0) <= 0;
    }
    return false;
  };

  const isColorDisabled = (colorOption) => {
    // If no sizes, check if the variant matching this color has stock
    if (uniqueSizes.length === 0) {
      const match = variants.find(v => (v.attributes?.color || v.attributes?.Color || v.attributes?.COLOR) === colorOption);
      return !match || (match.inventory?.stockAvailable ?? 0) <= 0;
    }
    // If size selected, check if the specific combination variant has stock
    if (selectedSize) {
      const match = variants.find(v => 
        (v.attributes?.size || v.attributes?.Size || v.attributes?.SIZE) === selectedSize && 
        (v.attributes?.color || v.attributes?.Color || v.attributes?.COLOR) === colorOption
      );
      return !match || (match.inventory?.stockAvailable ?? 0) <= 0;
    }
    return false;
  };

  // Get all images from media attachments or fallback
  const getProductImages = () => {
    if (product.media && product.media.length > 0) {
      const urls = product.media.map(m => m.media?.url).filter(Boolean);
      if (urls.length > 0) return urls;
    }
    return [product.image, product.image, product.image];
  };

  const images = getProductImages();

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    
    // Create cart item with selected variant metadata
    const cartItem = {
      ...product,
      price: activePrice,
      size: selectedSize || "M",
      color: selectedColor || "Default",
      variantId: activeVariant?.id || product.id,
      sku: activeVariant?.sku || product.sku || product.id,
    };

    const existing = cartItems.find((item) => 
      item.id === cartItem.id && 
      item.size === cartItem.size && 
      item.color === cartItem.color
    );

    if (existing) {
      const updated = cartItems.map((item) =>
        item.id === cartItem.id && 
        item.size === cartItem.size && 
        item.color === cartItem.color
          ? { ...item, quantity: item.quantity + 1 }
          : item,
      );
      setCartItems(updated);
    } else {
      setCartItems([...cartItems, { ...cartItem, quantity: 1 }]);
    }
    setIsCartOpen(true);
  };

  return (
    <>
      <PageMeta 
        title={product.title} 
        description={getProductMetaDescription()} 
        image={product.image}
      />
      <div className="bg-black text-white min-h-screen pt-28">
        <div className="breadcrumb max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 py-6 text-gray-400 text-sm">
          Home • {product.title}
        </div>

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 grid lg:grid-cols-2 gap-12">
          <div>
            <img
              src={mainImage || product.image}
              className="w-full h-[420px] sm:h-[720px] lg:h-[750px] object-cover rounded-xl"
              alt={product.title}
            />

            <div className="flex gap-3 sm:gap-5 mt-5 overflow-x-auto">
              {images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt="thumb"
                  onClick={() => setMainImage(img)}
                  className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg cursor-pointer border border-neutral-800 hover:border-red-600 flex-shrink-0"
                />
              ))}
            </div>
          </div>

          <div>
            <h1 className="product-title text-2xl sm:text-3xl font-semibold">
              {product.title}
            </h1>

            <p className="product-price text-red-600 text-xl sm:text-2xl mt-2">
              ₹{activePrice}
            </p>

            {isOutOfStock ? (
              <span className="inline-block bg-red-600/20 text-red-500 text-xs px-3 py-1 rounded-full border border-red-500/30 mt-2 font-medium">
                Out of Stock
              </span>
            ) : (
              activeVariant && (
                <p className="text-gray-400 text-xs mt-1">
                  SKU: {activeVariant.sku} • Stock: {activeVariant.inventory?.stockAvailable ?? "In Stock"}
                </p>
              )
            )}

            {/* Dynamic Size Selector */}
            {uniqueSizes.length > 0 && (
              <div className="mt-8">
                <p className="select-size text-gray-400 mb-3">Select Size</p>
                <div className="flex flex-wrap gap-3">
                  {uniqueSizes.map((s) => {
                    const disabled = isSizeDisabled(s);
                    return (
                      <button
                        key={s}
                        disabled={disabled}
                        onClick={() => setSelectedSize(s)}
                        className={`size-text px-5 py-2 rounded-full border text-sm transition ${
                          disabled
                            ? "border-neutral-800 text-neutral-600 cursor-not-allowed opacity-40 line-through"
                            : selectedSize === s
                              ? "bg-red-600 border-red-600 text-white font-medium"
                              : "border-neutral-700 text-neutral-300 hover:border-red-600"
                        }`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Dynamic Color Selector */}
            {uniqueColors.length > 0 && (
              <div className="mt-6">
                <p className="select-size text-gray-400 mb-3">Select Color</p>
                <div className="flex flex-wrap gap-3">
                  {uniqueColors.map((c) => {
                    const disabled = isColorDisabled(c);
                    return (
                      <button
                        key={c}
                        disabled={disabled}
                        onClick={() => setSelectedColor(c)}
                        className={`size-text px-5 py-2 rounded-full border text-sm transition ${
                          disabled
                            ? "border-neutral-800 text-neutral-600 cursor-not-allowed opacity-40 line-through"
                            : selectedColor === c
                              ? "bg-red-600 border-red-600 text-white font-medium"
                              : "border-neutral-700 text-neutral-300 hover:border-red-600"
                        }`}
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-8">
              <button
                disabled={isOutOfStock}
                onClick={handleAddToCart}
                className={`addToCart px-10 py-3 rounded-full transition ${
                  isOutOfStock
                    ? "bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700/50"
                    : "bg-red-600 text-white hover:bg-red-700"
                }`}
              >
                {isOutOfStock ? "Sold Out" : "Add To Cart"}
              </button>

              <button
                disabled={isOutOfStock}
                className={`buyNow px-10 py-3 rounded-full transition ${
                  isOutOfStock
                    ? "bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700/50"
                    : "bg-red-600 text-white hover:bg-red-700"
                }`}
              >
                {isOutOfStock ? "Out of Stock" : "Buy Now"}
              </button>

              <button className="border border-neutral-700 p-3 rounded-full w-fit">
                <Heart size={18} />
              </button>
            </div>

            <div className="mt-10">
              <h2 className="product-description text-xl font-semibold mb-3">
                Description & Fit
              </h2>

              <p className="product-detail text-red-400 leading-relaxed text-sm sm:text-base">
                {product.description}
              </p>
            </div>

            <div className="mt-10">
              <h2 className="shipping-heading text-xl font-semibold mb-6">
                Shipping
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-center gap-4">
                  <div className="bg-neutral-900 p-3 rounded-full">
                    <Percent size={18} />
                  </div>
                  <div>
                    <p className="ship-details text-red-600">Discount</p>
                    <p className="ship-text text-gray-400 text-sm">
                      {product.discount}%
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="bg-neutral-900 p-3 rounded-full">
                    <Package size={18} />
                  </div>
                  <div>
                    <p className="ship-details text-red-600">Package</p>
                    <p className="ship-text text-gray-400 text-sm">
                      Regular Packaging
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="bg-neutral-900 p-3 rounded-full">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <p className="ship-details text-red-600">Delivery Time</p>
                    <p className="ship-text text-gray-400 text-sm">
                      3-4 Working Days
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="bg-neutral-900 p-3 rounded-full">
                    <Truck size={18} />
                  </div>
                  <div>
                    <p className="ship-details text-red-600">
                      Estimation Arrive
                    </p>
                    <p className="ship-text text-gray-400 text-sm">
                      10-12 Oct 2026
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* <ReviewsSection /> */}

      <RelatedProducts />
    </>
  );
};

export default ProductDetails;
