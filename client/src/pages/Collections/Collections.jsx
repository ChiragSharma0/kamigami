import React, { useContext } from 'react'
import "./module.css"
import ProductCard from '../../components/ProductCards/ProductCards'
import { ProductDataContext } from '../../context/ProductDataContext'
// import ProductNav from '../../components/ProductNav/ProductNav'

const Collections = () => {

    const {productData} = useContext(ProductDataContext)

  return (
    <div id="main">
        <div className="product-grid">

        {productData.length === 0 ? (

          <p>No Products Available</p>

        ) : (

          productData.map((product) => (

            <ProductCard
              key={product.id}
              product={product}
              // addToCart={addToCart}
            />

          ))

        )}

      </div>
    </div>
  )
}

export default Collections
