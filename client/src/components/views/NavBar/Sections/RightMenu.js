/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";
import axios from "axios";
import { Menu, Icon, Badge } from "antd";
import { useDispatch } from "react-redux";
import { USER_SERVER } from "../../../Config";
import { withRouter } from "react-router-dom";
import { useSelector } from "react-redux";
import { logoutUser } from "../../../../_actions/user_actions";

function RightMenu(props) {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);

  const logoutHandler = () => {
    dispatch(logoutUser()).then((response) => {
      if (response.payload.status === 200) {
        props.history.push("/login");
      } else {
        alert("Log Out Failed");
      }
    });
  };

  if (user.userData && !user.userData.isAuth) {
    return (
      <Menu mode={props.mode}>
        <Menu.Item key="mail">
          <a href="/login">Signin</a>
        </Menu.Item>
        <Menu.Item key="app">
          <a href="/register">Signup</a>
        </Menu.Item>
      </Menu>
    );
  } else {
    return (
      <Menu mode={props.mode}>
        <Menu.Item key="my_page">
          <a href="/my_page">My Page</a>
        </Menu.Item>

        <Menu.Item key="upload">
          <a href="/product/upload">Upload</a>
        </Menu.Item>

        <Menu.Item key="cart" style={{ paddingBottom: 3 }}>
          {" "}
          {/** put the padding at the bottom side*/}
          <Badge count={user.userData && user.userData.cart.length}>
            <a
              href="/user/cart"
              className="head-example"
              style={{ marginRight: -22, color: "#667777" }}
            >
              <Icon
                type="shopping-cart"
                style={{ fontSize: 30, marginBottom: 3 }}
              />
            </a>
          </Badge>
        </Menu.Item>

        <Menu.Item key="logout">
          <a onClick={logoutHandler}>Logout</a>
        </Menu.Item>
      </Menu>
    );
  }
}

export default withRouter(RightMenu);
