import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

import { BrowserRouter } from "react-router-dom";

import { ProductDataProvider } 
from "./context/ProductDataContext";

import { CartProvider } 
from "./Context/CartContext";

ReactDOM.createRoot(document.getElementById("root")).render(

  <React.StrictMode>

    <ProductDataProvider>

      <CartProvider>

        <BrowserRouter>

          <App />

        </BrowserRouter>

      </CartProvider>

    </ProductDataProvider>

  </React.StrictMode>

);