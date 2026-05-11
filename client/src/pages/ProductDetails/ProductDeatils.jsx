import React, { useState, useContext, useEffect } from "react"; // ← add useEffect

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

  const product = productData.find((p) => p.id === id);

  const images = product ? [product.image, product.image, product.image] : [];

  const [mainImage, setMainImage] = useState(images[0]);
  const [size, setSize] = useState("M");

  // ← KEY FIX: jab bhi id change ho, scroll top + image reset
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (product) {
      setMainImage(product.image);
      setSize(product.size || "M");
    }
  }, [id]); // ← id change hone pe re-run

  if (!product) {
    return <h2 className="text-white text-center mt-40">Product Not Found</h2>;
  }

  const handleAddToCart = () => {
    const existing = cartItems.find((item) => item.id === product.id);
    if (existing) {
      const updated = cartItems.map((item) =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item,
      );
      setCartItems(updated);
    } else {
      setCartItems([...cartItems, { ...product, quantity: 1 }]);
    }
    setIsCartOpen(true);
  };

  return (
    <>
      <div className="bg-black text-white min-h-screen pt-28">
        <div className="breadcrumb max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 py-6 text-gray-400 text-sm">
          Home • {product.title}
        </div>

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 grid lg:grid-cols-2 gap-12">
          <div>
            <img
              src={mainImage}
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
              ₹{product.price}
            </p>

            <div className="mt-8">
              <p className="select-size text-gray-400 mb-3">Select Size</p>

              <div className="flex flex-wrap gap-3">
                {["S", "M", "L", "XL"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`size-text px-5 py-2 rounded-full border text-sm transition ${
                      size === s
                        ? "bg-red-600 border-red-600"
                        : "border-neutral-700 hover:border-red-600"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-8">
              <button
                onClick={handleAddToCart}
                className="addToCart bg-red-600 px-10 py-3 rounded-full hover:bg-red-700 transition"
              >
                Add To Cart
              </button>

              <button className="buyNow bg-red-600 px-10 py-3 rounded-full hover:bg-red-700 transition">
                Buy Now
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
