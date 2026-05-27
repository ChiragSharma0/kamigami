import React from 'react'
import PageMeta from '../PageMeta'
import Hero from "../Hero/Hero"
import Product from "../../pages/ProductPages/Product"
import HeroSlider from '../../pages/HeroSlider/HeroSlider'
import AboutSection from '../../pages/AboutSection/AboutSection'
import TestimonialSection from '../../pages/TestimonialSection/TestimonialSection'


const MainContainer = () => {
  return (
    <div>
      <PageMeta 
        title="Home" 
        description="Shop Kamigami for premium Japanese streetwear & luxury fashion. Explore our limited graphic hoodies, oversized t-shirts, and exclusive seasonal apparel drops." 
      />
      <div className="hide-on-mobile">
        <Hero/>
      </div>
      <HeroSlider/>
      <Product/>
      <TestimonialSection/>
      <AboutSection/>
    </div>
  )
}

export default MainContainer
