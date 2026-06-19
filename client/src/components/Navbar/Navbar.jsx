import { useState, useContext, useEffect } from "react";
import "./navbar.css";
import {
  MapPin,
  Search,
  User,
  ShoppingCart,
  LogOut,
  Compass
} from "lucide-react";

import { Sling as Hamburger } from 'hamburger-react';
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/images/Logo.png";
import StoryIcon from "../../elements/StoryIcon";
import CartSidebar from "../CartSidebar/CartSidebar";
import SearchOverlay from "../Search/SearchBox";
import { CartContext } from "../../Context/CartContext";
import { useAuth } from "../../Context/AuthContext";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { cartItems, isCartOpen, setIsCartOpen } = useContext(CartContext);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [openDropdown, setOpenDropdown] = useState(null);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // High-performance vanilla scroll listener (GSAP-free)
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY <= 80) {
        setIsNavVisible(true);
      } else if (currentScrollY > lastScrollY) {
        // Scrolling down: hide navbar
        setIsNavVisible(false);
      } else {
        // Scrolling up: reveal navbar
        setIsNavVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <>
      <div className={`navbar-container ${isNavVisible ? "visible" : "hidden"}`}>
        <nav className="navbar">
          <div className="nav-left">
            <Link to="/drops">Drops</Link>
            <Link to="/collections">Collections</Link>
            <Link to="/about-us">About Us</Link>
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
              <MapPin size={18} />
            </Link>
            <button onClick={() => setSearchOpen(true)}>
              <Search size={18} />
            </button>
            
            {user ? (
              <div className="user-nav-group">
                <Link to="/userprofile">
                  <User size={18} />
                </Link>
                <button onClick={handleLogout} className="logout-btn-nav">
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <Link to="/sign-up" className="login-link-nav">
                <User size={18} />
                <span className="nav-label">Login</span>
              </Link>
            )}

            <button onClick={() => setIsCartOpen(true)}>
              <ShoppingCart size={18} />
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
      </div>

      {/* Full-page mobile overlay */}
      <div className={`mobile-overlay ${open ? "active" : ""}`}>
        <div className="mobile-overlay-inner">
          {/* Top section — primary nav links */}
          <div className="mobile-overlay-top">
            <Link
              to="/drops"
              className="overlay-link"
              onClick={() => setOpen(false)}
            >
              Timed Drops
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
            {user ? (
              <>
                <Link to="/userprofile" onClick={() => setOpen(false)}>
                  User Profile ({user.email})
                </Link>
                <button onClick={handleLogout} className="mobile-logout-btn">
                  Logout
                </button>
              </>
            ) : (
              <Link to="/sign-up" onClick={() => setOpen(false)}>
                Sign Up / Login
              </Link>
            )}
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
          <Link to={user ? "/userprofile" : "/sign-up"} className="bottom-nav-item">
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
      </div>
    </>
  );
}
