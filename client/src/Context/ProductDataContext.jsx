import { createContext, useState } from "react";
import SoonImage from "../assets/images/soon.png"; 

export const ProductDataContext = createContext();

export const ProductDataProvider = ({ children }) => {
  const dummyProducts = [
    {
      id: "MN001A12",
      image:SoonImage,
      title: "Men Casual Street T-Shirt",
      description:
        "Stylish slim-fit casual t-shirt perfect for daily wear and street fashion.",
      price: 799,
      category: "men",
      size: "m",
      discount: 10,
    },
    {
      id: "WM002B34",
      image:
        "https://i.pinimg.com/avif/736x/20/76/b5/2076b51059bc6c8ed6f0ad5749977734.avf",
      title: "Women Floral Summer Dress",
      description:
        "Lightweight floral dress ideal for summer outings and casual wear.",
      price: 1499,
      category: "women",
      size: "s",
      discount: 15,
    },
    {
      id: "KD003C56",
      image:
        "https://i.pinimg.com/avif/1200x/3c/73/57/3c7357e36af3751d4d7b289f744f75a4.avf",
      title: "Kids Cotton Graphic T-Shirt",
      description:
        "Soft cotton graphic t-shirt designed for comfort and daily use.",
      price: 499,
      category: "kids",
      size: "l",
      discount: 5,
    },
    {
      id: "MN004D78",
      image:
        "https://i.pinimg.com/736x/88/d2/66/88d266ad8d82b5e3152e8550c988da04.jpg",
      title: "Men Warm Winter Hoodie",
      description:
        "Premium fleece hoodie perfect for winter and outdoor activities.",
      price: 1999,
      category: "men",
      size: "xl",
      discount: 20,
    },
    {
      id: "WM005E90",
      image:
        "https://i.pinimg.com/1200x/92/b4/ce/92b4ced12fb55be974711bee4d9f244e.jpg",
      title: "Women Printed Ethnic Kurti",
      description:
        "Elegant printed kurti suitable for casual and festive occasions.",
      price: 1199,
      category: "women",
      size: "m",
      discount: 12,
    },
    {
      id: "KD006F11",
      image:
        "https://i.pinimg.com/736x/29/e7/09/29e709227fceed8a60bceb7dc5036d82.jpg",
      title: "Kids Winter Jacket",
      description:
        "Warm and lightweight winter jacket designed for kids comfort.",
      price: 1799,
      category: "kids",
      size: "s",
      discount: 18,
    },
  ];

  const [productData, setProductData] = useState(dummyProducts);

  console.log("Context Data:", productData);

  return (
    <ProductDataContext.Provider
      value={{
        productData,
        setProductData,
      }}
    >
      {children}
    </ProductDataContext.Provider>
  );
};
