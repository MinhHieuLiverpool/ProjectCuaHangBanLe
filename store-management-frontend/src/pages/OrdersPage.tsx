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
  FileTextOutlined,
} from "@ant-design/icons";
import { OrderResponse, Customer, Product, Promotion } from "@/types";
import { orderService } from "@/services/order.service";
import { customerService, promotionService } from "@/services/common.service";
import { productService } from "@/services/product.service";
import { useAuth } from "@/context/AuthContext";
import CreateOrderModal from "@/components/Orders/CreateOrderModal";
import html2canvas from "html2canvas";

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
      console.log("Order detail response:", detail);
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

  const handleExportPDF = async (order: OrderResponse) => {
    try {
      // Create a new window for printing
      const printWindow = window.open("", "_blank", "width=800,height=600");

      if (!printWindow) {
        message.error(
          "Không thể mở cửa sổ in. Vui lòng cho phép popup trong trình duyệt."
        );
        return;
      }

      // Get promotion details if available
      let promotionDetails = null;
      if (order.promoId) {
        try {
          const promotion = promotions.find((p) => p.promoId === order.promoId);
          if (promotion) {
            promotionDetails = promotion;
          }
        } catch (error) {
          console.warn("Không thể tải thông tin khuyến mãi:", error);
        }
      }

      // Generate HTML content for printing
      const printContent = `
        <!DOCTYPE html>
        <html lang="vi">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Hóa đơn ${order.orderId}</title>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              margin: 0;
              padding: 20px;
              color: #333;
              line-height: 1.6;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              color: #2c3e50;
            }
            .header h2 {
              margin: 10px 0 0 0;
              font-size: 20px;
              color: #34495e;
            }
            .order-info {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-bottom: 30px;
            }
            .info-section h3 {
              margin: 0 0 10px 0;
              color: #2c3e50;
              font-size: 16px;
              border-bottom: 1px solid #bdc3c7;
              padding-bottom: 5px;
            }
            .info-item {
              margin-bottom: 8px;
            }
            .info-label {
              font-weight: bold;
              display: inline-block;
              width: 120px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            th, td {
              border: 1px solid #bdc3c7;
              padding: 12px;
              text-align: left;
            }
            th {
              background-color: #3498db;
              color: white;
              font-weight: bold;
            }
            tr:nth-child(even) {
              background-color: #f8f9fa;
            }
            .totals {
              margin-top: 30px;
              text-align: right;
            }
            .total-row {
              display: flex;
              justify-content: flex-end;
              margin-bottom: 10px;
            }
            .total-label {
              font-weight: bold;
              width: 150px;
              text-align: right;
              margin-right: 20px;
            }
            .total-amount {
              font-size: 16px;
              font-weight: bold;
            }
            .final-total {
              font-size: 18px;
              color: #e74c3c;
              border-top: 2px solid #333;
              padding-top: 10px;
            }
            .promotion-section {
              margin: 20px 0;
              padding: 15px;
              background-color: #ecf0f1;
              border-radius: 5px;
            }
            .promotion-section h3 {
              margin: 0 0 10px 0;
              color: #27ae60;
            }
            .footer {
              text-align: center;
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #bdc3c7;
              color: #7f8c8d;
            }
            .status-badge {
              display: inline-block;
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 12px;
              font-weight: bold;
            }
            .status-paid {
              background-color: #27ae60;
              color: white;
            }
            .status-pending {
              background-color: #f39c12;
              color: white;
            }
            .status-cancelled {
              background-color: #e74c3c;
              color: white;
            }
            @media print {
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>CỬA HÀNG BÁN LẺ</h1>
            <h2>HÓA ĐƠN BÁN HÀNG</h2>
          </div>

          <div class="order-info">
            <div class="info-section">
              <h3>Thông tin đơn hàng</h3>
              <div class="info-item">
                <span class="info-label">Mã đơn hàng:</span>
                ${order.orderId}
              </div>
              <div class="info-item">
                <span class="info-label">Ngày đặt:</span>
                ${new Date(order.orderDate).toLocaleDateString("vi-VN")}
              </div>
              <div class="info-item">
                <span class="info-label">Trạng thái:</span>
                <span class="status-badge status-${order.status}">
                  ${
                    order.status === "paid"
                      ? "Đã thanh toán"
                      : order.status === "pending"
                      ? "Chờ thanh toán"
                      : "Đã hủy"
                  }
                </span>
              </div>
            </div>

            <div class="info-section">
              <h3>Thông tin khách hàng</h3>
              ${
                order.customerName
                  ? `<div class="info-item"><span class="info-label">Khách hàng:</span>${order.customerName}</div>`
                  : ""
              }
              ${
                order.userName
                  ? `<div class="info-item"><span class="info-label">Nhân viên:</span>${order.userName}</div>`
                  : ""
              }
              ${
                order.paymentMethod
                  ? `<div class="info-item"><span class="info-label">Thanh toán:</span>${
                      order.paymentMethod === "cash"
                        ? "Tiền mặt"
                        : order.paymentMethod === "card"
                        ? "Thẻ"
                        : order.paymentMethod === "bank_transfer"
                        ? "Chuyển khoản"
                        : order.paymentMethod === "e-wallet"
                        ? "Ví điện tử"
                        : order.paymentMethod
                    }</div>`
                  : ""
              }
              ${
                order.paymentDate
                  ? `<div class="info-item"><span class="info-label">Ngày thanh toán:</span>${new Date(
                      order.paymentDate
                    ).toLocaleDateString("vi-VN")}</div>`
                  : ""
              }
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Tên sản phẩm</th>
                <th>Số lượng</th>
                <th>Đơn giá</th>
                <th>Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              ${order.items
                .map(
                  (item) => `
                <tr>
                  <td>${item.productName}</td>
                  <td>${item.quantity}</td>
                  <td>${new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(item.price)}</td>
                  <td>${new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(item.subtotal)}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>

          ${
            order.discountAmount > 0
              ? `
            <div class="promotion-section">
              <h3>Thông tin khuyến mãi</h3>
              ${
                promotionDetails
                  ? `
                <div class="info-item"><span class="info-label">Tên chương trình:</span><strong>${
                  promotionDetails.description || "N/A"
                }</strong></div>
                <div class="info-item"><span class="info-label">Mã khuyến mãi:</span>${
                  promotionDetails.promoCode
                }</div>
                <div class="info-item"><span class="info-label">Loại:</span>${
                  promotionDetails.applyType === "order"
                    ? "Giảm theo hóa đơn"
                    : promotionDetails.applyType === "product"
                    ? "Giảm theo sản phẩm"
                    : promotionDetails.applyType === "combo"
                    ? "Giảm combo"
                    : promotionDetails.applyType
                }</div>
              `
                  : ""
              }
              <div class="info-item"><span class="info-label">Giảm giá:</span><strong>${new Intl.NumberFormat(
                "vi-VN",
                { style: "currency", currency: "VND" }
              ).format(order.discountAmount)}</strong></div>
            </div>
          `
              : ""
          }

          <div class="totals">
            <div class="total-row">
              <span class="total-label">Tổng tiền:</span>
              <span class="total-amount">${new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(order.totalAmount)}</span>
            </div>
            ${
              order.discountAmount > 0
                ? `
              <div class="total-row">
                <span class="total-label">Giảm giá:</span>
                <span class="total-amount">-${new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(order.discountAmount)}</span>
              </div>
            `
                : ""
            }
            <div class="total-row final-total">
              <span class="total-label">Thành tiền:</span>
              <span class="total-amount">${new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(order.finalAmount)}</span>
            </div>
          </div>

          <div class="footer">
            <p>Cảm ơn quý khách đã mua hàng!</p>
            <p>Hẹn gặp lại quý khách lần sau!</p>
          </div>
        </body>
        </html>
      `;

      // Write content to the print window
      printWindow.document.write(printContent);
      printWindow.document.close();

      // Wait for content to load then print
      printWindow.onload = () => {
        printWindow.print();
        message.success(
          'Đã mở cửa sổ in. Vui lòng chọn "Lưu thành PDF" trong hộp thoại in.'
        );
      };
    } catch (error) {
      console.error("Lỗi xuất PDF:", error);
      message.error("Có lỗi xảy ra khi xuất PDF!");
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

      // Đợi một chút để backend cập nhật
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Reload danh sách đơn hàng trước
      await fetchData();

      // Reload chi tiết đơn hàng
      const updatedOrder = await orderService.getById(selectedOrder.orderId);
      setSelectedOrder(updatedOrder);
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
      render: (amount: number) => `${(amount || 0).toLocaleString("vi-VN")}đ`,
      sorter: (a: OrderResponse, b: OrderResponse) =>
        (a.totalAmount || 0) - (b.totalAmount || 0),
    },
    {
      title: "Giảm giá",
      dataIndex: "discountAmount",
      key: "discountAmount",
      render: (amount: number) => `${(amount || 0).toLocaleString("vi-VN")}đ`,
      sorter: (a: OrderResponse, b: OrderResponse) =>
        (a.discountAmount || 0) - (b.discountAmount || 0),
    },
    {
      title: "Thành tiền",
      dataIndex: "finalAmount",
      key: "finalAmount",
      render: (amount: number) => `${(amount || 0).toLocaleString("vi-VN")}đ`,
      sorter: (a: OrderResponse, b: OrderResponse) =>
        (a.finalAmount || 0) - (b.finalAmount || 0),
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
      title: "Thanh toán",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      width: 130,
      render: (method: string) => {
        if (!method)
          return <span style={{ color: "#999" }}>Chưa thanh toán</span>;
        const labels: any = {
          cash: "Tiền mặt",
          card: "Thẻ",
          bank_transfer: "Chuyển khoản",
          "e-wallet": "Ví điện tử",
        };
        const colors: any = {
          cash: "green",
          card: "blue",
          bank_transfer: "purple",
          "e-wallet": "orange",
        };
        return (
          <Tag color={colors[method] || "default"}>
            {labels[method] || method}
          </Tag>
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
          defaultPageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ["10", "50", "100"],
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
          <Button
            key="export-pdf"
            type="default"
            icon={<FileTextOutlined />}
            onClick={() => selectedOrder && handleExportPDF(selectedOrder)}
          >
            Xuất PDF
          </Button>,
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

            {/* Promotion information */}
            {selectedOrder.discountAmount > 0 &&
              (() => {
                // Tìm promotion từ promoId trong database
                const appliedPromotion = selectedOrder.promoId
                  ? promotions.find((p) => p.promoId === selectedOrder.promoId)
                  : null;

                if (appliedPromotion) {
                  const typeText =
                    appliedPromotion.applyType === "order"
                      ? "Giảm theo hóa đơn"
                      : appliedPromotion.applyType === "product"
                      ? "Giảm theo sản phẩm"
                      : appliedPromotion.applyType === "combo"
                      ? "Giảm combo"
                      : "Không xác định";

                  return (
                    <p>
                      <strong>Mã khuyến mãi:</strong>{" "}
                      <Tag color="blue">{appliedPromotion.promoCode}</Tag>{" "}
                      <span style={{ color: "#666", fontSize: "12px" }}>
                        ({typeText})
                      </span>
                    </p>
                  );
                }

                // Nếu không tìm thấy promotion nhưng có discount, hiển thị promoCode nếu có
                if (selectedOrder.promoCode) {
                  return (
                    <p>
                      <strong>Mã khuyến mãi:</strong>{" "}
                      <Tag color="blue">{selectedOrder.promoCode}</Tag>
                    </p>
                  );
                }

                // Fallback cuối cùng
                return (
                  <p>
                    <strong>Mã khuyến mãi:</strong>{" "}
                    <Tag color="orange">Đã áp dụng</Tag>
                  </p>
                );
              })()}

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
                    `${(price || 0).toLocaleString("vi-VN")}đ`,
                },
                {
                  title: "Thành tiền",
                  dataIndex: "subtotal",
                  key: "subtotal",
                  render: (price: number) =>
                    `${(price || 0).toLocaleString("vi-VN")}đ`,
                },
              ]}
              rowKey="productId"
              pagination={false}
              size="small"
            />
            <Divider />
            <div style={{ textAlign: "right" }}>
              <p>
                Tổng tiền:{" "}
                {(selectedOrder.totalAmount || 0).toLocaleString("vi-VN")}đ
              </p>
              {selectedOrder.discountAmount > 0 && (
                <p>
                  Giảm giá: -
                  {(selectedOrder.discountAmount || 0).toLocaleString("vi-VN")}đ
                </p>
              )}
              <h3>
                Thành tiền:{" "}
                {(selectedOrder.finalAmount || 0).toLocaleString("vi-VN")}đ
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
          {(selectedOrder?.finalAmount || 0).toLocaleString("vi-VN")}đ
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
