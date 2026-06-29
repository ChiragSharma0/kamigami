import React, { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import "./module.css";
import { ProductDataContext }  from "../../Context/ProductDataContext";
import { customAlphabet } from "nanoid";
import api from "../../services/api";
import toast from "react-hot-toast";

const Admin = () => {
  const { productData, setProductData } = useContext(ProductDataContext);
  const nanoid = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 8);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, reset } = useForm();

  const submitHandler = async (data) => {
    try {
      setLoading(true);
      const specMetadata = {
        specifications: {
          fit: data.fit || "Modern Relaxed / Oversized Silhouette",
          fabric: data.fabric || "240+ GSM Heavyweight Combed Cotton",
          print: data.print || "High-Fidelity Screen Print / Deity Graphic",
          origin: data.origin || "Kamigami Official Sanctum Archives",
          care: data.care || "Machine Wash Cold, Reverse Side Ironing"
        }
      };

      // 1. Local copy with formatted fields
      const localProduct = {
        id: nanoid(),
        title: data.title,
        image: data.image,
        description: data.description,
        price: Number(data.price),
        category: data.category,
        size: data.size,
        discount: Number(data.discount),
        metadata: specMetadata
      };

      // 2. Persist in Backend Database
      try {
        const payload = {
          name: data.title,
          slug: data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Math.floor(1000 + Math.random() * 9000),
          description: data.description,
          basePrice: Number(data.price),
          isDrop: false,
          status: "PUBLISHED",
          metadata: specMetadata,
          variants: [
            {
              sku: `${data.title.toUpperCase().slice(0, 3).replace(/[^A-Z]/g, "AW")}-${data.size.toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
              attributes: { size: data.size.toUpperCase(), color: "Black" },
              initialStock: 100
            }
          ]
        };

        const res = await api.post("/products", payload);
        const serverProduct = res.data?.data?.product;
        if (serverProduct) {
          toast.success("Product created in database sanctum!");
          // Use server ID instead of local nanoid
          localProduct.id = serverProduct.id;
        }
      } catch (err) {
        console.warn("Backend API sync failed, saving locally:", err.message);
        toast.error("Database sync failed, saved locally.");
      }

      const copyData = [...productData];
      copyData.push(localProduct);
      setProductData(copyData);
      reset();
    } catch (err) {
      console.error(err);
      toast.error("Failed to add product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main">
      <h2>Add Product</h2>

      <form onSubmit={handleSubmit(submitHandler)} className="admin-form">
        {/* Product Image */}
        <input
          {...register("image")}
          type="url"
          placeholder="Product Image URL"
          required
        />

        {/* Product Title */}
        <input {...register("title")} type="text" placeholder="Product Title" required />

        {/* Product Description */}
        <textarea
          {...register("description")}
          placeholder="Product Description"
          required
        />

        {/* Product Price */}
        <input {...register("price")} type="number" placeholder="Price ₹" required />

        {/* Category */}
        <select {...register("category")} required>
          <option value="men">Men</option>
          <option value="women">Women</option>
          <option value="kids">Kids</option>
        </select>

        {/* Sizes */}
        <select {...register("size")} required>
          <option value="s">S</option>
          <option value="m">M</option>
          <option value="l">L</option>
          <option value="xl">XL</option>
        </select>

        {/* Discount */}
        <input
          {...register("discount")}
          type="number"
          placeholder="Discount %"
        />

        {/* Specifications Section */}
        <div className="specifications-section-header" style={{ width: "100%", margin: "10px 0 5px", borderBottom: "1px solid rgba(255, 255, 255, 0.1)", paddingBottom: "5px" }}>
          <h4 style={{ color: "#ff1a1a", fontSize: "0.85rem", letterSpacing: "1px" }}>GARMENT SPECIFICATIONS</h4>
        </div>

        <input
          {...register("fit")}
          type="text"
          placeholder="Fit Type (E.g. Modern Relaxed / Oversized)"
        />
        
        <input
          {...register("fabric")}
          type="text"
          placeholder="Fabric (E.g. 240+ GSM Heavyweight Cotton)"
        />

        <input
          {...register("print")}
          type="text"
          placeholder="Print (E.g. High-Fidelity Screen Print)"
        />

        <input
          {...register("origin")}
          type="text"
          placeholder="Origin (E.g. Kamigami Archives)"
        />

        <input
          {...register("care")}
          type="text"
          placeholder="Care (E.g. Machine Wash Cold)"
        />

        <button disabled={loading}>
          {loading ? "Creating Offering..." : "Add Product"}
        </button>
      </form>
    </div>
  );
};

export default Admin;
