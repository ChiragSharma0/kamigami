import React, { useContext } from "react";
import { ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { ProductDataContext } from "../../context/ProductDataContext";
import ProductCard from '../../components/ProductCards/ProductCards'


const RelatedProducts = () => {

  const {productData} = useContext(ProductDataContext)

  return (
    <section className="bg-black text-white py-20 px-6 lg:px-12">

      <div className="max-w-[1400px] mx-auto">

        {/* PRODUCTS GRID */}

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-10">

          {productData.length === 0 ? (

          <p>No Products Available</p>

        ) : (

          productData.slice(1,4).map((product) => (

            <ProductCard
              key={product.id}
              product={product}
              // addToCart={addToCart}
            />

          ))

        )}
        

        </div>

      </div>

    </section>
  );
};

export default RelatedProducts;
