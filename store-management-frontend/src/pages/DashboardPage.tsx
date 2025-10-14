import React, { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tabs,
  DatePicker,
  Button,
  Space,
  Tag,
  Avatar,
} from "antd";
import {
  ShoppingCartOutlined,
  ShoppingOutlined,
  TeamOutlined,
  DollarOutlined,
  RiseOutlined,
  FallOutlined,
  StockOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
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
import { statisticsService, DashboardStatistics } from "@/services/statistics.service";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82ca9d"];

const DashboardPage: React.FC = () => {
  const [statistics, setStatistics] = useState<DashboardStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    fetchStatistics();
  }, [days]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const data = await statisticsService.getDashboardStatistics(days);
      setStatistics(data);
    } catch (error) {
      console.error("Error fetching statistics:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const topProductColumns = [
    {
      title: "Sản phẩm",
      dataIndex: "productName",
      key: "productName",
      render: (text: string, record: any) => (
        <Space>
          {record.imageUrl && (
            <Avatar src={record.imageUrl} size="small" shape="square" />
          )}
          <span>{text}</span>
        </Space>
      ),
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
  ];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "orange",
      completed: "green",
      cancelled: "red",
      processing: "blue",
    };
    return colors[status] || "default";
  };

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ margin: 0 }}>📊 Thống Kê & Báo Cáo</h2>
        <Space>
          <Button onClick={() => setDays(7)} type={days === 7 ? "primary" : "default"}>
            7 ngày
          </Button>
          <Button onClick={() => setDays(30)} type={days === 30 ? "primary" : "default"}>
            30 ngày
          </Button>
          <Button onClick={() => setDays(90)} type={days === 90 ? "primary" : "default"}>
            90 ngày
          </Button>
        </Space>
      </div>

      {/* Key Metrics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="Doanh thu hôm nay"
              value={statistics?.todayRevenue || 0}
              precision={0}
              prefix={<DollarOutlined />}
              suffix="₫"
              valueStyle={{ color: "#3f8600", fontSize: "24px" }}
            />
            <div style={{ marginTop: 8, fontSize: "12px", color: "#888" }}>
              {statistics?.todayOrders || 0} đơn hàng
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="Doanh thu tháng này"
              value={statistics?.monthRevenue || 0}
              precision={0}
              prefix={<RiseOutlined />}
              suffix="₫"
              valueStyle={{ color: "#1890ff", fontSize: "24px" }}
            />
            <div style={{ marginTop: 8, fontSize: "12px", color: "#888" }}>
              {statistics?.monthOrders || 0} đơn hàng
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="Sản phẩm"
              value={statistics?.totalProducts || 0}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: "#722ed1", fontSize: "24px" }}
            />
            <div style={{ marginTop: 8, fontSize: "12px", color: "#888" }}>
              <WarningOutlined style={{ color: "#ff4d4f" }} />{" "}
              {statistics?.lowStockProducts || 0} sắp hết hàng
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="Khách hàng"
              value={statistics?.totalCustomers || 0}
              prefix={<TeamOutlined />}
              valueStyle={{ color: "#cf1322", fontSize: "24px" }}
            />
            <div style={{ marginTop: 8, fontSize: "12px", color: "#888" }}>
              {statistics?.activeCustomers || 0} khách hàng tích cực
            </div>
          </Card>
        </Col>
      </Row>

      {/* Additional Metrics */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} sm={8}>
          <Card loading={loading} size="small">
            <Statistic
              title="Doanh thu năm nay"
              value={statistics?.yearRevenue || 0}
              precision={0}
              suffix="₫"
              valueStyle={{ fontSize: "18px" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card loading={loading} size="small">
            <Statistic
              title="Giá trị đơn hàng TB"
              value={statistics?.averageOrderValue || 0}
              precision={0}
              suffix="₫"
              valueStyle={{ fontSize: "18px" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card loading={loading} size="small">
            <Statistic
              title="Tổng đơn hàng tháng"
              value={statistics?.monthOrders || 0}
              valueStyle={{ fontSize: "18px" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts and Tables */}
      <Tabs defaultActiveKey="1" style={{ marginTop: 24 }}>
        <TabPane tab="📈 Doanh thu" key="1">
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={16}>
              <Card title="Biểu đồ doanh thu theo ngày" loading={loading}>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={statistics?.revenueByDate || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) => dayjs(value).format("DD/MM")}
                    />
                    <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        name === "revenue" ? formatCurrency(value) : value,
                        name === "revenue" ? "Doanh thu" : "Số đơn hàng"
                      ]}
                      labelFormatter={(label) => `Ngày: ${dayjs(label).format("DD/MM/YYYY")}`}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#1890ff"
                      name="Doanh thu (₫)"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card title="Phương thức thanh toán" loading={loading}>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statistics?.paymentMethods || []}
                      dataKey="totalAmount"
                      nameKey="method"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {(statistics?.paymentMethods || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="🏆 Sản phẩm bán chạy" key="2">
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={16}>
              <Card title="Top sản phẩm bán chạy" loading={loading}>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={(statistics?.topSellingProducts || []).slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="productName"
                      angle={-45}
                      textAnchor="end"
                      height={100}
                    />
                    <YAxis />
                    <Tooltip formatter={(value: number) => value.toLocaleString("vi-VN")} />
                    <Legend />
                    <Bar dataKey="totalQuantitySold" fill="#8884d8" name="Số lượng bán" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card title="Danh sách chi tiết" loading={loading}>
                <Table
                  dataSource={statistics?.topSellingProducts || []}
                  columns={topProductColumns}
                  rowKey="productId"
                  pagination={{ pageSize: 5 }}
                  size="small"
                />
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="📦 Trạng thái đơn hàng" key="3">
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card title="Phân bổ đơn hàng theo trạng thái" loading={loading}>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statistics?.ordersByStatus || []}
                      dataKey="count"
                      nameKey="status"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={(entry) => `${entry.status}: ${entry.count}`}
                    >
                      {(statistics?.ordersByStatus || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="Chi tiết trạng thái" loading={loading}>
                <Table
                  dataSource={statistics?.ordersByStatus || []}
                  columns={[
                    {
                      title: "Trạng thái",
                      dataIndex: "status",
                      key: "status",
                      render: (status: string) => (
                        <Tag color={getStatusColor(status)}>{status.toUpperCase()}</Tag>
                      ),
                    },
                    {
                      title: "Số lượng",
                      dataIndex: "count",
                      key: "count",
                      align: "right" as const,
                    },
                    {
                      title: "Tổng tiền",
                      dataIndex: "totalAmount",
                      key: "totalAmount",
                      align: "right" as const,
                      render: (value: number) => formatCurrency(value),
                    },
                  ]}
                  rowKey="status"
                  pagination={false}
                  size="small"
                />
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default DashboardPage;
