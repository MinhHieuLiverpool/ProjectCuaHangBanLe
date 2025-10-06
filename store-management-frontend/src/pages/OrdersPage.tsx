import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Select,
  InputNumber,
  message,
  Card,
  Row,
  Col,
  Divider,
} from "antd";
import { PlusOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import { OrderResponse, Customer, Product, Promotion } from "@/types";
import { orderService } from "@/services/order.service";
import { customerService, promotionService } from "@/services/common.service";
import { productService } from "@/services/product.service";

interface OrderItem {
  productId: number;
  productName?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(
    null
  );
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordersData, customersData, productsData, promotionsData] =
        await Promise.all([
          orderService.getAll(),
          customerService.getAll(),
          productService.getAll(),
          promotionService.getAll(),
        ]);
      setOrders(ordersData);
      setCustomers(customersData);
      setProducts(productsData);
      setPromotions(promotionsData);
    } catch (error) {
      message.error("Không thể tải dữ liệu!");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    form.resetFields();
    setOrderItems([]);
    setModalVisible(true);
  };

  const handleAddItem = () => {
    const productId = form.getFieldValue("productId");
    const quantity = form.getFieldValue("quantity") || 1;

    if (!productId) {
      message.warning("Vui lòng chọn sản phẩm!");
      return;
    }

    const product = products.find((p) => p.productId === productId);
    if (!product) return;

    const existingItemIndex = orderItems.findIndex(
      (item) => item.productId === productId
    );

    if (existingItemIndex >= 0) {
      const newItems = [...orderItems];
      newItems[existingItemIndex].quantity += quantity;
      newItems[existingItemIndex].totalPrice =
        newItems[existingItemIndex].quantity * product.price;
      setOrderItems(newItems);
    } else {
      setOrderItems([
        ...orderItems,
        {
          productId: product.productId,
          productName: product.productName,
          quantity,
          unitPrice: product.price,
          totalPrice: product.price * quantity,
        },
      ]);
    }

    form.setFieldsValue({ productId: undefined, quantity: 1 });
  };

  const handleRemoveItem = (productId: number) => {
    setOrderItems(orderItems.filter((item) => item.productId !== productId));
  };

  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields(["customerId", "promotionCode"]);

      if (orderItems.length === 0) {
        message.warning("Vui lòng thêm ít nhất 1 sản phẩm!");
        return;
      }

      const orderData = {
        customerId: values.customerId,
        promoCode: values.promotionCode,
        items: orderItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      };

      await orderService.create(orderData);
      message.success("Tạo đơn hàng thành công!");
      setModalVisible(false);
      fetchData();
    } catch (error) {
      message.error("Tạo đơn hàng thất bại!");
    }
  };

  const handleViewDetail = async (order: OrderResponse) => {
    try {
      const detail = await orderService.getById(order.orderId);
      setSelectedOrder(detail);
      setDetailModalVisible(true);
    } catch (error) {
      message.error("Không thể xem chi tiết!");
    }
  };

  const columns = [
    {
      title: "Mã ĐH",
      dataIndex: "orderId",
      key: "orderId",
      width: 80,
    },
    {
      title: "Khách hàng",
      dataIndex: "customerName",
      key: "customerName",
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amount: number) => `${amount.toLocaleString("vi-VN")}đ`,
    },
    {
      title: "Giảm giá",
      dataIndex: "discountAmount",
      key: "discountAmount",
      render: (amount: number) => `${amount.toLocaleString("vi-VN")}đ`,
    },
    {
      title: "Thành tiền",
      dataIndex: "finalAmount",
      key: "finalAmount",
      render: (amount: number) => `${amount.toLocaleString("vi-VN")}đ`,
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
        const labels: any = {
          pending: "Chờ thanh toán",
          paid: "Đã thanh toán",
          canceled: "Đã hủy",
        };
        return (
          <span style={{ color: colors[status] }}>
            {labels[status] || status}
          </span>
        );
      },
    },
    {
      title: "Thao tác",
      key: "action",
      width: 100,
      render: (_: any, record: OrderResponse) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetail(record)}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  const itemColumns = [
    {
      title: "Sản phẩm",
      dataIndex: "productName",
      key: "productName",
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Đơn giá",
      dataIndex: "unitPrice",
      key: "unitPrice",
      render: (price: number) => `${price.toLocaleString("vi-VN")}đ`,
    },
    {
      title: "Thành tiền",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (price: number) => `${price.toLocaleString("vi-VN")}đ`,
    },
    {
      title: "Thao tác",
      key: "action",
      width: 80,
      render: (_: any, record: OrderItem) => (
        <Button
          type="link"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveItem(record.productId)}
        >
          Xóa
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <h2>Quản lý đơn hàng</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Tạo đơn hàng
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={orders}
        rowKey="orderId"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title="Tạo đơn hàng"
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={800}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="customerId"
            label="Khách hàng"
            rules={[{ required: true, message: "Vui lòng chọn khách hàng!" }]}
          >
            <Select
              showSearch
              filterOption={(input, option: any) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {customers.map((cust) => (
                <Select.Option key={cust.customerId} value={cust.customerId}>
                  {cust.name} - {cust.phone}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="promotionCode" label="Mã khuyến mãi">
            <Select allowClear>
              {promotions.map((promo) => (
                <Select.Option key={promo.promoId} value={promo.promoCode}>
                  {promo.promoCode} - Giảm {promo.discountValue}
                  {promo.discountType === "percent" ? "%" : "đ"}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Divider>Thêm sản phẩm</Divider>

          <Row gutter={16}>
            <Col span={14}>
              <Form.Item name="productId" label="Sản phẩm">
                <Select
                  showSearch
                  filterOption={(input, option: any) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {products.map((prod) => (
                    <Select.Option key={prod.productId} value={prod.productId}>
                      {prod.productName} - {prod.price.toLocaleString("vi-VN")}đ
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="quantity" label="Số lượng" initialValue={1}>
                <InputNumber min={1} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item label=" ">
                <Button onClick={handleAddItem} block>
                  Thêm
                </Button>
              </Form.Item>
            </Col>
          </Row>

          <Table
            dataSource={orderItems}
            columns={itemColumns}
            rowKey="productId"
            pagination={false}
            size="small"
          />

          <Card style={{ marginTop: 16 }}>
            <h3>
              Tổng cộng:{" "}
              <strong>{calculateTotal().toLocaleString("vi-VN")}đ</strong>
            </h3>
          </Card>
        </Form>
      </Modal>

      <Modal
        title="Chi tiết đơn hàng"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={700}
      >
        {selectedOrder && (
          <div>
            <p>
              <strong>Mã đơn:</strong> {selectedOrder.orderId}
            </p>
            <p>
              <strong>Khách hàng:</strong> {selectedOrder.customerName}
            </p>
            <p>
              <strong>Ngày tạo:</strong>{" "}
              {new Date(selectedOrder.orderDate).toLocaleString("vi-VN")}
            </p>
            <p>
              <strong>Trạng thái:</strong> {selectedOrder.status}
            </p>
            <Divider />
            <Table
              dataSource={selectedOrder.items}
              columns={[
                {
                  title: "Sản phẩm",
                  dataIndex: "productName",
                  key: "productName",
                },
                { title: "SL", dataIndex: "quantity", key: "quantity" },
                {
                  title: "Đơn giá",
                  dataIndex: "price",
                  key: "price",
                  render: (price: number) =>
                    `${price.toLocaleString("vi-VN")}đ`,
                },
                {
                  title: "Thành tiền",
                  dataIndex: "subtotal",
                  key: "subtotal",
                  render: (price: number) =>
                    `${price.toLocaleString("vi-VN")}đ`,
                },
              ]}
              rowKey="productId"
              pagination={false}
              size="small"
            />
            <Divider />
            <div style={{ textAlign: "right" }}>
              <p>
                Tổng tiền: {selectedOrder.totalAmount.toLocaleString("vi-VN")}đ
              </p>
              <p>
                Giảm giá: -
                {selectedOrder.discountAmount.toLocaleString("vi-VN")}đ
              </p>
              <h3>
                Thành tiền: {selectedOrder.finalAmount.toLocaleString("vi-VN")}đ
              </h3>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OrdersPage;
