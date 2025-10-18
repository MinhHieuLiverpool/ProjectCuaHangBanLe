import {
  ArrowLeftOutlined,
  DownloadOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Descriptions,
  Row,
  Select,
  Spin,
  Statistic,
  Table,
  Tag,
  message,
} from "antd";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import * as XLSX from "xlsx";
import api from "../services/api";

interface Product {
  productId: number;
  productName: string;
  barcode?: string;
  categoryId: number;
  categoryName?: string;
  supplierName?: string;
  unit: string;
  costPrice: number;
  price: number;
  stockQuantity?: number;
  description?: string;
  status: string;
  createdAt: string;
}

interface ProductHistory {
  id: number;
  type: "purchase" | "sale";
  date: string;
  referenceNumber: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  supplierName?: string;
  customerName?: string;
  userName?: string;
}

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [productHistory, setProductHistory] = useState<ProductHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"all" | "purchase" | "sale">("all");

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const fetchProductDetails = async () => {
    if (!id) return;

    setLoading(true);
    try {
      // Fetch product info
      const productRes = await api.get(`/products/${id}`);
      setProduct(productRes.data);

      // Fetch product history
      setHistoryLoading(true);
      try {
        const historyRes = await api.get(`/products/${id}/history`);
        setProductHistory(historyRes.data);
      } catch (error) {
        console.error("Không thể tải lịch sử sản phẩm:", error);
        setProductHistory([]);
      } finally {
        setHistoryLoading(false);
      }
    } catch (error) {
      message.error("Không thể tải thông tin sản phẩm!");
      navigate("/products");
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = () => {
    if (!product || productHistory.length === 0) {
      message.warning("Không có dữ liệu để xuất!");
      return;
    }

    // Chuẩn bị dữ liệu
    const excelData = productHistory.map((item) => ({
      Loại: item.type === "purchase" ? "Nhập hàng" : "Bán hàng",
      Ngày: new Date(item.date).toLocaleString("vi-VN"),
      "Mã phiếu": item.referenceNumber || "",
      "Số lượng": item.quantity,
      "Đơn giá": item.unitPrice.toLocaleString("vi-VN") + "đ",
      "Thành tiền": item.totalAmount.toLocaleString("vi-VN") + "đ",
      "Đối tác": item.supplierName || item.customerName || "",
      "Người thực hiện": item.userName || "",
    }));

    // Tạo worksheet
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Tạo workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `SP${product.productId}_LichSu`);

    // Xuất file
    const fileName = `LichSu_${
      product.productName
    }_${new Date().getTime()}.xlsx`;
    XLSX.writeFile(wb, fileName);

    message.success("Xuất Excel thành công!");
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!product) {
    return null;
  }

  // Lọc dữ liệu theo viewMode
  const filteredHistory =
    viewMode === "all"
      ? productHistory
      : productHistory.filter((h) => h.type === viewMode);

  // Tính toán thống kê
  const totalIn = productHistory
    .filter((h) => h.type === "purchase")
    .reduce((sum, h) => sum + h.quantity, 0);
  const totalOut = productHistory
    .filter((h) => h.type === "sale")
    .reduce((sum, h) => sum + h.quantity, 0);
  const calculatedStock = totalIn - totalOut;
  const systemStock = product.stockQuantity || 0;
  const diff = Math.abs(calculatedStock - systemStock);

  // Tính tổng giá trị nhập/bán
  const totalPurchaseValue = productHistory
    .filter((h) => h.type === "purchase")
    .reduce((sum, h) => sum + h.totalAmount, 0);
  const totalSaleValue = productHistory
    .filter((h) => h.type === "sale")
    .reduce((sum, h) => sum + h.totalAmount, 0);

  // Tính giá gần nhất
  const latestPurchasePrice = productHistory
    .filter((h) => h.type === "purchase")
    .sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0]?.unitPrice;

  const latestSalePrice = productHistory
    .filter((h) => h.type === "sale")
    .sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0]?.unitPrice;

  // Dữ liệu cho biểu đồ giá trị theo tháng
  const monthlyValueData = (() => {
    const monthlyData: {
      [key: string]: {
        month: string;
        giaTriNhap: number;
        giaTriBan: number;
      };
    } = {};

    productHistory.forEach((item) => {
      const date = new Date(item.date);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthKey,
          giaTriNhap: 0,
          giaTriBan: 0,
        };
      }

      if (item.type === "purchase") {
        monthlyData[monthKey].giaTriNhap += item.totalAmount;
      } else {
        monthlyData[monthKey].giaTriBan += item.totalAmount;
      }
    });

    return Object.values(monthlyData).sort((a, b) =>
      a.month.localeCompare(b.month)
    );
  })();

  // Dữ liệu cho biểu đồ chênh lệch giá theo từng đợt giao dịch
  const priceMarginData = (() => {
    // Sắp xếp theo thời gian
    const sortedHistory = [...productHistory].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return sortedHistory.map((item, index) => {
      const date = new Date(item.date);
      const displayTime = `${date.getDate()}/${
        date.getMonth() + 1
      } ${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`;

      // Tính chênh lệch so với giá bán hiện tại
      const margin = product.price - item.unitPrice;
      const marginPercent =
        item.unitPrice > 0 ? ((margin / item.unitPrice) * 100).toFixed(1) : "0";

      return {
        time: displayTime,
        donGia: item.unitPrice,
        giaBan: product.price,
        chenhLech: margin,
        chenhLechPercent: parseFloat(marginPercent),
        loai: item.type === "purchase" ? "Nhập" : "Bán",
        index: index + 1,
      };
    });
  })();

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
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
          Quay lại
        </Button>
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          onClick={handleExportExcel}
        >
          Xuất Excel
        </Button>
      </div>

      <Card
        title={
          <div style={{ fontSize: "18px", fontWeight: 600 }}>
            <HistoryOutlined style={{ marginRight: "8px" }} />
            Chi tiết tồn kho & Lịch sử nhập/xuất: {product.productName}
          </div>
        }
        bordered={false}
      >
        {/* Thông tin sản phẩm */}
        <Descriptions
          bordered
          column={2}
          size="small"
          style={{ marginBottom: 20 }}
        >
          <Descriptions.Item label="Mã sản phẩm" span={1}>
            <strong>{product.productId}</strong>
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái" span={1}>
            <Tag color={product.status === "active" ? "green" : "red"}>
              {product.status === "active" ? "Đang bán" : "Ngừng bán"}
            </Tag>
          </Descriptions.Item>

          <Descriptions.Item label="Tên sản phẩm" span={2}>
            <strong style={{ fontSize: "15px" }}>{product.productName}</strong>
          </Descriptions.Item>

          <Descriptions.Item label="Mã vạch" span={2}>
            {product.barcode || <i>Chưa có</i>}
          </Descriptions.Item>

          <Descriptions.Item label="Danh mục" span={1}>
            {product.categoryName || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Nhà cung cấp" span={1}>
            {product.supplierName || "-"}
          </Descriptions.Item>

          <Descriptions.Item label="Đơn vị" span={1}>
            {product.unit}
          </Descriptions.Item>
          <Descriptions.Item label="Tồn kho hệ thống" span={1}>
            <strong
              style={{
                color: systemStock < 10 ? "red" : "green",
                fontSize: "16px",
              }}
            >
              {systemStock}
            </strong>
          </Descriptions.Item>

          <Descriptions.Item label="Giá nhập gần nhất" span={1}>
            <div>
              <span style={{ fontSize: "15px", color: "#d32f2f" }}>
                {(latestPurchasePrice || product.costPrice || 0).toLocaleString(
                  "vi-VN"
                )}
                đ
              </span>
              {latestPurchasePrice &&
                latestPurchasePrice !== product.costPrice && (
                  <div style={{ fontSize: "12px", color: "#666" }}>
                    Hiện tại: {(product.costPrice || 0).toLocaleString("vi-VN")}
                    đ
                  </div>
                )}
            </div>
          </Descriptions.Item>
          <Descriptions.Item label="Giá bán gần nhất" span={1}>
            <div>
              <span style={{ fontSize: "15px", color: "#1976d2" }}>
                {(latestSalePrice || product.price || 0).toLocaleString(
                  "vi-VN"
                )}
                đ
              </span>
              {latestSalePrice && latestSalePrice !== product.price && (
                <div style={{ fontSize: "12px", color: "#666" }}>
                  Hiện tại: {product.price.toLocaleString("vi-VN")}đ
                </div>
              )}
            </div>
          </Descriptions.Item>
        </Descriptions>

        {/* Báo cáo tổng quan */}
        <Row gutter={16} style={{ marginBottom: "20px" }}>
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Statistic
                title="Tổng nhập"
                value={totalIn}
                suffix={product.unit}
                valueStyle={{ color: "#1890ff", fontSize: "20px" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Statistic
                title="Tổng bán"
                value={totalOut}
                suffix={product.unit}
                valueStyle={{ color: "#52c41a", fontSize: "20px" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Statistic
                title="Tổng giá trị nhập"
                value={totalPurchaseValue}
                suffix="đ"
                valueStyle={{ color: "#ff7875", fontSize: "18px" }}
                formatter={(value) => `${value.toLocaleString("vi-VN")}`}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Statistic
                title="Tổng giá trị bán"
                value={totalSaleValue}
                suffix="đ"
                valueStyle={{ color: "#52c41a", fontSize: "18px" }}
                formatter={(value) => `${value.toLocaleString("vi-VN")}`}
              />
            </Card>
          </Col>
        </Row>

        {/* Biểu đồ giá trị tiền nhập/xuất theo tháng */}
        {productHistory.length > 0 && (
          <Card
            title="💰 Biểu đồ giá trị tiền nhập/xuất theo tháng"
            size="small"
            style={{ marginBottom: "20px" }}
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={monthlyValueData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value: number) => `${value.toLocaleString()}đ`}
                />
                <Legend />
                <Bar
                  dataKey="giaTriNhap"
                  fill="#ff7875"
                  name="Giá trị nhập (đ)"
                />
                <Bar
                  dataKey="giaTriBan"
                  fill="#52c41a"
                  name="Giá trị bán (đ)"
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Biểu đồ xu hướng số lượng nhập/xuất theo tháng */}
        {productHistory.length > 0 && (
          <Card
            title="📊 Biểu đồ số lượng nhập/xuất theo tháng"
            size="small"
            style={{ marginBottom: "20px" }}
          >
            <ResponsiveContainer width="100%" height={250}>
              <LineChart
                data={(() => {
                  const monthlyData: {
                    [key: string]: {
                      month: string;
                      nhap: number;
                      ban: number;
                    };
                  } = {};

                  productHistory.forEach((item) => {
                    const date = new Date(item.date);
                    const monthKey = `${date.getFullYear()}-${String(
                      date.getMonth() + 1
                    ).padStart(2, "0")}`;

                    if (!monthlyData[monthKey]) {
                      monthlyData[monthKey] = {
                        month: monthKey,
                        nhap: 0,
                        ban: 0,
                      };
                    }

                    if (item.type === "purchase") {
                      monthlyData[monthKey].nhap += item.quantity;
                    } else {
                      monthlyData[monthKey].ban += item.quantity;
                    }
                  });

                  return Object.values(monthlyData).sort((a, b) =>
                    a.month.localeCompare(b.month)
                  );
                })()}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="nhap"
                  stroke="#1890ff"
                  name="Nhập hàng"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="ban"
                  stroke="#52c41a"
                  name="Bán hàng"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Biểu đồ chênh lệch giá theo từng đợt giao dịch */}
        {productHistory.length > 0 && (
          <Card
            title="📈 Biểu đồ giá nhập/bán & chênh lệch theo từng đợt giao dịch"
            size="small"
            style={{ marginBottom: "20px" }}
          >
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart
                data={priceMarginData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="time"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  yAxisId="left"
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  label={{
                    value: "Giá (đ)",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  label={{
                    value: "Chênh lệch (%)",
                    angle: 90,
                    position: "insideRight",
                  }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div
                          style={{
                            background: "#fff",
                            padding: "10px",
                            border: "1px solid #ccc",
                            borderRadius: "4px",
                          }}
                        >
                          <p style={{ margin: 0, fontWeight: "bold" }}>
                            {data.loai} - {data.time}
                          </p>
                          <p style={{ margin: "4px 0", color: "#ff7875" }}>
                            Đơn giá: {data.donGia.toLocaleString()}đ
                          </p>
                          <p style={{ margin: "4px 0", color: "#1890ff" }}>
                            Giá bán: {data.giaBan.toLocaleString()}đ
                          </p>
                          <p style={{ margin: "4px 0", color: "#52c41a" }}>
                            Chênh lệch: {data.chenhLech.toLocaleString()}đ (
                            {data.chenhLechPercent}%)
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                <Bar
                  yAxisId="left"
                  dataKey="donGia"
                  fill="#ff7875"
                  name="Đơn giá giao dịch"
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="giaBan"
                  stroke="#1890ff"
                  strokeWidth={2}
                  name="Giá bán hiện tại"
                  strokeDasharray="5 5"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="chenhLechPercent"
                  stroke="#52c41a"
                  strokeWidth={2}
                  name="% Chênh lệch"
                />
              </ComposedChart>
            </ResponsiveContainer>
            <div
              style={{
                marginTop: "12px",
                padding: "8px",
                background: "#f0f5ff",
                borderRadius: "4px",
                fontSize: "12px",
              }}
            >
              <p style={{ margin: 0 }}>
                💡 <strong>Ghi chú:</strong>
              </p>
              <ul style={{ margin: "4px 0", paddingLeft: "20px" }}>
                <li>
                  Biểu đồ hiển thị giá nhập/bán của <strong>từng đợt</strong>{" "}
                  giao dịch theo thời gian
                </li>
                <li>
                  <strong>Đơn giá giao dịch</strong> (cột đỏ): Giá thực tế khi
                  nhập/bán tại thời điểm đó
                </li>
                <li>
                  <strong>Giá bán hiện tại</strong> (đường xanh dương nét đứt):
                  Giá bán hiện tại của sản phẩm
                </li>
                <li>
                  <strong>% Chênh lệch</strong> (đường xanh lá): Tỷ lệ chênh
                  lệch giữa giá bán hiện tại và đơn giá giao dịch
                </li>
              </ul>
            </div>
          </Card>
        )}

        {/* Bảng lịch sử */}
        <Card
          title={
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>📋 Chi tiết lịch sử giao dịch</span>
              <Select
                value={viewMode}
                onChange={setViewMode}
                style={{ width: 200 }}
                options={[
                  { label: "Tất cả giao dịch", value: "all" },
                  { label: "Chỉ nhập hàng", value: "purchase" },
                  { label: "Chỉ bán hàng", value: "sale" },
                ]}
              />
            </div>
          }
          size="small"
        >
          <Table
            dataSource={filteredHistory}
            loading={historyLoading}
            rowKey={(record) => `${record.type}-${record.id}-${record.date}`}
            pagination={{
              defaultPageSize: 10,
              showSizeChanger: true,
              pageSizeOptions: ["10", "50", "100"],
              showTotal: (total) => `Tổng ${total} mục`,
            }}
            size="small"
            scroll={{ x: 1000 }}
            columns={[
              {
                title: "Loại",
                dataIndex: "type",
                key: "type",
                width: 100,
                render: (type: string) => (
                  <Tag color={type === "purchase" ? "blue" : "green"}>
                    {type === "purchase" ? "Nhập hàng" : "Bán hàng"}
                  </Tag>
                ),
              },
              {
                title: "Ngày",
                dataIndex: "date",
                key: "date",
                width: 150,
                render: (date: string) =>
                  new Date(date).toLocaleString("vi-VN"),
                sorter: (a, b) =>
                  new Date(a.date).getTime() - new Date(b.date).getTime(),
                defaultSortOrder: "descend" as const,
              },
              {
                title: "Mã phiếu",
                dataIndex: "referenceNumber",
                key: "referenceNumber",
                width: 100,
                align: "center" as const,
                render: (referenceNumber: string) => {
                  if (!referenceNumber) return "-";
                  const match = referenceNumber.match(/\d+/);
                  return match ? parseInt(match[0], 10) : referenceNumber;
                },
              },
              {
                title: "Số lượng",
                dataIndex: "quantity",
                key: "quantity",
                width: 100,
                align: "right" as const,
                render: (quantity: number, record: ProductHistory) => (
                  <span
                    style={{
                      color: record.type === "purchase" ? "#1890ff" : "#52c41a",
                      fontWeight: 600,
                    }}
                  >
                    {record.type === "purchase" ? "+" : "-"}
                    {quantity}
                  </span>
                ),
              },
              {
                title: "Đơn giá",
                dataIndex: "unitPrice",
                key: "unitPrice",
                width: 120,
                align: "right" as const,
                render: (price: number) => `${price.toLocaleString("vi-VN")}đ`,
              },
              {
                title: "Thành tiền",
                dataIndex: "totalAmount",
                key: "totalAmount",
                width: 140,
                align: "right" as const,
                render: (amount: number) => (
                  <strong>{amount.toLocaleString("vi-VN")}đ</strong>
                ),
              },
              {
                title: "Đối tác",
                key: "partner",
                width: 180,
                render: (_, record: ProductHistory) =>
                  record.type === "purchase"
                    ? record.supplierName || "-"
                    : record.customerName || "-",
              },
              {
                title: "Người thực hiện",
                dataIndex: "userName",
                key: "userName",
                width: 150,
                render: (name: string) => name || "-",
              },
            ]}
          />
        </Card>
      </Card>
    </div>
  );
};

export default ProductDetailPage;
