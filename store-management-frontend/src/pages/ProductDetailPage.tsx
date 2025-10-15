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
  CartesianGrid,
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

          <Descriptions.Item label="Giá nhập" span={1}>
            <span style={{ fontSize: "15px", color: "#d32f2f" }}>
              {(product.costPrice || 0).toLocaleString("vi-VN")}đ
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="Giá bán" span={1}>
            <span style={{ fontSize: "15px", color: "#1976d2" }}>
              {product.price.toLocaleString("vi-VN")}đ
            </span>
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
                title="Tồn tính toán"
                value={calculatedStock}
                suffix={product.unit}
                valueStyle={{ color: "#fa8c16", fontSize: "20px" }}
              />
              <div
                style={{
                  fontSize: "12px",
                  color: "#666",
                  marginTop: "4px",
                }}
              >
                = Nhập - Bán
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Statistic
                title="Tồn hệ thống"
                value={systemStock}
                suffix={product.unit}
                valueStyle={{
                  color: systemStock < 10 ? "#ff4d4f" : "#52c41a",
                  fontSize: "20px",
                }}
              />
              <div
                style={{
                  fontSize: "12px",
                  color: "#666",
                  marginTop: "4px",
                }}
              >
                Từ database
              </div>
            </Card>
          </Col>
        </Row>

        {/* Cảnh báo nếu số liệu không khớp */}
        {diff > 0 && (
          <div
            style={{
              padding: "12px",
              background: "#fff7e6",
              border: "1px solid #ffd591",
              borderRadius: "4px",
              marginBottom: "16px",
            }}
          >
            <p style={{ margin: 0, color: "#d46b08", fontSize: "13px" }}>
              ⚠️ <strong>Cảnh báo:</strong> Tồn kho tính toán ({calculatedStock}{" "}
              {product.unit}) không khớp với tồn kho hệ thống ({systemStock}{" "}
              {product.unit}). Chênh lệch:{" "}
              <strong>
                {diff} {product.unit}
              </strong>
              <br />
              <span style={{ fontSize: "12px" }}>
                💡 Có thể do: tồn kho đầu kỳ, điều chỉnh kho, hoặc giao dịch
                chưa được ghi nhận trong lịch sử.
              </span>
            </p>
          </div>
        )}

        {/* Biểu đồ xu hướng */}
        {productHistory.length > 0 && (
          <Card
            title="📊 Biểu đồ xu hướng nhập/xuất theo tháng"
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
