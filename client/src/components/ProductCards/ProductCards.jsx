import React, { useContext } from "react";
import { ShoppingCart } from "lucide-react";
import "../ProductCards/module.css";
import { CartContext } from "../../Context/CartContext";
import { Link } from "react-router-dom";

const ProductCard = ({ product }) => {
  const { cartItems, setCartItems, setIsCartOpen } = useContext(CartContext);

  if (!product) return null;

  const handleAddToCart = () => {
    const existing = cartItems.find((item) => item.id === product.id);
    if (existing) {
      const updated = cartItems.map((item) =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
      setCartItems(updated);
    } else {
      setCartItems([...cartItems, { ...product, quantity: 1 }]);
    }
    setIsCartOpen(true); 
  };

  return (

  <Link
  to={`/all-products/${product.id}`}
  className="product-link"
>

  <div className="card">

    {/* Product Image */}
    <img
      src={product.image}
      alt={product.title}
    />

    {/* Bottom Content */}
    <div className="bottom">

      <div className="bottom-content">

        {/* Product Title */}
        <h1>
          {product.title}
        </h1>

        {/* Category / Description */}
        <p>
          {product.category}
        </p>

        {/* Price + Button Row */}
        <div className="price-cart">

          <p className="product-price">
            ₹{product.price}
          </p>

          <button
            className="add-cart-btn"
            onClick={(e) => {
              e.preventDefault(); // important: link navigation stop karega
              e.stopPropagation();
              handleAddToCart();
              // yaha addToCart(product) call kar sakte ho
            }}
          >
            Add To Cart
          </button>

        </div>

      </div>

    </div>

  </div>

</Link>

);
};

export default ProductCard;