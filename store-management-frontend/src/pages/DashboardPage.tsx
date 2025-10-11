import React, { useEffect, useState } from "react";
import { Card, Row, Col, Statistic, Table } from "antd";
import {
  ShoppingCartOutlined,
  ShoppingOutlined,
  TeamOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { productService } from "@/services/product.service";
import { orderService } from "@/services/order.service";
import { customerService } from "@/services/common.service";
import { Product, OrderResponse } from "@/types";

const DashboardPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [customerCount, setCustomerCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsData, ordersData, customersData] = await Promise.all([
        productService.getAll(),
        orderService.getAll(),
        customerService.getAll(),
      ]);
      setProducts(productsData);
      setOrders(ordersData);
      setCustomerCount(customersData.length);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = orders.reduce(
    (sum, order) => sum + order.finalAmount,
    0
  );
  const lowStockProducts = products.filter((p) => (p.stockQuantity || 0) < 10);

  const recentOrdersColumns = [
    {
      title: "Mã ĐH",
      dataIndex: "orderId",
      key: "orderId",
    },
    {
      title: "Khách hàng",
      dataIndex: "customerName",
      key: "customerName",
    },
    {
      title: "Tổng tiền",
      dataIndex: "finalAmount",
      key: "finalAmount",
      render: (amount: number) => `${(amount || 0).toLocaleString("vi-VN")}đ`,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const colors: any = {
          pending: "orange",
          paid: "green",
          canceled: "red",
        };
        return <span style={{ color: colors[status] }}>{status}</span>;
      },
    },
  ];

  return (
    <div>
      <h2>Dashboard</h2>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="Tổng sản phẩm"
              value={products.length}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="Tổng đơn hàng"
              value={orders.length}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="Khách hàng"
              value={customerCount}
              prefix={<TeamOutlined />}
              valueStyle={{ color: "#cf1322" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="Doanh thu"
              value={totalRevenue}
              prefix={<DollarOutlined />}
              suffix="đ"
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="Sản phẩm tồn kho thấp" loading={loading}>
            <Table
              dataSource={lowStockProducts}
              columns={[
                {
                  title: "Sản phẩm",
                  dataIndex: "productName",
                  key: "productName",
                },
                {
                  title: "Tồn kho",
                  dataIndex: "stockQuantity",
                  key: "stockQuantity",
                },
              ]}
              rowKey="productId"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Đơn hàng gần đây" loading={loading}>
            <Table
              dataSource={orders.slice(0, 5)}
              columns={recentOrdersColumns}
              rowKey="orderId"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;
