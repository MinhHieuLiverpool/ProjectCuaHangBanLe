import React, { useState } from "react";
import {
  Card,
  Row,
  Col,
  DatePicker,
  Button,
  Space,
  Table,
  Statistic,
  Tabs,
  Tag,
  message, // thông báo
} from "antd";
import {
  DownloadOutlined,
  DollarOutlined,
  ShoppingOutlined,
  RiseOutlined,
  FallOutlined,
} from "@ant-design/icons";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  statisticsService,
  SalesReport,
  InventoryStatistics,
  CustomerStatistics,
} from "@/services/statistics.service";
import dayjs, { Dayjs } from "dayjs";
import * as XLSX from "xlsx";

const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82ca9d", "#ffc658"];

const StatisticsPage: React.FC = () => {
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs().subtract(30, "days"),
    dayjs(),
  ]);
  const [salesReport, setSalesReport] = useState<SalesReport | null>(null);
  const [inventoryStats, setInventoryStats] = useState<InventoryStatistics | null>(null);
  const [customerStats, setCustomerStats] = useState<CustomerStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("sales"); // tab dau tien

  const fetchReports = async () => {
    try {
      setLoading(true);
      const [sales, inventory, customers] = await Promise.all([
        statisticsService.getSalesReport(
          dateRange[0].format("YYYY-MM-DD"),
          dateRange[1].format("YYYY-MM-DD")
        ),
        statisticsService.getInventoryStatistics(10),
        statisticsService.getCustomerStatistics(),
      ]);
      setSalesReport(sales);
      setInventoryStats(inventory);
      setCustomerStats(customers);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchReports();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const handleDateRangeChange = (dates: any) => {
    if (dates && dates[0] && dates[1]) {
      setDateRange([dates[0], dates[1]]);
    }
  };

  const handleExportExcel = () => {
    const today = dayjs().format("DD-MM-YYYY");
    switch (activeTab) {
      case "sales":
        if (salesReport) exportSalesReport(salesReport, today);
        else message.warning("No sales report data to export.");
        break;
      case "inventory":
        if (inventoryStats) exportInventoryReport(inventoryStats, today);
        else message.warning("No inventory data to export.");
        break;
      case "customers":
        if (customerStats) exportCustomerReport(customerStats, today);
        else message.warning("No customer data to export.");
        break;
      default:
        message.error("Invalid tab.");
    }
  };

  const exportSalesReport = (data: SalesReport, date: string) => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Tổng quan
    const summaryData = [
      ["Báo cáo bán hàng từ", dateRange[0].format("DD/MM/YYYY"), "đến", dateRange[1].format("DD/MM/YYYY")],
      [],
      ["Chỉ số", "Giá trị"],
      ["Tổng doanh thu", data.totalRevenue],
      ["Tổng chi phí", data.totalCost],
      ["Lợi nhuận", data.profit],
      ["Tổng đơn hàng", data.totalOrders],
      ["Tổng sản phẩm đã bán", data.totalItemsSold],
    ];
    const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summaryWs, "Tổng quan");

    // Sheet 2: Doanh thu hàng ngày
    const dailyRevenueWs = XLSX.utils.json_to_sheet(data.dailyRevenue.map(item => ({
      'Ngày': dayjs(item.date).format('DD/MM/YYYY'),
      'Doanh thu': item.revenue,
      'Số đơn hàng': item.orderCount
    })));
    XLSX.utils.book_append_sheet(wb, dailyRevenueWs, "Doanh thu hàng ngày");

    // Sheet 3: Top sản phẩm bán chạy
    const topProductsWs = XLSX.utils.json_to_sheet(data.topProducts.map((item, index) => ({
      '#': index + 1,
      'Tên sản phẩm': item.productName,
      'Số lượng bán': item.totalQuantitySold,
      'Doanh thu': item.totalRevenue,
    })));
    XLSX.utils.book_append_sheet(wb, topProductsWs, "Top sản phẩm bán chạy");

    // Sheet 4: Doanh thu theo danh mục
    const categorySalesWs = XLSX.utils.json_to_sheet(data.salesByCategory.map(item => ({
      'Tên danh mục': item.categoryName,
      'Số lượng bán': item.totalQuantity,
      'Doanh thu': item.totalRevenue,
    })));
    XLSX.utils.book_append_sheet(wb, categorySalesWs, "Doanh thu theo danh mục");

    XLSX.writeFile(wb, `Bao_cao_ban_hang_${date}.xlsx`);
  };

  const exportInventoryReport = (data: InventoryStatistics, date: string) => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Tổng quan tồn kho
    const summaryData = [
      ["Báo cáo tồn kho ngày", date],
      [],
      ["Chỉ số", "Giá trị"],
      ["Tổng số loại sản phẩm", data.totalProducts],
      ["Sản phẩm sắp hết hàng (< 10)", data.lowStockProducts],
      ["Sản phẩm đã hết hàng", data.outOfStockProducts],
      ["Tổng giá trị tồn kho", data.totalInventoryValue],
    ];
    const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summaryWs, "Tổng quan tồn kho");

    // Sheet 2: Sản phẩm sắp hết hàng
    const lowStockWs = XLSX.utils.json_to_sheet(data.lowStockItems.map(item => ({
      'Tên sản phẩm': item.productName,
      'Tồn kho hiện tại': item.currentStock,
      'Kho hàng': item.warehouseName,
      'Giá bán': item.price,
    })));
    XLSX.utils.book_append_sheet(wb, lowStockWs, "Sản phẩm sắp hết hàng");

    // Sheet 3: Tồn kho theo kho
    const stockByWarehouseWs = XLSX.utils.json_to_sheet(data.stockByWarehouse.map(item => ({
      'Tên kho': item.warehouseName,
      'Số loại sản phẩm': item.totalProducts,
      'Tổng số lượng': item.totalQuantity,
      'Tổng giá trị': item.totalValue,
    })));
    XLSX.utils.book_append_sheet(wb, stockByWarehouseWs, "Tồn kho theo kho");

    XLSX.writeFile(wb, `Bao_cao_ton_kho_${date}.xlsx`);
  };

  const exportCustomerReport = (data: CustomerStatistics, date: string) => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Tổng quan khách hàng
    const summaryData = [
      ["Báo cáo khách hàng ngày", date],
      [],
      ["Chỉ số", "Giá trị"],
      ["Tổng khách hàng", data.totalCustomers],
      ["Khách hàng mới (tháng này)", data.newCustomersThisMonth],
      ["Khách hàng tích cực", data.activeCustomers],
    ];
    const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summaryWs, "Tổng quan khách hàng");

    // Sheet 2: Top khách hàng
    const topCustomersWs = XLSX.utils.json_to_sheet(data.topCustomers.map((item, index) => ({
      '#': index + 1,
      'Tên khách hàng': item.customerName,
      'Số điện thoại': item.phone,
      'Email': item.email,
      'Số đơn hàng': item.totalOrders,
      'Tổng chi tiêu': item.totalSpent,
    })));
    XLSX.utils.book_append_sheet(wb, topCustomersWs, "Top khách hàng");

    XLSX.writeFile(wb, `Bao_cao_khach_hang_${date}.xlsx`);
  };


  return (
    <div style={{ padding: "24px" }}>
      <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ margin: 0 }}>📊 Báo Cáo & Thống Kê Chi Tiết</h2>
        <Space>
          <RangePicker
            value={dateRange}
            onChange={handleDateRangeChange}
            format="DD/MM/YYYY"
          />
          <Button type="primary" onClick={fetchReports} loading={loading}>
            Tải báo cáo
          </Button>
          <Button icon={<DownloadOutlined />} onClick={handleExportExcel} >Xuất Excel</Button>
        </Space>
      </div>

      
      <Tabs defaultActiveKey="sales" onChange={(key) => setActiveTab(key)}>  {/* cập nhật state active tab */}
        {/* Sales Report Tab */}
        <TabPane tab="💰 Báo cáo bán hàng" key="sales">
          {salesReport && (
            <>
              {/* Summary Cards */}
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                  <Card>
                    <Statistic
                      title="Tổng doanh thu"
                      value={salesReport.totalRevenue}
                      precision={0}
                      prefix={<DollarOutlined />}
                      suffix="₫"
                      valueStyle={{ color: "#3f8600", fontSize: "20px" }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card>
                    <Statistic
                      title="Tổng chi phí"
                      value={salesReport.totalCost}
                      precision={0}
                      prefix={<FallOutlined />}
                      suffix="₫"
                      valueStyle={{ color: "#cf1322", fontSize: "20px" }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card>
                    <Statistic
                      title="Lợi nhuận"
                      value={salesReport.profit}
                      precision={0}
                      prefix={<RiseOutlined />}
                      suffix="₫"
                      valueStyle={{ color: "#1890ff", fontSize: "20px" }}
                    />
                    <div style={{ marginTop: 8, fontSize: "12px", color: "#888" }}>
                      Biên lợi nhuận: {salesReport.profitMargin.toFixed(2)}%
                    </div>
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card>
                    <Statistic
                      title="Tổng đơn hàng"
                      value={salesReport.totalOrders}
                      prefix={<ShoppingOutlined />}
                      valueStyle={{ fontSize: "20px" }}
                    />
                    <div style={{ marginTop: 8, fontSize: "12px", color: "#888" }}>
                      {salesReport.totalItemsSold} sản phẩm đã bán
                    </div>
                  </Card>
                </Col>
              </Row>

              {/* Revenue Chart */}
              <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col xs={24} lg={16}>
                  <Card title="Biểu đồ doanh thu theo ngày" loading={loading}>
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart data={salesReport.dailyRevenue}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="date"
                          tickFormatter={(value) => dayjs(value).format("DD/MM")}
                        />
                        <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                        <Tooltip
                          formatter={(value: number) => formatCurrency(value)}
                          labelFormatter={(label) => dayjs(label).format("DD/MM/YYYY")}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="revenue"
                          stroke="#8884d8"
                          name="Doanh thu"
                          strokeWidth={2}
                        />
                        <Line
                          type="monotone"
                          dataKey="orderCount"
                          stroke="#82ca9d"
                          name="Số đơn hàng"
                          strokeWidth={2}

                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Card>
                </Col>
                <Col xs={24} lg={8}>
                  <Card title="Doanh thu theo danh mục" loading={loading}>
                    <ResponsiveContainer width="100%" height={400}>
                      <PieChart>
                        <Pie
                          data={salesReport.salesByCategory as any}
                          dataKey="totalRevenue"
                          nameKey="categoryName"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label={(entry: any) =>
                            `${entry.categoryName}: ${formatCurrency(entry.totalRevenue)}`
                          }
                        >
                          {salesReport.salesByCategory.map((_entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Card>
                </Col>
              </Row>

              {/* Top Products */}
              <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col xs={24}>
                  <Card title="Top 20 sản phẩm bán chạy nhất" loading={loading}>
                    <Table
                      dataSource={salesReport.topProducts}
                      columns={[
                        {
                          title: "#",
                          key: "index",
                          render: (_text: any, _record: any, index: number) => index + 1,
                          width: 50,
                        },
                        {
                          title: "Sản phẩm",
                          dataIndex: "productName",
                          key: "productName",
                        },
                        {
                          title: "Số lượng bán",
                          dataIndex: "totalQuantitySold",
                          key: "totalQuantitySold",
                          align: "right" as const,
                          render: (value: number) => value.toLocaleString("vi-VN"),
                        },
                        {
                          title: "Doanh thu",
                          dataIndex: "totalRevenue",
                          key: "totalRevenue",
                          align: "right" as const,
                          render: (value: number) => formatCurrency(value),
                        },
                      ]}
                      rowKey="productId"
                      pagination={{ pageSize: 10 }}
                    />
                  </Card>
                </Col>
              </Row>

              {/* Category Sales */}
              <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col xs={24}>
                  <Card title="Doanh thu theo danh mục sản phẩm" loading={loading}>
                    <Table
                      dataSource={salesReport.salesByCategory}
                      columns={[
                        {
                          title: "Danh mục",
                          dataIndex: "categoryName",
                          key: "categoryName",
                        },
                        {
                          title: "Số lượng bán",
                          dataIndex: "totalQuantity",
                          key: "totalQuantity",
                          align: "right" as const,
                          render: (value: number) => value.toLocaleString("vi-VN"),
                        },
                        {
                          title: "Doanh thu",
                          dataIndex: "totalRevenue",
                          key: "totalRevenue",
                          align: "right" as const,
                          render: (value: number) => formatCurrency(value),
                        },
                      ]}
                      rowKey={(record) => record.categoryId?.toString() || "0"}
                      pagination={false}
                    />
                  </Card>
                </Col>
              </Row>
            </>
          )}
        </TabPane>

        {/* Inventory Tab */}
        <TabPane tab="📦 Tồn kho" key="inventory">
          {inventoryStats && (
            <>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                  <Card>
                    <Statistic
                      title="Tổng sản phẩm"
                      value={inventoryStats.totalProducts}
                      valueStyle={{ fontSize: "24px" }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card>
                    <Statistic
                      title="Sắp hết hàng"
                      value={inventoryStats.lowStockProducts}
                      valueStyle={{ color: "#faad14", fontSize: "24px" }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card>
                    <Statistic
                      title="Hết hàng"
                      value={inventoryStats.outOfStockProducts}
                      valueStyle={{ color: "#ff4d4f", fontSize: "24px" }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card>
                    <Statistic
                      title="Giá trị tồn kho"
                      value={inventoryStats.totalInventoryValue}
                      precision={0}
                      suffix="₫"
                      valueStyle={{ fontSize: "24px" }}
                    />
                  </Card>
                </Col>
              </Row>

              <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col xs={24} lg={16}>
                  <Card title="Sản phẩm sắp hết hàng (cần nhập thêm)" loading={loading}>
                    <Table
                      dataSource={inventoryStats.lowStockItems}
                      columns={[
                        {
                          title: "Sản phẩm",
                          dataIndex: "productName",
                          key: "productName",
                        },
                        {
                          title: "Tồn kho",
                          dataIndex: "currentStock",
                          key: "currentStock",
                          align: "right" as const,
                          render: (value: number) => (
                            <Tag color={value === 0 ? "red" : value < 5 ? "orange" : "yellow"}>
                              {value}
                            </Tag>
                          ),
                        },
                        {
                          title: "Kho",
                          dataIndex: "warehouseName",
                          key: "warehouseName",
                        },
                        {
                          title: "Giá bán",
                          dataIndex: "price",
                          key: "price",
                          align: "right" as const,
                          render: (value: number) => formatCurrency(value),
                        },
                      ]}
                      rowKey="productId"
                      pagination={{ pageSize: 10 }}
                    />
                  </Card>
                </Col>
                <Col xs={24} lg={8}>
                  <Card title="Tồn kho theo kho hàng" loading={loading}>
                    <Table
                      dataSource={inventoryStats.stockByWarehouse}
                      columns={[
                        {
                          title: "Kho",
                          dataIndex: "warehouseName",
                          key: "warehouseName",
                        },
                        {
                          title: "Sản phẩm",
                          dataIndex: "totalProducts",
                          key: "totalProducts",
                          align: "right" as const,
                        },
                        {
                          title: "Số lượng",
                          dataIndex: "totalQuantity",
                          key: "totalQuantity",
                          align: "right" as const,
                        },
                        {
                          title: "Giá trị",
                          dataIndex: "totalValue",
                          key: "totalValue",
                          align: "right" as const,
                          render: (value: number) => formatCurrency(value),
                        },
                      ]}
                      rowKey={(record) => record.warehouseId?.toString() || "0"}
                      pagination={false}
                      size="small"
                    />
                  </Card>
                </Col>
              </Row>
            </>
          )}
        </TabPane>

        {/* Customer Tab */}
        <TabPane tab="👥 Khách hàng" key="customers">
          {customerStats && (
            <>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={8}>
                  <Card>
                    <Statistic
                      title="Tổng khách hàng"
                      value={customerStats.totalCustomers}
                      valueStyle={{ fontSize: "24px" }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={8}>
                  <Card>
                    <Statistic
                      title="Khách hàng mới tháng này"
                      value={customerStats.newCustomersThisMonth}
                      valueStyle={{ color: "#52c41a", fontSize: "24px" }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={8}>
                  <Card>
                    <Statistic
                      title="Khách hàng tích cực"
                      value={customerStats.activeCustomers}
                      valueStyle={{ color: "#1890ff", fontSize: "24px" }}
                    />
                  </Card>
                </Col>
              </Row>

              <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col xs={24}>
                  <Card title="Top 20 khách hàng VIP" loading={loading}>
                    <Table
                      dataSource={customerStats.topCustomers}
                      columns={[
                        {
                          title: "#",
                          key: "index",
                          render: (_text: any, _record: any, index: number) => {
                            const medals = ["🥇", "🥈", "🥉"];
                            return index < 3 ? medals[index] : index + 1;
                          },
                          width: 60,
                        },
                        {
                          title: "Khách hàng",
                          dataIndex: "customerName",
                          key: "customerName",
                        },
                        {
                          title: "Số điện thoại",
                          dataIndex: "phone",
                          key: "phone",
                        },
                        {
                          title: "Email",
                          dataIndex: "email",
                          key: "email",
                        },
                        {
                          title: "Số đơn hàng",
                          dataIndex: "totalOrders",
                          key: "totalOrders",
                          align: "right" as const,
                        },
                        {
                          title: "Tổng chi tiêu",
                          dataIndex: "totalSpent",
                          key: "totalSpent",
                          align: "right" as const,
                          render: (value: number) => formatCurrency(value),
                        },
                      ]}
                      rowKey="customerId"
                      pagination={{ pageSize: 10 }}
                    />
                  </Card>
                </Col>
              </Row>
            </>
          )}
        </TabPane>
      </Tabs>
    </div>
  );
};

export default StatisticsPage;
