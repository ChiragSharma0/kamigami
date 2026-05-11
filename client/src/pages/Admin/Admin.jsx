import React, { useContext } from "react";
import { useForm } from "react-hook-form";
import "./module.css";
import { ProductDataContext }  from "../../context/ProductDataContext";
import { customAlphabet } from "nanoid";

const Admin = () => {
  const { productData, setProductData } = useContext(ProductDataContext);
  const nanoid = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 8);

  console.log(productData);

  const { register, handleSubmit, reset } = useForm();

  const submitHandler = (data) => {
    const product = {
      id: nanoid(),
      ...data,
    };

    const copyData = [...productData];
    copyData.push(product);

    setProductData(copyData);

    console.log(copyData);
    reset();
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
        />

        {/* Product Title */}
        <input {...register("title")} type="text" placeholder="Product Title" />

        {/* Product Description */}
        <textarea
          {...register("description")}
          placeholder="Product Description"
        />

        {/* Product Price */}
        <input {...register("price")} type="number" placeholder="Price ₹" />

        {/* Category */}
        <select {...register("category")}>
          <option value="men">Men</option>
          <option value="women">Women</option>
          <option value="kids">Kids</option>
        </select>

        {/* Sizes */}
        <select {...register("size")}>
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

        <button>Add Product</button>
      </form>
    </div>
  );
};

export default Admin;
