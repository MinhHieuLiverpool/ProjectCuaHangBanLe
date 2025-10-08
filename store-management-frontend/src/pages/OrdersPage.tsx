import React, { useEffect, useState, useMemo } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Select,
  message,
  Card,
  Row,
  Col,
  Divider,
  Input,
  Tag,
  DatePicker,
  Space,
  InputNumber,
} from "antd";
import {
  PlusOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SearchOutlined,
  FilterOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { OrderResponse, Customer, Product, Promotion } from "@/types";
import { orderService } from "@/services/order.service";
import { customerService, promotionService } from "@/services/common.service";
import { productService } from "@/services/product.service";
import { useAuth } from "@/context/AuthContext";
import CreateOrderModal from "@/components/Orders/CreateOrderModal";

const OrdersPage: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [customerModalVisible, setCustomerModalVisible] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(
    null
  );
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("cash");
  const [customerForm] = Form.useForm();

  // Filter states
  const [searchText, setSearchText] = useState("");
  const [filterCustomerId, setFilterCustomerId] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number] | null>(null);
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);

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
    setModalVisible(true);
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

  const handleAddCustomer = () => {
    customerForm.resetFields();
    setCustomerModalVisible(true);
  };

  const handleCustomerSubmit = async () => {
    try {
      const values = await customerForm.validateFields();
      await customerService.create(values);
      message.success("Thêm khách hàng thành công!");
      setCustomerModalVisible(false);

      // Reload danh sách khách hàng
      const customersData = await customerService.getAll();
      setCustomers(customersData);
    } catch (error) {
      message.error("Thêm khách hàng thất bại!");
    }
  };

  const handleUpdateOrderStatus = async (
    orderId: number,
    newStatus: string
  ) => {
    // If changing to paid, show payment method modal
    if (newStatus === "paid") {
      setPaymentModalVisible(true);
      return;
    }

    // For canceled status, update directly
    try {
      await orderService.updateStatus(orderId, newStatus);
      message.success("Cập nhật trạng thái đơn hàng thành công!");

      // Reload chi tiết đơn hàng
      const updatedOrder = await orderService.getById(orderId);
      setSelectedOrder(updatedOrder);

      // Reload danh sách đơn hàng
      fetchData();
    } catch (error) {
      message.error("Cập nhật trạng thái thất bại!");
    }
  };

  const handlePaymentConfirm = async () => {
    if (!selectedOrder) return;

    try {
      await orderService.updateStatus(
        selectedOrder.orderId,
        "paid",
        selectedPaymentMethod
      );
      message.success("Thanh toán thành công!");
      setPaymentModalVisible(false);

      // Reload chi tiết đơn hàng
      const updatedOrder = await orderService.getById(selectedOrder.orderId);
      setSelectedOrder(updatedOrder);

      // Reload danh sách đơn hàng
      fetchData();
    } catch (error) {
      message.error("Thanh toán thất bại!");
    }
  };

  const handleResetFilters = () => {
    setSearchText("");
    setFilterCustomerId(null);
    setFilterStatus(null);
    setDateRange(null);
    setPriceRange(null);
  };

  // Filter and search logic
  const filteredOrders = useMemo(() => {
    let filtered = [...orders];

    // Text search (Mã đơn hàng hoặc tên khách hàng)
    if (searchText) {
      filtered = filtered.filter(
        (order) =>
          order.orderId.toString().includes(searchText) ||
          order.customerName?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Filter by customer
    if (filterCustomerId) {
      filtered = filtered.filter(
        (order) => order.customerId === filterCustomerId
      );
    }

    // Filter by status
    if (filterStatus) {
      filtered = filtered.filter((order) => order.status === filterStatus);
    }

    // Filter by date range
    if (dateRange && dateRange[0] && dateRange[1]) {
      const startDate = new Date(dateRange[0]);
      const endDate = new Date(dateRange[1]);
      endDate.setHours(23, 59, 59, 999); // Include end of day

      filtered = filtered.filter((order) => {
        const orderDate = new Date(order.orderDate);
        return orderDate >= startDate && orderDate <= endDate;
      });
    }

    // Filter by price range
    if (priceRange && priceRange[0] !== null && priceRange[1] !== null) {
      filtered = filtered.filter(
        (order) =>
          order.finalAmount >= priceRange[0] &&
          order.finalAmount <= priceRange[1]
      );
    }

    return filtered;
  }, [
    orders,
    searchText,
    filterCustomerId,
    filterStatus,
    dateRange,
    priceRange,
  ]);

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
      title: "Thời gian",
      dataIndex: "orderDate",
      key: "orderDate",
      width: 160,
      render: (date: string) => new Date(date).toLocaleString("vi-VN"),
      sorter: (a: OrderResponse, b: OrderResponse) =>
        new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime(),
      defaultSortOrder: "descend" as const,
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amount: number) => `${amount.toLocaleString("vi-VN")}đ`,
      sorter: (a: OrderResponse, b: OrderResponse) =>
        a.totalAmount - b.totalAmount,
    },
    {
      title: "Giảm giá",
      dataIndex: "discountAmount",
      key: "discountAmount",
      render: (amount: number) => `${amount.toLocaleString("vi-VN")}đ`,
      sorter: (a: OrderResponse, b: OrderResponse) =>
        a.discountAmount - b.discountAmount,
    },
    {
      title: "Thành tiền",
      dataIndex: "finalAmount",
      key: "finalAmount",
      render: (amount: number) => `${amount.toLocaleString("vi-VN")}đ`,
      sorter: (a: OrderResponse, b: OrderResponse) =>
        a.finalAmount - b.finalAmount,
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

  return (
    <div>
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2>Quản lý đơn hàng</h2>
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={handleResetFilters}
            title="Reset tất cả bộ lọc"
          >
            Reset
          </Button>
          <Button
            icon={<FilterOutlined />}
            onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}
          >
            {showAdvancedFilter ? "Ẩn bộ lọc" : "Bộ lọc nâng cao"}
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            Tạo đơn hàng
          </Button>
        </Space>
      </div>

      {/* Search and Filter Section */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Tìm theo mã đơn hoặc tên khách hàng"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Select
              placeholder="Lọc theo khách hàng"
              style={{ width: "100%" }}
              value={filterCustomerId}
              onChange={setFilterCustomerId}
              allowClear
              showSearch
              filterOption={(input, option: any) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {customers.map((cust) => (
                <Select.Option
                  key={cust.customerId}
                  value={cust.customerId}
                  label={`${cust.name} - ${cust.phone}`}
                >
                  {cust.name} - {cust.phone}
                </Select.Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Select
              placeholder="Lọc theo trạng thái"
              style={{ width: "100%" }}
              value={filterStatus}
              onChange={setFilterStatus}
              allowClear
            >
              <Select.Option value="pending" label="Chờ thanh toán">
                Chờ thanh toán
              </Select.Option>
              <Select.Option value="paid" label="Đã thanh toán">
                Đã thanh toán
              </Select.Option>
              <Select.Option value="canceled" label="Đã hủy">
                Đã hủy
              </Select.Option>
            </Select>
          </Col>
        </Row>

        {showAdvancedFilter && (
          <>
            <Divider style={{ margin: "16px 0" }} />
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <label style={{ display: "block", marginBottom: 8 }}>
                  Khoảng thời gian:
                </label>
                <DatePicker.RangePicker
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                  placeholder={["Từ ngày", "Đến ngày"]}
                  onChange={(dates) => {
                    if (dates && dates[0] && dates[1]) {
                      setDateRange([
                        dates[0].toISOString(),
                        dates[1].toISOString(),
                      ]);
                    } else {
                      setDateRange(null);
                    }
                  }}
                />
              </Col>
              <Col xs={24} sm={12}>
                <label style={{ display: "block", marginBottom: 8 }}>
                  Khoảng giá:
                </label>
                <Row gutter={8}>
                  <Col span={11}>
                    <InputNumber
                      style={{ width: "100%" }}
                      placeholder="Từ giá"
                      min={0}
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      onChange={(value) => {
                        if (value !== null) {
                          setPriceRange([value, priceRange?.[1] ?? 999999999]);
                        }
                      }}
                    />
                  </Col>
                  <Col
                    span={2}
                    style={{ textAlign: "center", lineHeight: "32px" }}
                  >
                    -
                  </Col>
                  <Col span={11}>
                    <InputNumber
                      style={{ width: "100%" }}
                      placeholder="Đến giá"
                      min={0}
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      onChange={(value) => {
                        if (value !== null) {
                          setPriceRange([priceRange?.[0] ?? 0, value]);
                        }
                      }}
                    />
                  </Col>
                </Row>
              </Col>
            </Row>
          </>
        )}
      </Card>

      <Table
        columns={columns}
        dataSource={filteredOrders}
        rowKey="orderId"
        loading={loading}
        pagination={{
          pageSize: 10,
          showTotal: (total) => `Tổng ${total} đơn hàng`,
        }}
      />

      <CreateOrderModal
        visible={modalVisible}
        customers={customers}
        products={products}
        promotions={promotions}
        userId={user?.userId || 0}
        onClose={() => setModalVisible(false)}
        onSuccess={() => {
          setModalVisible(false);
          fetchData();
        }}
        onAddCustomer={handleAddCustomer}
      />

      <Modal
        title="Chi tiết đơn hàng"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          selectedOrder?.status === "pending" && (
            <Button
              key="paid"
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={() =>
                handleUpdateOrderStatus(selectedOrder.orderId, "paid")
              }
            >
              Đánh dấu đã thanh toán
            </Button>
          ),
          selectedOrder?.status === "pending" && (
            <Button
              key="cancel"
              danger
              icon={<CloseCircleOutlined />}
              onClick={() =>
                handleUpdateOrderStatus(selectedOrder.orderId, "canceled")
              }
            >
              Hủy đơn hàng
            </Button>
          ),
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
              <strong>Trạng thái:</strong>{" "}
              {selectedOrder.status === "pending" && (
                <Tag color="orange">Chờ thanh toán</Tag>
              )}
              {selectedOrder.status === "paid" && (
                <Tag color="green">Đã thanh toán</Tag>
              )}
              {selectedOrder.status === "canceled" && (
                <Tag color="red">Đã hủy</Tag>
              )}
            </p>

            {/* Payment information */}
            {selectedOrder.paymentMethod && (
              <>
                <p>
                  <strong>Phương thức thanh toán:</strong>{" "}
                  {selectedOrder.paymentMethod === "cash" && "Tiền mặt"}
                  {selectedOrder.paymentMethod === "card" && "Thẻ"}
                  {selectedOrder.paymentMethod === "bank_transfer" &&
                    "Chuyển khoản"}
                  {selectedOrder.paymentMethod === "e-wallet" && "Ví điện tử"}
                </p>
                {selectedOrder.paymentDate && (
                  <p>
                    <strong>Thời gian thanh toán:</strong>{" "}
                    {new Date(selectedOrder.paymentDate).toLocaleString(
                      "vi-VN"
                    )}
                  </p>
                )}
              </>
            )}

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

      {/* Modal thêm khách hàng mới */}
      <Modal
        title="Thêm khách hàng mới"
        open={customerModalVisible}
        onOk={handleCustomerSubmit}
        onCancel={() => setCustomerModalVisible(false)}
        okText="Thêm"
        cancelText="Hủy"
      >
        <Form form={customerForm} layout="vertical">
          <Form.Item
            name="name"
            label="Tên khách hàng"
            rules={[
              { required: true, message: "Vui lòng nhập tên khách hàng!" },
            ]}
          >
            <Input placeholder="Nhập tên khách hàng" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[
              { required: true, message: "Vui lòng nhập số điện thoại!" },
              {
                pattern: /^[0-9]{10,11}$/,
                message: "Số điện thoại không hợp lệ!",
              },
            ]}
          >
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[{ type: "email", message: "Email không hợp lệ!" }]}
          >
            <Input placeholder="Nhập email (tùy chọn)" />
          </Form.Item>

          <Form.Item name="address" label="Địa chỉ">
            <Input.TextArea placeholder="Nhập địa chỉ (tùy chọn)" rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal chọn phương thức thanh toán */}
      <Modal
        title="Chọn phương thức thanh toán"
        open={paymentModalVisible}
        onOk={handlePaymentConfirm}
        onCancel={() => setPaymentModalVisible(false)}
        okText="Xác nhận thanh toán"
        cancelText="Hủy"
      >
        <p style={{ marginBottom: 16 }}>
          <strong>Số tiền thanh toán:</strong>{" "}
          {selectedOrder?.finalAmount.toLocaleString("vi-VN")}đ
        </p>
        <Form.Item label="Phương thức thanh toán">
          <Select
            value={selectedPaymentMethod}
            onChange={setSelectedPaymentMethod}
            style={{ width: "100%" }}
          >
            <Select.Option value="cash" label="💵 Tiền mặt">
              💵 Tiền mặt
            </Select.Option>
            <Select.Option value="card" label="💳 Thẻ">
              💳 Thẻ
            </Select.Option>
            <Select.Option value="bank_transfer" label="🏦 Chuyển khoản">
              🏦 Chuyển khoản
            </Select.Option>
            <Select.Option value="e-wallet" label="📱 Ví điện tử">
              📱 Ví điện tử
            </Select.Option>
          </Select>
        </Form.Item>
      </Modal>
    </div>
  );
};

export default OrdersPage;
