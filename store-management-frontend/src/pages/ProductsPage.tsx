import { categoryService, supplierService } from "@/services/common.service";
import { productService } from "@/services/product.service";
import { Category, Product, Supplier } from "@/types";
import AdvancedSearchFilter from "@/components/AdvancedSearchFilter";
import {
  BarChartOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  Button,
  Col,
  Descriptions,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Popconfirm,
  Radio,
  Row,
  Select,
  Space,
  Table,
  Tag,
} from "antd";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import * as XLSX from "xlsx";

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]); // Tất cả categories (cho filter)
  const [activeCategories, setActiveCategories] = useState<Category[]>([]); // Chỉ active (cho form)
  const [suppliers, setSuppliers] = useState<Supplier[]>([]); // Tất cả suppliers (cho filter)
  const [activeSuppliers, setActiveSuppliers] = useState<Supplier[]>([]); // Chỉ active (cho form)
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number] | null>(null);
  const [barcodeMode, setBarcodeMode] = useState<"auto" | "manual">("auto");
  const [form] = Form.useForm();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [
    products,
    searchText,
    selectedCategory,
    selectedSupplier,
    selectedStatus,
    priceRange,
  ]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [
        productsData,
        categoriesData,
        suppliersData,
        activeCategoriesData,
        activeSuppliersData,
      ] = await Promise.all([
        productService.getAll(),
        categoryService.getAll(), // Tất cả cho filter
        supplierService.getAll(), // Tất cả cho filter
        categoryService.getActive(), // Chỉ active cho form
        supplierService.getActive(), // Chỉ active cho form
      ]);
      setProducts(productsData);
      setFilteredProducts(productsData);
      setCategories(categoriesData);
      setSuppliers(suppliersData);
      setActiveCategories(activeCategoriesData);
      setActiveSuppliers(activeSuppliersData);
    } catch (error) {
      message.error("Không thể tải dữ liệu!");
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = [...products];

    // Filter by search text
    if (searchText.trim()) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.productName.toLowerCase().includes(search) ||
          p.barcode?.toLowerCase().includes(search) ||
          p.categoryName?.toLowerCase().includes(search) ||
          p.supplierName?.toLowerCase().includes(search)
      );
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter((p) => p.categoryId === selectedCategory);
    }

    // Filter by supplier
    if (selectedSupplier) {
      filtered = filtered.filter((p) => p.supplierId === selectedSupplier);
    }

    // Filter by price range
    if (priceRange) {
      const [minPrice, maxPrice] = priceRange;
      filtered = filtered.filter((p) => {
        const price = p.price || 0;
        return price >= minPrice && price <= maxPrice;
      });
    }

    // Filter by status
    if (selectedStatus) {
      if (selectedStatus === "active") {
        filtered = filtered.filter(
          (p) => p.status === "active" && (p.stockQuantity || 0) > 0
        );
      } else if (selectedStatus === "out_of_stock") {
        filtered = filtered.filter((p) => (p.stockQuantity || 0) === 0);
      } else if (selectedStatus === "inactive") {
        filtered = filtered.filter((p) => p.status === "inactive");
      }
    }

    setFilteredProducts(filtered);
  };

  const generateEAN13Barcode = () => {
    // Tạo 9 chữ số ngẫu nhiên sau 890
    let randomPart = "";
    for (let i = 0; i < 9; i++) {
      randomPart += Math.floor(Math.random() * 10).toString();
    }

    const baseBarcode = "890" + randomPart; // 12 chữ số

    // Tính checksum EAN13
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      const digit = parseInt(baseBarcode[i]);
      sum += i % 2 === 0 ? digit * 1 : digit * 3;
    }

    const checksum = (10 - (sum % 10)) % 10;
    return baseBarcode + checksum.toString();
  };

  const validateEAN13 = (barcode: string): boolean => {
    if (barcode.length !== 13 || !/^\d{13}$/.test(barcode)) {
      return false;
    }

    let sum = 0;
    for (let i = 0; i < 12; i++) {
      const digit = parseInt(barcode[i]);
      sum += i % 2 === 0 ? digit * 1 : digit * 3;
    }

    const checksum = (10 - (sum % 10)) % 10;
    return parseInt(barcode[12]) === checksum;
  };

  const handleCreate = () => {
    setEditingProduct(null);
    setBarcodeMode("auto");
    form.resetFields();
    // Tạo barcode tự động
    const barcode = generateEAN13Barcode();
    form.setFieldsValue({ barcode });
    setModalVisible(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setBarcodeMode("auto");
    // Tạo barcode mới khi sửa
    const barcode = generateEAN13Barcode();
    form.setFieldsValue({ ...product, barcode });
    setModalVisible(true);
  };

  const handleViewDetail = (product: Product) => {
    setViewingProduct(product);
    setDetailModalVisible(true);
  };

  const handleExportAllProducts = () => {
    if (filteredProducts.length === 0) {
      message.warning("Không có sản phẩm để xuất!");
      return;
    }

    // Chuẩn bị dữ liệu
    const excelData = filteredProducts.map((product) => {
      return {
        "Mã SP": product.productId,
        "Tên sản phẩm": product.productName,
        "Mã vạch": product.barcode || "",
        "Danh mục": product.categoryName || "",
        "Nhà cung cấp": product.supplierName || "",
        "Đơn vị": product.unit,
        "Giá bán": product.price,
        "Tồn kho": product.stockQuantity || 0,
        "Trạng thái":
          product.stockQuantity === 0
            ? "Hết hàng"
            : product.status === "active"
            ? "Đang bán"
            : "Ngừng bán",
      };
    });

    // Tạo worksheet
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Tự động điều chỉnh độ rộng cột
    const colWidths = [
      { wch: 8 }, // Mã SP
      { wch: 25 }, // Tên sản phẩm
      { wch: 15 }, // Mã vạch
      { wch: 15 }, // Danh mục
      { wch: 20 }, // Nhà cung cấp
      { wch: 10 }, // Đơn vị
      { wch: 12 }, // Giá bán
      { wch: 10 }, // Tồn kho
      { wch: 12 }, // Trạng thái
    ];
    ws["!cols"] = colWidths;

    // Tạo workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Danh sách sản phẩm");

    // Xuất file
    const fileName = `DanhSachSanPham_${new Date()
      .toLocaleDateString("vi-VN")
      .replace(/\//g, "-")}_${new Date().getTime()}.xlsx`;
    XLSX.writeFile(wb, fileName);

    message.success(`Đã xuất ${filteredProducts.length} sản phẩm ra Excel!`);
  };

  const handleResetFilters = () => {
    setSearchText("");
    setSelectedCategory(null);
    setSelectedSupplier(null);
    setSelectedStatus(null);
    setPriceRange(null);
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await productService.delete(id);

      // Kiểm tra xem có phải soft delete không
      if (response.softDeleted) {
        message.warning(
          response.message || "Sản phẩm đã được bán nên đã được ẩn thay vì xóa"
        );
      } else {
        message.success(response.message || "Xóa sản phẩm thành công!");
      }

      fetchData();
    } catch (error: any) {
      message.error(error.response?.data?.message || "Xóa sản phẩm thất bại!");
    }
  };

  const handleToggleStatus = async (productId: number, newStatus: string) => {
    try {
      await productService.update(productId, { status: newStatus });
      message.success(
        newStatus === "active"
          ? "Khôi phục sản phẩm thành công!"
          : "Ẩn sản phẩm thành công!"
      );
      fetchData();
    } catch (error) {
      message.error("Cập nhật trạng thái thất bại!");
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingProduct) {
        await productService.update(editingProduct.productId, values);
        message.success("Cập nhật sản phẩm thành công!");
      } else {
        await productService.create(values);
        message.success("Thêm sản phẩm thành công!");
      }
      setModalVisible(false);
      setSearchText("");
      fetchData();
    } catch (error) {
      message.error("Lưu sản phẩm thất bại!");
    }
  };

  const columns = [
    {
      title: "Mã SP",
      dataIndex: "productId",
      key: "productId",
      width: 80,
      defaultSortOrder: "descend" as const,
      sorter: (a: Product, b: Product) => a.productId - b.productId,
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "productName",
      key: "productName",
    },
    {
      title: "Danh mục",
      dataIndex: "categoryName",
      key: "categoryName",
      width: 120,
    },
    {
      title: "Nhà cung cấp",
      dataIndex: "supplierName",
      key: "supplierName",
      width: 150,
    },
    {
      title: "Giá bán",
      dataIndex: "price",
      key: "price",
      width: 120,
      render: (price: number) =>
        price ? `${(price || 0).toLocaleString("vi-VN")}đ` : "0đ",
    },
    {
      title: "Đơn vị",
      dataIndex: "unit",
      key: "unit",
      width: 80,
    },
    {
      title: "Tồn kho",
      dataIndex: "stockQuantity",
      key: "stockQuantity",
      width: 90,
      render: (stock: number) => (
        <span style={{ color: stock < 10 ? "red" : "inherit" }}>{stock}</span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: string, record: Product) => {
        if (record.stockQuantity === 0) {
          return <Tag color="orange">Hết hàng</Tag>;
        }
        return (
          <Tag color={status === "active" ? "green" : "red"}>
            {status === "active" ? "Đang bán" : "Ngừng bán"}
          </Tag>
        );
      },
    },
    {
      title: "Thao tác",
      key: "action",
      width: 280,
      fixed: "right" as const,
      render: (_: any, record: Product) => (
        <Space size="small" wrap>
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            Chi tiết
          </Button>
          <Button
            type="default"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          {record.status === "active" ? (
            record.hasOrders ? (
              <Button
                type="default"
                size="small"
                onClick={() => handleToggleStatus(record.productId, "inactive")}
                style={{ color: "orange" }}
              >
                Ẩn
              </Button>
            ) : (
              <Popconfirm
                title={
                  <div>
                    <div>Bạn có chắc muốn xóa sản phẩm này?</div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#666",
                        marginTop: 4,
                      }}
                    >
                      * Hành động này không thể hoàn tác
                    </div>
                  </div>
                }
                onConfirm={() => handleDelete(record.productId)}
              >
                <Button
                  type="default"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                >
                  Xóa
                </Button>
              </Popconfirm>
            )
          ) : (
            <Button
              type="default"
              size="small"
              onClick={() => handleToggleStatus(record.productId, "active")}
              style={{ color: "green" }}
            >
              Khôi phục
            </Button>
          )}
        </Space>
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
        <h2>Quản lý sản phẩm</h2>
        <Space>
          <Button
            type="default"
            icon={<DownloadOutlined />}
            onClick={handleExportAllProducts}
          >
            Xuất Excel
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            Thêm sản phẩm
          </Button>
        </Space>
      </div>

      {/* Bộ lọc nâng cao */}
      <AdvancedSearchFilter
        searchText={searchText}
        onSearchChange={setSearchText}
        searchPlaceholder="Tìm kiếm theo tên, mã vạch..."
        categories={categories.map((c) => ({
          id: c.categoryId,
          name: c.categoryName,
        }))}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        categoryLabel="Danh mục"
        statuses={[
          { value: "active", label: "Đang bán" },
          { value: "out_of_stock", label: "Hết hàng" },
          { value: "inactive", label: "Đã ẩn" },
        ]}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        statusLabel="Trạng thái"
        showPriceFilter={true}
        priceRange={priceRange}
        onPriceRangeChange={setPriceRange}
        priceLabel="Giá bán"
        onReset={handleResetFilters}
      >
        <Col xs={24} sm={12} md={8}>
          <Select
            placeholder="Nhà cung cấp"
            allowClear
            style={{ width: "100%" }}
            value={selectedSupplier}
            onChange={setSelectedSupplier}
          >
            {suppliers.map((supplier) => (
              <Select.Option
                key={supplier.supplierId}
                value={supplier.supplierId}
              >
                {supplier.name}
              </Select.Option>
            ))}
          </Select>
        </Col>
      </AdvancedSearchFilter>

      <Table
        columns={columns}
        dataSource={filteredProducts}
        rowKey="productId"
        loading={loading}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ["10", "50", "100"],
          showTotal: (total) => `Tổng ${total} mục`,
        }}
      />

      <Modal
        title={editingProduct ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới"}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={800}
        okText={editingProduct ? "Cập nhật" : "Thêm mới"}
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          {editingProduct && (
            <Form.Item label="Mã sản phẩm">
              <Input value={editingProduct.productId} disabled />
            </Form.Item>
          )}

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="productName"
                label="Tên sản phẩm"
                rules={[
                  { required: true, message: "Vui lòng nhập tên sản phẩm!" },
                ]}
              >
                <Input placeholder="Nhập tên sản phẩm" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Mã vạch (Barcode)">
                <Radio.Group
                  value={barcodeMode}
                  onChange={(e) => {
                    const mode = e.target.value;
                    setBarcodeMode(mode);
                    if (mode === "auto") {
                      const barcode = generateEAN13Barcode();
                      form.setFieldsValue({ barcode });
                    } else {
                      form.setFieldsValue({ barcode: "" });
                    }
                  }}
                  style={{ marginBottom: 8 }}
                >
                  <Radio value="auto">Tự động tạo</Radio>
                  <Radio value="manual">Nhập thủ công</Radio>
                </Radio.Group>
                <Form.Item
                  name="barcode"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập mã vạch!",
                    },
                    {
                      validator: (_, value) => {
                        if (value && !validateEAN13(value)) {
                          return Promise.reject(
                            new Error(
                              "Mã vạch không hợp lệ! Phải là mã EAN-13 đúng."
                            )
                          );
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <Input
                    placeholder={
                      barcodeMode === "auto"
                        ? "Mã vạch tự động tạo"
                        : "Nhập mã vạch EAN-13"
                    }
                  />
                </Form.Item>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="categoryId"
                label="Danh mục"
                rules={[{ required: true, message: "Vui lòng chọn danh mục!" }]}
              >
                <Select placeholder="Chọn danh mục">
                  {activeCategories.map((cat) => (
                    <Select.Option key={cat.categoryId} value={cat.categoryId}>
                      {cat.categoryName}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="supplierId"
                label="Nhà cung cấp"
                rules={[
                  { required: true, message: "Vui lòng chọn nhà cung cấp!" },
                ]}
              >
                <Select placeholder="Chọn nhà cung cấp">
                  {activeSuppliers.map((sup) => (
                    <Select.Option key={sup.supplierId} value={sup.supplierId}>
                      {sup.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="price"
                label="Giá bán (VNĐ)"
                rules={[
                  { required: true, message: "Vui lòng nhập giá bán!" },
                  {
                    type: "number",
                    min: 0,
                    message: "Giá bán phải lớn hơn 0!",
                  },
                ]}
              >
                <InputNumber
                  min={0}
                  style={{ width: "100%" }}
                  placeholder="0"
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => {
                    const cleaned = value!.replace(/[^0-9.]/g, "");
                    return Number(cleaned) || 0;
                  }}
                  onKeyPress={(e) => {
                    const charCode = e.which ? e.which : e.keyCode;
                    // Cho phép: số (48-57), dấu chấm (46), backspace (8), delete (46), tab (9), enter (13), escape (27), arrow keys (37-40)
                    if (
                      (charCode < 48 || charCode > 57) && // không phải số
                      charCode !== 46 && // không phải dấu chấm
                      charCode !== 8 && // không phải backspace
                      charCode !== 9 && // không phải tab
                      charCode !== 13 && // không phải enter
                      charCode !== 27 && // không phải escape
                      !(charCode >= 37 && charCode <= 40) // không phải arrow keys
                    ) {
                      e.preventDefault();
                    }
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="unit"
                label="Đơn vị"
                rules={[{ required: true, message: "Vui lòng nhập đơn vị!" }]}
              >
                <Input placeholder="Cái, Hộp, Chai..." />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Modal Chi tiết sản phẩm */}
      <Modal
        title={
          <div style={{ fontSize: "18px", fontWeight: 600 }}>
            Chi tiết sản phẩm
          </div>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Link key="inventory" to={`/products/${viewingProduct?.productId}`}>
            <Button type="primary" icon={<BarChartOutlined />}>
              Xem chi tiết tồn kho & lịch sử
            </Button>
          </Link>,
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={700}
      >
        {viewingProduct && (
          <div>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Mã sản phẩm" span={1}>
                <strong>{viewingProduct.productId}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái" span={1}>
                <Tag
                  color={
                    viewingProduct.stockQuantity === 0
                      ? "orange"
                      : viewingProduct.status === "active"
                      ? "green"
                      : "red"
                  }
                >
                  {viewingProduct.stockQuantity === 0
                    ? "Hết hàng"
                    : viewingProduct.status === "active"
                    ? "Đang bán"
                    : "Ngừng bán"}
                </Tag>
              </Descriptions.Item>

              <Descriptions.Item label="Tên sản phẩm" span={2}>
                <strong style={{ fontSize: "15px" }}>
                  {viewingProduct.productName}
                </strong>
              </Descriptions.Item>

              <Descriptions.Item label="Mã vạch" span={2}>
                {viewingProduct.barcode || <i>Chưa có</i>}
              </Descriptions.Item>

              <Descriptions.Item label="Danh mục" span={1}>
                {viewingProduct.categoryName || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Nhà cung cấp" span={1}>
                {viewingProduct.supplierName || "-"}
              </Descriptions.Item>

              <Descriptions.Item label="Đơn vị" span={1}>
                {viewingProduct.unit}
              </Descriptions.Item>
              <Descriptions.Item label="Tồn kho tổng" span={1}>
                <strong
                  style={{
                    color:
                      (viewingProduct.stockQuantity || 0) < 10
                        ? "red"
                        : "green",
                    fontSize: "16px",
                  }}
                >
                  {viewingProduct.stockQuantity || 0}
                </strong>
              </Descriptions.Item>

              <Descriptions.Item label="Giá bán" span={1}>
                <span style={{ fontSize: "15px", color: "#1976d2" }}>
                  {viewingProduct.price.toLocaleString("vi-VN")}đ
                </span>
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ProductsPage;
