import { categoryService } from "@/services/common.service";
import { Category } from "@/types";
import AdvancedSearchFilter from "@/components/AdvancedSearchFilter";
import {
  BarChartOutlined,
  DownloadOutlined,
  EyeOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { Button, Card, Col, message, Row, Statistic, Table } from "antd";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import * as XLSX from "xlsx";
import api from "../services/api";

interface InventoryItem {
  inventoryId: number;
  productId: number;
  productName: string;
  categoryName: string;
  warehouseId?: number;
  warehouseName?: string;
  quantity: number;
  unit: string;
  costPrice: number;
  price: number;
  updatedAt: string;
}

const InventoryPage: React.FC = () => {
  const [inventories, setInventories] = useState<InventoryItem[]>([]);
  const [filteredInventories, setFilteredInventories] = useState<
    InventoryItem[]
  >([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchText, setSearchText] = useState("");
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number] | null>(null);
  const LOW_STOCK_THRESHOLD = 30; // Ngưỡng cảnh báo cố định

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterInventories();
  }, [inventories, selectedCategory, searchText, dateRange, priceRange]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [inventoryData, categoryData] = await Promise.all([
        api.get("/inventory").then((res) => res.data),
        categoryService.getAll(),
      ]);
      setInventories(inventoryData);
      setCategories(categoryData);
    } catch (error) {
      message.error("Không thể tải dữ liệu tồn kho!");
    } finally {
      setLoading(false);
    }
  };

  const filterInventories = () => {
    let filtered = [...inventories];

    if (selectedCategory) {
      filtered = filtered.filter((item) => {
        // Tìm category của product
        const category = categories.find(
          (c) => c.categoryName === item.categoryName
        );
        return category?.categoryId === selectedCategory;
      });
    }

    if (searchText.trim()) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.productName.toLowerCase().includes(search) ||
          item.categoryName?.toLowerCase().includes(search)
      );
    }

    // Lọc theo khoảng thời gian (updatedAt)
    if (dateRange) {
      const [startDate, endDate] = dateRange;
      filtered = filtered.filter((item) => {
        if (!item.updatedAt) return false;
        const itemDate = new Date(item.updatedAt).toISOString().split("T")[0];
        return itemDate >= startDate && itemDate <= endDate;
      });
    }

    // Lọc theo khoảng giá (giá trị tồn kho)
    if (priceRange) {
      const [minPrice, maxPrice] = priceRange;
      filtered = filtered.filter((item) => {
        const totalValue = (item.quantity || 0) * (item.costPrice || 0);
        return totalValue >= minPrice && totalValue <= maxPrice;
      });
    }

    setFilteredInventories(filtered);
  };

  const handleResetFilters = () => {
    setSearchText("");
    setSelectedCategory(null);
    setDateRange(null);
    setPriceRange(null);
  };

  const handleExportExcel = () => {
    if (filteredInventories.length === 0) {
      message.warning("Không có dữ liệu để xuất!");
      return;
    }

    const excelData = filteredInventories.map((item) => ({
      "Mã SP": item.productId || "",
      "Tên sản phẩm": item.productName || "",
      "Tồn kho": item.quantity || 0,
      "Giá nhập": item.costPrice || 0,
      "Giá bán": item.price || 0,
      "Giá trị tồn": (item.quantity || 0) * (item.costPrice || 0),
      "Cập nhật": item.updatedAt
        ? new Date(item.updatedAt).toLocaleString("vi-VN")
        : "-",
    }));

    const ws = XLSX.utils.json_to_sheet(excelData);
    ws["!cols"] = [
      { wch: 8 },
      { wch: 25 },
      { wch: 10 },
      { wch: 12 },
      { wch: 12 },
      { wch: 15 },
      { wch: 18 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Tồn kho");

    const fileName = `TonKho_${new Date()
      .toLocaleDateString("vi-VN")
      .replace(/\//g, "-")}_${new Date().getTime()}.xlsx`;
    XLSX.writeFile(wb, fileName);

    message.success(`Đã xuất ${filteredInventories.length} sản phẩm ra Excel!`);
  };

  // Tính tổng số liệu
  const totalQuantity = filteredInventories.reduce(
    (sum, item) => sum + (item.quantity || 0),
    0
  );
  const totalValue = filteredInventories.reduce(
    (sum, item) => sum + (item.quantity || 0) * (item.costPrice || 0),
    0
  );
  const lowStockCount = filteredInventories.filter(
    (item) =>
      (item.quantity || 0) < LOW_STOCK_THRESHOLD && (item.quantity || 0) > 0
  ).length;
  const outOfStockCount = filteredInventories.filter(
    (item) => (item.quantity || 0) === 0
  ).length;

  const columns = [
    {
      title: "Mã SP",
      dataIndex: "productId",
      key: "productId",
      width: 80,
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "productName",
      key: "productName",
      width: 200,
    },
    {
      title: "Tồn kho",
      dataIndex: "quantity",
      key: "quantity",
      width: 100,
      align: "right" as const,
      render: (quantity: number) => (
        <span
          style={{
            color:
              quantity === 0
                ? "red"
                : quantity < LOW_STOCK_THRESHOLD
                ? "orange"
                : "inherit",
            fontWeight: quantity < LOW_STOCK_THRESHOLD ? "bold" : "normal",
          }}
        >
          {quantity}
        </span>
      ),
      sorter: (a: InventoryItem, b: InventoryItem) => a.quantity - b.quantity,
    },
    {
      title: "Giá nhập",
      dataIndex: "costPrice",
      key: "costPrice",
      width: 120,
      align: "right" as const,
      render: (price: number) =>
        price ? `${price.toLocaleString("vi-VN")}đ` : "0đ",
    },
    {
      title: "Giá trị tồn",
      key: "totalValue",
      width: 130,
      align: "right" as const,
      render: (_: any, record: InventoryItem) => (
        <strong>
          {((record.quantity || 0) * (record.costPrice || 0)).toLocaleString(
            "vi-VN"
          )}
          đ
        </strong>
      ),
      sorter: (a: InventoryItem, b: InventoryItem) =>
        (a.quantity || 0) * (a.costPrice || 0) -
        (b.quantity || 0) * (b.costPrice || 0),
    },
    {
      title: "Cập nhật",
      dataIndex: "updatedAt",
      key: "updatedAt",
      width: 150,
      render: (date: string) =>
        date ? new Date(date).toLocaleString("vi-VN") : "-",
      sorter: (a: InventoryItem, b: InventoryItem) =>
        new Date(a.updatedAt || 0).getTime() -
        new Date(b.updatedAt || 0).getTime(),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 120,
      fixed: "right" as const,
      render: (_: any, record: InventoryItem) => (
        <Link to={`/products/${record.productId}`}>
          <Button type="link" size="small" icon={<EyeOutlined />}>
            Chi tiết
          </Button>
        </Link>
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
        <h2>
          <BarChartOutlined /> Quản lý tồn kho
        </h2>
        <Button
          type="default"
          icon={<DownloadOutlined />}
          onClick={handleExportExcel}
        >
          Xuất Excel
        </Button>
      </div>

      {/* Thống kê tổng quan */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng số lượng tồn"
              value={totalQuantity}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng giá trị tồn"
              value={totalValue}
              suffix="đ"
              valueStyle={{ color: "#1890ff" }}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Sản phẩm sắp hết (< 30)"
              value={lowStockCount}
              valueStyle={{ color: "#fa8c16" }}
              prefix={<WarningOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Sản phẩm hết hàng"
              value={outOfStockCount}
              valueStyle={{ color: "#cf1322" }}
              prefix={<WarningOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Bộ lọc nâng cao */}
      <AdvancedSearchFilter
        searchText={searchText}
        onSearchChange={setSearchText}
        searchPlaceholder="Tìm kiếm sản phẩm..."
        categories={categories.map((c) => ({
          id: c.categoryId,
          name: c.categoryName,
        }))}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        categoryLabel="Danh mục"
        showDateFilter={true}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        dateLabel="Thời gian cập nhật"
        showPriceFilter={true}
        priceRange={priceRange}
        onPriceRangeChange={setPriceRange}
        priceLabel="Giá trị tồn"
        onReset={handleResetFilters}
      />

      {/* Bảng tồn kho */}
      <Table
        columns={columns}
        dataSource={filteredInventories}
        rowKey="inventoryId"
        loading={loading}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ["10", "50", "100"],
          showTotal: (total) => `Tổng ${total} mục`,
        }}
        scroll={{ x: 1200 }}
      />
    </div>
  );
};

export default InventoryPage;
