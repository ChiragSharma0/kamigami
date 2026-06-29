import { Routes, Route, useLocation } from "react-router-dom";

import Hero from "./components/Hero/hero";
import Navbar from "./components/Navbar/navbar";
import Footer from "./components/Footer/Footer";
import CartSidebar from "./components/CartSidebar/CartSidebar";

import AccountDashboard from "./pages/AccountDashboard/AccountDashboard";
import ProductDetails from "./pages/ProductDetails/ProductDeatils";
import Admin from "./pages/Admin/Admin";
import Login from "./pages/Login/Login";
import Collections from "./pages/Collections/Collections";
import CollectionDetail from "./pages/Collections/CollectionDetail";
import Drops from "./pages/Drops/drops";
import MainContainer from "./components/Main Container/MainContainer";
import AboutPage from "./pages/About Page/AboutPage";
import ScrollToTop from "./components/ScrollToTop";
import ProductSection from "./pages/ProductPages/Product";
import AllProductsPage from "./pages/ProductPages/AllProductsPage";
import ContactUs from "./pages/ContactUs/ContactUs";

const App = () => {

  const location = useLocation();

  // Jis route pe Navbar/Footer hide karna hai
  const hideLayoutRoutes = ["/sign-up", "/about-us"];

  const shouldHideLayout =
    hideLayoutRoutes.includes(location.pathname);

  return (
    <>

      {/* Navbar */}
      {!shouldHideLayout && <Navbar />}

      <ScrollToTop />

      <Routes>
        <Route path="/" element={<MainContainer />} />
        <Route path="/about-us" element={<AboutPage />} />

        <Route path="/userprofile" element={<AccountDashboard />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/all-products/:id" element={<ProductDetails />} />
        <Route path="/all-products" element={<AllProductsPage />} />
        <Route path="/sign-up" element={<Login />} />

        <Route path="/cartsidebar" element={<CartSidebar />} />
        <Route path="/collections" element={<Collections />} />
        <Route path="/collections/:slug" element={<CollectionDetail />} />
        <Route path="/drops" element={<Drops />} />
        <Route path="/contact-us" element={<ContactUs />} />
      </Routes>

      {/* Footer */}
      {!shouldHideLayout && <Footer />}

    </>
  );
};

export default App;