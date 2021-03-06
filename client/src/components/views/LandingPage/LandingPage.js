import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Icon, Col, Card, Row, Rate } from "antd";
import Meta from "antd/lib/card/Meta";
import ImageSlider from "../../utils/ImageSlider";
import Checkbox from "./Sections/CheckBox";
import Radiobox from "./Sections/RadioBox";
import SearchFeature from "./Sections/SearchFeature";
import { continents, price } from "./Sections/Datas";
import Links from "./Sections/Links";
import { getProductsSetRecentViews } from "../../../_actions/prod_actions";
import {
  FunnelPlotOutlined,
  EyeOutlined,
  FileSyncOutlined,
} from "@ant-design/icons";

function LandingPage(props) {
  const dispatch = useDispatch();
  const [RecentProducts, setRecentProducts] = useState([]);
  const [Skip, setSkip] = useState(0);
  const [Limit, setLimit] = useState(8);
  const [PostSize, setPostSize] = useState(0);
  const [Filters, setFilters] = useState({
    continents: [],
    price: [],
  });
  const [SearchTerm, setSearchTerm] = useState("");
  const [ShowFilters, setShowFilters] = useState(false);
  const [RecentViewedProducts, setRecentViewedProducts] = useState([]);

  //Get user's data from high ordered component
  useEffect(() => {
    if (props.user?.userData) {
      const body = {
        skip: Skip,
        limit: Limit,
        viewed: true,
        user: props.user.userData,
      };
      getProducts(body);
    }
  }, [props.user?.userData]);

  // Get product's information
  const getProducts = (body) => {
    dispatch(getProductsSetRecentViews(body)).then((response) => {
      if (response.payload.success) {
        const { recentProductInfo, productInfo, postSize } = response.payload;
        if (recentProductInfo) {
          setRecentViewedProducts(recentProductInfo);
        }
        if (body.loadMore) {
          setRecentProducts([...RecentProducts, ...productInfo]);
        } else {
          setRecentProducts(productInfo);
        }
        setPostSize(postSize);
      } else {
        alert(" Fail to get Recently Posts");
      }
    });
  };

  // If the number of products over 8, it will be hide by load more button
  const loadMoreHanlder = () => {
    let skip = Skip + Limit;
    let body = {
      skip: skip,
      limit: Limit,
      loadMore: true,
      filters: Filters,
      viewed: true,
      user: props.user.userData,
    };

    getProducts(body);
    setSkip(skip);
  };

  //Feedback rating function
  const rating = (feedback) => {
    let rating = 0;

    feedback.forEach((item) => (rating += item.rating));

    return rating / feedback.length;
  };

  //Rendering recently posted posts
  const renderRecentlyPosted = RecentProducts.map((product, index) => {
    return (
      <Col lg={6} md={8} xs={24} key={index}>
        <Card
          cover={
            <a href={`/product/${product._id}`}>
              <ImageSlider images={product.images} />
            </a>
          }
        >
          <Meta title={product.title} description={`$${product.price}`} />
          <Rate disabled defaultValue={rating(product.feedback)} />
        </Card>
      </Col>
    );
  });

  //Rendering recently viwed posts
  const renderRecentlyViewed = RecentViewedProducts.map((product, index) => {
    return (
      <Col lg={6} md={8} xs={24} key={index}>
        <Card
          cover={
            <a href={`/product/${product._id}`}>
              <ImageSlider images={product.images} />
            </a>
          }
        >
          <Meta
            title={product.title}
            description={`$${product.price}`}
            style={{ color: "white" }}
          />
          <Rate disabled defaultValue={rating(product.feedback)} />
        </Card>
      </Col>
    );
  });

  //Get Filtered result
  const showFilteredResults = (filters) => {
    let body = {
      skip: 0,
      limit: Limit,
      filters: filters,
      viewed: false,
    };
    getProducts(body);
    setSkip(0);
  };

  // Price filter
  const handlePrice = (value) => {
    const data = price;
    let array = [];

    for (let key in data) {
      if (data[key]._id === parseInt(value, 10)) {
        array = data[key].array;
      }
    }
    return array;
  };

  // Filter handler
  const handleFilters = (filters, category) => {
    const newFilters = { ...Filters };

    newFilters[category] = filters;

    if (category === "price") {
      let priceValues = handlePrice(filters);
      newFilters[category] = priceValues;
    }
    showFilteredResults(newFilters);
    setFilters(newFilters);
  };

  // Search function
  const updateSearchTerm = (newSearchTerm) => {
    let body = {
      skip: 0,
      limit: Limit,
      filters: Filters,
      searchTerm: newSearchTerm,
      viewed: false,
    };

    setSkip(0); //if user clicked more button, skip is not 0
    setSearchTerm(newSearchTerm);
    getProducts(body);
    if (newSearchTerm.length > 0) setShowFilters(true);
    else setShowFilters(false);
  };

  return (
    <div style={{ width: "75%", margin: "3rem auto" }}>
      {/* Search */}
      <Row align={"top"}>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Links />
        </div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <img
            style={{
              minWidth: "60px",
              width: "60px",
              height: "80px",
              margin: "-1.5vw 0 0 -5vw",
            }}
            src={`https://dean-website.s3.ca-central-1.amazonaws.com/icon/dean.png`}
          />
          <h1>Dean's Canada Shop</h1>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            margin: "1rem auto",
          }}
        >
          <SearchFeature refreshFunction={updateSearchTerm} />
        </div>
      </Row>

      {/* Filter */}
      <Row gutter={[16, 16]}>
        <Col lg={12} xs={24}>
          {/* CheckBox */}
          {ShowFilters && (
            <Checkbox
              list={continents}
              handleFilters={(filters) => handleFilters(filters, "continents")}
            />
          )}
        </Col>
        <Col lg={12} xs={24}>
          {/* RadioBox */}
          {ShowFilters && (
            <Radiobox
              list={price}
              handleFilters={(filters) => handleFilters(filters, "price")}
            />
          )}
        </Col>
      </Row>

      {/** Recently viewed posts */}
      {RecentViewedProducts.length > 0 && !ShowFilters ? (
        <div>
          <div style={{ textAlign: "left" }}>
            <h2>
              {" "}
              <EyeOutlined /> Recently Viewed Posts <Icon type="time" />{" "}
            </h2>
          </div>
          <Row gutter={[16, 16]}>{renderRecentlyViewed}</Row>
        </div>
      ) : null}

      {/* Recently Posted */}
      {ShowFilters ? (
        <div style={{ textAlign: "left", marginTop: "2rem" }}>
          <h2>
            <FunnelPlotOutlined /> Results for "{SearchTerm}"{" "}
          </h2>
        </div>
      ) : (
        <div style={{ textAlign: "left", marginTop: "2rem" }}>
          <h2>
            <FileSyncOutlined /> Recently Posted <Icon type="time" />{" "}
          </h2>
        </div>
      )}
      <Row gutter={[16, 16]}>{renderRecentlyPosted}</Row>
      <br />
      {PostSize >= Limit && (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <button onClick={loadMoreHanlder}>More</button>
        </div>
      )}
    </div>
  );
}

export default LandingPage;
