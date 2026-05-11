// src/components/Navbar/Navbar.jsx
import { useState, useContext } from "react";
import "./navbar.css";
import {
  MapPin,
  Search,
  User,
  Heart,
  ShoppingCart,
  Menu,
  X,
  Compass,
} from "lucide-react";

import { Sling as Hamburger } from 'hamburger-react'

import { Link } from "react-router-dom";
import logo from "../../assets/images/Logo.png";
import StoryIcon from "../../elements/StoryIcon";
import CartSidebar from "../CartSidebar/CartSidebar";
import SearchOverlay from "../Search/SearchBox";
import { CartContext } from "../../Context/CartContext";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { cartItems, isCartOpen, setIsCartOpen } = useContext(CartContext);

  const [openDropdown, setOpenDropdown] = useState(null);

  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  return (
    <>
      <nav className="navbar">
        <div className="nav-left">
          <Link to="/new">New In</Link>
          <Link to="/collections">Collections</Link>
        </div>

        <div className="nav-center">
          <Link to="/">
            <img src={logo} alt="Kamigami logo" className="logo" />
          </Link>
        </div>

        <div className="nav-right">
          <Link to="/stories">
            <StoryIcon />
          </Link>
          <Link to="/location">
            <MapPin size={22} />
          </Link>
          <button onClick={() => setSearchOpen(true)}>
            <Search size={22} />
          </button>
          <Link to="/userprofile">
            <User size={22} />
          </Link>
          <Link to="/wishlist">
            <Heart size={22} />
          </Link>
          <button onClick={() => setIsCartOpen(true)}>
            <ShoppingCart size={22} />
          </button>
        </div>

        {/* Mobile: hamburger OR close icon */}
        <div className="mobile-menu">
          <Hamburger
            toggled={open}
            toggle={setOpen}
            size={24}
            color="#E71E22"
            duration={0.4}
          />
        </div>
      </nav>

      {/* Full-page mobile overlay */}
      <div className={`mobile-overlay ${open ? "active" : ""}`}>
        <div className="mobile-overlay-inner">
          {/* Top section — primary nav links */}
          <div className="mobile-overlay-top">
            {/* New Arrivals — simple link, no dropdown */}
            <Link
              to="/new"
              className="overlay-link"
              onClick={() => setOpen(false)}
            >
              New Arrivals
            </Link>

            {/* Collections — dropdown */}
            <div className="overlay-dropdown">
              <button
                className="overlay-dropdown-trigger"
                onClick={() => toggleDropdown("collections")}
              >
                Shop by collection
                <span
                  className={`dropdown-arrow ${openDropdown === "collections" ? "open" : ""}`}
                >
                  ▾
                </span>
              </button>
              <div
                className={`overlay-dropdown-menu ${openDropdown === "collections" ? "open" : ""}`}
              >
                <Link to="/collections/men" onClick={() => setOpen(false)}>
                  Men
                </Link>
                <Link to="/collections/women" onClick={() => setOpen(false)}>
                  Women
                </Link>
                <Link to="/collections/unisex" onClick={() => setOpen(false)}>
                  Unisex
                </Link>
                <Link to="/collections/limited" onClick={() => setOpen(false)}>
                  Limited Edition
                </Link>
              </div>
            </div>

            {/* Iconics — dropdown */}
            <div className="overlay-dropdown">
              <button
                className="overlay-dropdown-trigger"
                onClick={() => toggleDropdown("iconics")}
              >
                Shop by category
                <span
                  className={`dropdown-arrow ${openDropdown === "iconics" ? "open" : ""}`}
                >
                  ▾
                </span>
              </button>
              <div
                className={`overlay-dropdown-menu ${openDropdown === "iconics" ? "open" : ""}`}
              >
                <Link to="/iconics/tshirts" onClick={() => setOpen(false)}>
                  The Awakening
                </Link>
                {/* <Link to="/iconics/hoodies" onClick={() => setOpen(false)}>Hoodies</Link>
      <Link to="/iconics/caps" onClick={() => setOpen(false)}>Caps</Link> */}
              </div>
            </div>

            {/* Summer Collection — dropdown */}
            <div className="overlay-dropdown">
              <button
                className="overlay-dropdown-trigger"
                onClick={() => toggleDropdown("summer")}
              >
                Summer Collection
                <span
                  className={`dropdown-arrow ${openDropdown === "summer" ? "open" : ""}`}
                >
                  ▾
                </span>
              </button>
              <div
                className={`overlay-dropdown-menu ${openDropdown === "summer" ? "open" : ""}`}
              >
                <Link to="/summer/tops" onClick={() => setOpen(false)}>
                  Tops
                </Link>
                <Link to="/summer/shorts" onClick={() => setOpen(false)}>
                  Shorts
                </Link>
                <Link to="/summer/accessories" onClick={() => setOpen(false)}>
                  Accessories
                </Link>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="mobile-overlay-divider" />

          {/* Secondary links */}
          <div className="mobile-overlay-secondary">
            <Link to="/userprofile" onClick={() => setOpen(false)}>
              User Profile
            </Link>
            <Link to="/sign-up" onClick={() => setOpen(false)}>
              Sign Up
            </Link>
            <Link to="/userprofile" onClick={() => setOpen(false)}>
              Accessories
            </Link>
            <Link to="/wishlist" onClick={() => setOpen(false)}>
              Shop by color
            </Link>
            <Link to="/wishlist" onClick={() => setOpen(false)}>
              Support
            </Link>
          </div>

          {/* Bottom icons row */}
          <div className="mobile-overlay-icons">
            <button
              onClick={() => {
                setSearchOpen(true);
                setOpen(false);
              }}
            >
              Search
            </button>
            <button
              onClick={() => {
                setIsCartOpen(true);
                setOpen(false);
              }}
            >
              Cart
            </button>
          </div>

          {/* Close label */}
          <button
            className="mobile-overlay-close"
            onClick={() => setOpen(false)}
          >
            Close
          </button>
        </div>
      </div>

      <CartSidebar
        cartItems={cartItems}
        setCartItems={() => {}}
        isOpen={isCartOpen}
        setIsOpen={setIsCartOpen}
      />
      <SearchOverlay isOpen={searchOpen} setIsOpen={setSearchOpen} />

      {/* Bottom Navigation — Mobile Only */}
      <div className="bottom-nav">
        <div className="bottom-nav-pill">
          <Link to="/all-products" className="bottom-nav-item">
            <Compass size={22} />
          </Link>
          <Link to="/userprofile" className="bottom-nav-item">
            <User size={22} />
          </Link>
          <Link className="bottom-nav-item" onClick={() => setSearchOpen(true)}>
            <Search size={22} />
          </Link>
          <button
            className="bottom-nav-item"
            onClick={() => setIsCartOpen(true)}
          >
            <ShoppingCart size={22} />
          </button>
        </div>

        {/* Story icon outside the pill */}
      </div>
    </>
  );
}
