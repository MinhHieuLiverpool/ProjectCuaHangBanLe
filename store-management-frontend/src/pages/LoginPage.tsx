import React, { useState } from "react";
import { Form, Input, Button, message } from "antd";
import { UserOutlined, LockOutlined, ShopOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { LoginRequest } from "@/types";
import "./LoginPage.css";

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const onFinish = async (values: LoginRequest) => {
    setLoading(true);
    try {
      await login(values);
      message.success("Đăng nhập thành công!");
      navigate("/");
    } catch (error: any) {
      message.error(error.response?.data?.message || "Đăng nhập thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <div className="login-card">
          <div className="login-header">
            <ShopOutlined className="store-icon" />
            <h1 className="login-title">Quản lý cửa hàng</h1>
          </div>

          <Form
            name="login"
            className="login-form"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            size="large"
          >
            <Form.Item
              name="username"
              rules={[
                { required: true, message: "Vui lòng nhập tên đăng nhập!" },
              ]}
            >
              <Input prefix={<UserOutlined />} placeholder="Tên đăng nhập" />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block>
                Đăng nhập
              </Button>
            </Form.Item>

            <div className="demo-accounts">
              <h4>Tài khoản demo</h4>
              <div className="demo-account-item">Admin: admin / 123456</div>
              <div className="demo-account-item">Staff: staff01 / 123456</div>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
