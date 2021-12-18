import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import ProductImage from "./Sections/ProductImage";
import ProductInfo from "./Sections/ProductInfo";
import { Row, Col } from "antd";
import { getProductDetail } from "../../../_actions/prod_actions";

function DetailProductPage(props) {
  const dispatch = useDispatch();
  const productId = props.match.params.productId;

  const [Product, setProduct] = useState({});

  useEffect(() => {
    if (props?.user?.userData) {
      dispatch(
        getProductDetail({ productId, _id: props?.user?.userData._id })
      ).then((response) => {
        setProduct(response.payload);
      });
    }
  }, [props?.user]);

  return (
    <div style={{ width: "100%", padding: "3rem 4rem" }}>
      {Product && (
        <div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <h1>{Product.title}</h1>
          </div>

          <br />

          <Row gutter={[16, 16]}>
            <Col lg={12} sm={24}>
              {/* ProductImage */}
              <ProductImage detail={Product} />
            </Col>
            <Col lg={12} sm={24}>
              {/* ProductInfo */}
              <ProductInfo detail={Product} />
            </Col>
          </Row>
        </div>
      )}
    </div>
  );
}

export default DetailProductPage;
