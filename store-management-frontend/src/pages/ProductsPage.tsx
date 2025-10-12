import { categoryService, supplierService } from "@/services/common.service";
import { productService } from "@/services/product.service";
import { Category, Product, Supplier } from "@/types";
import {
  BarChartOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  SearchOutlined,
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
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [searchText, setSearchText] = useState("");
  const [form] = Form.useForm();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [productsData, categoriesData, suppliersData] = await Promise.all([
        productService.getAll(),
        categoryService.getAll(),
        supplierService.getAll(),
      ]);
      setProducts(productsData);
      setFilteredProducts(productsData);
      setCategories(categoriesData);
      setSuppliers(suppliersData);
    } catch (error) {
      message.error("Không thể tải dữ liệu!");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (value: string) => {
    setSearchText(value);
    setLoading(true);
    try {
      if (value.trim() === "") {
        setFilteredProducts(products);
      } else {
        const results = await productService.search(value);
        setFilteredProducts(results);
      }
    } catch (error) {
      message.error("Lỗi khi tìm kiếm!");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingProduct(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    form.setFieldsValue(product);
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
      const profit = product.price - (product.costPrice || 0);
      const profitPercent = product.costPrice
        ? ((profit / product.costPrice) * 100).toFixed(1)
        : "0";

      return {
        "Mã SP": product.productId,
        "Tên sản phẩm": product.productName,
        "Mã vạch": product.barcode || "",
        "Danh mục": product.categoryName || "",
        "Nhà cung cấp": product.supplierName || "",
        "Đơn vị": product.unit,
        "Giá nhập": product.costPrice || 0,
        "Giá bán": product.price,
        "Lợi nhuận": profit,
        "% Lợi nhuận": profitPercent + "%",
        "Tồn kho": product.stockQuantity || 0,
        "Trạng thái": product.status === "active" ? "Đang bán" : "Ngừng bán",
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
      { wch: 12 }, // Giá nhập
      { wch: 12 }, // Giá bán
      { wch: 12 }, // Lợi nhuận
      { wch: 12 }, // % Lợi nhuận
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

  const handleDelete = async (productId: number) => {
    try {
      await productService.delete(productId);
      message.success("Xóa sản phẩm thành công!");
      fetchData();
    } catch (error) {
      message.error("Xóa sản phẩm thất bại!");
    }
  };

  const handleToggleStatus = async (productId: number, newStatus: string) => {
    try {
      await productService.update(productId, { status: newStatus });
      message.success(
        newStatus === "active"
          ? "Hiển thị sản phẩm thành công!"
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
      title: "Giá nhập",
      dataIndex: "costPrice",
      key: "costPrice",
      width: 120,
      render: (costPrice: number) =>
        costPrice ? `${(costPrice || 0).toLocaleString("vi-VN")}đ` : "0đ",
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
      title: "Lợi nhuận",
      key: "profit",
      width: 100,
      render: (_: any, record: Product) => {
        const profit = record.price - (record.costPrice || 0);
        const profitPercent = record.costPrice
          ? ((profit / record.costPrice) * 100).toFixed(1)
          : "0";
        return (
          <span style={{ color: profit > 0 ? "green" : "red" }}>
            {profitPercent}%
          </span>
        );
      },
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
      render: (status: string) => (
        <Tag color={status === "active" ? "green" : "red"}>
          {status === "active" ? "Đang bán" : "Ngừng bán"}
        </Tag>
      ),
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
            <Button
              type="default"
              size="small"
              onClick={() => handleToggleStatus(record.productId, "inactive")}
              style={{ color: "orange" }}
            >
              Ẩn
            </Button>
          ) : (
            <Button
              type="default"
              size="small"
              onClick={() => handleToggleStatus(record.productId, "active")}
              style={{ color: "green" }}
            >
              Hiện
            </Button>
          )}
          <Popconfirm
            title={
              <div>
                <div>Bạn có chắc muốn xóa?</div>
                <div style={{ fontSize: "12px", color: "#666", marginTop: 4 }}>
                  * Sản phẩm đã bán sẽ được ẩn thay vì xóa
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

      <div style={{ marginBottom: 16 }}>
        <Input.Search
          placeholder="Tìm kiếm theo tên, mã vạch, danh mục hoặc nhà cung cấp..."
          allowClear
          enterButton={
            <>
              <SearchOutlined /> Tìm kiếm
            </>
          }
          size="large"
          onSearch={handleSearch}
          onChange={(e) => {
            setSearchText(e.target.value);
            if (e.target.value === "") {
              handleSearch("");
            }
          }}
          value={searchText}
          style={{ maxWidth: 600 }}
        />
      </div>

      <Table
        columns={columns}
        dataSource={filteredProducts}
        rowKey="productId"
        loading={loading}
        pagination={{ pageSize: 10 }}
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
              <Form.Item name="barcode" label="Mã vạch (Barcode)">
                <Input placeholder="Nhập mã vạch (tùy chọn)" />
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
                  {categories.map((cat) => (
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
                  {suppliers.map((sup) => (
                    <Select.Option key={sup.supplierId} value={sup.supplierId}>
                      {sup.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="costPrice"
                label="Giá nhập (VNĐ)"
                rules={[
                  { required: true, message: "Vui lòng nhập giá nhập!" },
                  {
                    type: "number",
                    min: 0,
                    message: "Giá nhập phải lớn hơn 0!",
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
                  parser={(value) => Number(value!.replace(/\$\s?|(,*)/g, ""))}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
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
                  parser={(value) => Number(value!.replace(/\$\s?|(,*)/g, ""))}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
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
                  color={viewingProduct.status === "active" ? "green" : "red"}
                >
                  {viewingProduct.status === "active"
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

              <Descriptions.Item label="Giá nhập" span={1}>
                <span style={{ fontSize: "15px", color: "#d32f2f" }}>
                  {(viewingProduct.costPrice || 0).toLocaleString("vi-VN")}đ
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Giá bán" span={1}>
                <span style={{ fontSize: "15px", color: "#1976d2" }}>
                  {viewingProduct.price.toLocaleString("vi-VN")}đ
                </span>
              </Descriptions.Item>

              <Descriptions.Item label="Lợi nhuận/sản phẩm" span={1}>
                {(() => {
                  const profit =
                    viewingProduct.price - (viewingProduct.costPrice || 0);
                  return (
                    <span
                      style={{
                        color: profit > 0 ? "green" : "red",
                        fontSize: "15px",
                        fontWeight: 600,
                      }}
                    >
                      {profit.toLocaleString("vi-VN")}đ
                    </span>
                  );
                })()}
              </Descriptions.Item>
              <Descriptions.Item label="% Lợi nhuận" span={1}>
                {(() => {
                  const profit =
                    viewingProduct.price - (viewingProduct.costPrice || 0);
                  const profitPercent = viewingProduct.costPrice
                    ? ((profit / viewingProduct.costPrice) * 100).toFixed(1)
                    : "0";
                  return (
                    <span
                      style={{
                        color: parseFloat(profitPercent) > 0 ? "green" : "red",
                        fontSize: "15px",
                        fontWeight: 600,
                      }}
                    >
                      {profitPercent}%
                    </span>
                  );
                })()}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ProductsPage;
