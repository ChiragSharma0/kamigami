import React from 'react'
import Hero from "../Hero/Hero"
import Product from "../../pages/ProductPages/Product"
import HeroSlider from '../../pages/HeroSlider/HeroSlider'
import AboutSection from '../../pages/AboutSection/AboutSection'
import TestimonialSection from '../../pages/TestimonialSection/TestimonialSection'


const MainContainer = () => {
  return (
    <div>
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
