import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Input, Rate, Button, message } from "antd";
import axios from "axios";
import Product_In_Feedback from "./Sections/Product_In_Feedback";
import { getProdInfoAndFeedbacks } from "../../../_actions/prod_actions";

const { TextArea } = Input;

function LeaveFeedback(props) {
  const dispatch = useDispatch();
  const [TextValue, setTextValue] = useState("");
  const [Product, setProduct] = useState();
  const [Stars, setStars] = useState(5);

  //Get a product info with feedbacks
  useEffect(() => {
    if (props.match.params?.productId) {
      dispatch(
        getProdInfoAndFeedbacks({ productId: props.match.params.productId })
      )
        .then((response) => {
          setProduct(response.payload[0]);
        })
        .catch((err) => alert(err));
    }
  }, []);

  const onChange = (e) => {
    setTextValue(e.target.value);
  };

  const RateHandleChange = (stars) => {
    setStars(stars);
  };
  //Store feedback to the product collection
  const onSubmit = (event) => {
    event.preventDefault();

    if (!TextValue.length === 0) {
      return message.error("No blank is allowed");
    }

    let body = {
      productId: Product._id,
      stars: Stars,
      feedback: TextValue,
      type: "Feedback",
    };

    axios.post("/api/product", body).then((response) => {
      if (response.data.success) {
        message.success("Upload success");
        props.history.push("/my_page");
      } else {
        message.error("Upload Fail");
      }
    });
  };

  return (
    <form onSubmit={() => onSubmit}>
      <div style={{ width: "70%", margin: "auto" }}>
        <Product_In_Feedback product={Product} />
      </div>
      <br />
      <div style={{ display: "flex", justifyContent: "center" }}>
        Rate This Product
      </div>
      <br />
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Rate onChange={RateHandleChange} value={Stars} />
      </div>
      <br />
      <div style={{ display: "flex", justifyContent: "center" }}>
        <TextArea
          onChange={onChange}
          allowClear={true}
          onPressEnter={onSubmit}
          maxLength={200}
          style={{ width: "50%" }}
          value={TextValue}
          placeholder="Only 200 Characters"
        />
      </div>
      <br />
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Button onClick={onSubmit}>Submit</Button>
      </div>
    </form>
  );
}

export default LeaveFeedback;
