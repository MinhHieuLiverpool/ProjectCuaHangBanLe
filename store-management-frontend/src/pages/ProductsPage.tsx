import { categoryService, supplierService } from "@/services/common.service";
import { productService } from "@/services/product.service";
import { Category, Product, Supplier } from "@/types";
import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import {
  Button,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
} from "antd";
import React, { useEffect, useState } from "react";

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
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

  const handleDelete = async (productId: number) => {
    try {
      await productService.delete(productId);
      message.success("Xóa sản phẩm thành công!");
      fetchData();
    } catch (error) {
      message.error("Xóa sản phẩm thất bại!");
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
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      render: (price: number) =>
        price ? `${price.toLocaleString("vi-VN")}đ` : "0đ",
    },
    {
      title: "Đơn vị",
      dataIndex: "unit",
      key: "unit",
    },
    {
      title: "Tồn kho",
      dataIndex: "stockQuantity",
      key: "stockQuantity",
      render: (stock: number) => (
        <span style={{ color: stock < 10 ? "red" : "inherit" }}>{stock}</span>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 150,
      render: (_: any, record: Product) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa?"
            onConfirm={() => handleDelete(record.productId)}
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
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
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Thêm sản phẩm
        </Button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Input.Search
          placeholder="Tìm kiếm theo tên, mã vạch, danh mục hoặc nhà cung cấp..."
          allowClear
          enterButton={<><SearchOutlined /> Tìm kiếm</>}
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
        title={editingProduct ? "Cập nhật sản phẩm" : "Thêm sản phẩm"}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="productName"
            label="Tên sản phẩm"
            rules={[{ required: true, message: "Vui lòng nhập tên sản phẩm!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="categoryId"
            label="Danh mục"
            rules={[{ required: true, message: "Vui lòng chọn danh mục!" }]}
          >
            <Select>
              {categories.map((cat) => (
                <Select.Option key={cat.categoryId} value={cat.categoryId}>
                  {cat.categoryName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="supplierId"
            label="Nhà cung cấp"
            rules={[{ required: true, message: "Vui lòng chọn nhà cung cấp!" }]}
          >
            <Select>
              {suppliers.map((sup) => (
                <Select.Option key={sup.supplierId} value={sup.supplierId}>
                  {sup.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="barcode" label="Mã vạch">
            <Input />
          </Form.Item>

          <Form.Item
            name="price"
            label="Giá"
            rules={[{ required: true, message: "Vui lòng nhập giá!" }]}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="unit"
            label="Đơn vị"
            rules={[{ required: true, message: "Vui lòng nhập đơn vị!" }]}
          >
            <Input placeholder="vd: cái, hộp, chai..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductsPage;
