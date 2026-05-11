import React, { useContext, useState } from "react";
import ProductCard from "../../components/ProductCards/ProductCards";
import CartSidebar from "../../components/CartSidebar/CartSidebar";
import { Funnel } from "lucide-react";
import "../ProductPages/module.css";

import { ProductDataContext } 
from "../../context/ProductDataContext";

const ProductSection = () => {

  const { productData } =
    useContext(ProductDataContext);

  console.log(productData);

  const [cartItems, setCartItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const addToCart = (product) => {

    const existing =
      cartItems.find(
        (item) => item.id === product.id
      );

    if (existing) {

      const updated =
        cartItems.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item
        );

      setCartItems(updated);

    } else {

      setCartItems([
        ...cartItems,
        { ...product, quantity: 1 },
      ]);

    }

    setIsOpen(true);
  };

  return (

    <section className="product-section">

      <div className="filter-bar">
        <Funnel size={18} />
        <span>Filter</span>
      </div>

      <div className="product-grid">

        {productData.length === 0 ? (

          <p>No Products Available</p>

        ) : (

          productData.map((product) => (

            <ProductCard
              key={product.id}
              product={product}
              addToCart={addToCart}
            />

          ))

        )}

      </div>

      <CartSidebar
        cartItems={cartItems}
        setCartItems={setCartItems}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />

    </section>

  );
};

export default ProductSection;