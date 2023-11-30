import React, { useEffect } from "react";
import Layout from "../components/layout/Layout";

import { useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { Checkbox, Radio } from "antd";
import { prices } from "../components/Prices";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/cart";

const Home = () => {
  const [cart, setCart] = useCart();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [checked, setChecked] = useState([]);
  const [radio, setRadio] = useState([]);
  const [total, seTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // ...........................................getTotalCount.................................
  const getTotal = async () => {
    try {
      const { data } = await axios.get("/api/v1/product/product-count");
      seTotal(data?.total);
    } catch (error) {
      console.log(error);
    }
  };

  // .............................................getAllProducts..................................
  const getAllProducts = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/v1/product/product-list/${page}`);
      setLoading(false);
      setProducts([...products, ...data.products]);
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };
  // .........................................getAllCategory......................................
  const getAllCategory = async () => {
    try {
      const { data } = await axios.get("/api/v1/category/get-category");
      if (data.success) {
        setCategories(data?.category);
      }
    } catch (error) {
      console.log(`error in getAllCategory client : ${error}`.bgRed);
    }
  };
  // ..........................................filterByCategory....................................
  const handleFilter = (value, id) => {
    let all = [...checked];
    if (value) {
      all.push(id);
    } else {
      all = all.filter((c) => c !== id);
    }
    setChecked(all);
  };
  useEffect(() => {
    getAllCategory();
    getTotal();
  }, []);
  useEffect(() => {
    getAllProducts();
  }, [page]);

  useEffect(() => {
    if (checked.length || radio.length) filterProduct();
  }, [checked, radio]);
  // ...................................get filtered product.........................
  const filterProduct = async () => {
    try {
      const { data } = await axios.post("/api/v1/product/product-filter", {
        checked,
        radio,
      });
      setProducts(data?.products);
      seTotal(data?.total);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <Layout title={"All Product - Best offers"}>
      <div className="row m-3 p-3 ">
        <div className="col-md-2">
          <h6 className="text-centr">Filter By Category</h6>
          <div className="d-flex flex-column">
            {categories?.map((c) => (
              <Checkbox
                key={c._id}
                onChange={(e) => handleFilter(e.target.checked, c._id)}
              >
                {c.name}
              </Checkbox>
            ))}
          </div>
          <h6 className="text-centr mt-3">Filter By Category</h6>
          <div className="d-flex flex-column">
            <Radio.Group onChange={(e) => setRadio(e.target.value)}>
              {prices?.map((p) => (
                <div key={p._id}>
                  <Radio value={p.array}>{p.name}</Radio>
                </div>
              ))}
            </Radio.Group>
          </div>
          <div className="d-flex flex-column mt-3">
            <button
              className="btn btn-danger"
              onClick={() => window.location.reload()}
            >
              Reset Filters
            </button>
          </div>
        </div>
        <div className="col-md-10">
          <h1>All Products</h1>
          <div className="d-flex flex-wrap">
            {products?.map((p) => (
              <div className="card m-2" style={{ width: "16rem" }} key={p._id}>
                <img
                  src={`/api/v1/product/product-photo/${p._id}`}
                  className="card-img-top"
                  alt={p.name}
                  style={{ height: "200px" }}
                />
                <div className="card-body">
                  <h5 className="card-title">{p.name}</h5>
                  <p className="card-text">{p.description}</p>
                  <h4 className="card-title">${p.price}</h4>
                </div>
                <div className="d-flex justify-content-between ">
                  <button
                    type="button"
                    className="btn btn-primary "
                    style={{ width: "49%" }}
                    onClick={() => navigate(`/product/${p.slug}`)}
                  >
                    See More
                  </button>
                  <button
                    type="button"
                    className="btn btn-success"
                    style={{ width: "49%" }}
                    onClick={() => setCart([...cart, p])}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="m-2 p-3">
            {products && products.length < total && (
              <button
                className="btn btn-warning"
                onClick={(e) => {
                  e.preventDefault();
                  setPage(page + 1);
                }}
              >
                {loading ? "Loading" : "Loadmore"}
              </button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
