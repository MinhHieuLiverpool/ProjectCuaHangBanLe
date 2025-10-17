import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  message,
  Tag,
} from "antd";
import { PlusOutlined, EditOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import { Category, CategoryProduct, CategoryDeleteRequest } from "@/types";
import { categoryService } from "@/services/common.service";
import CategoryDeleteModal from "@/components/CategoryDeleteModal";

const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form] = Form.useForm();

  // States for delete modal
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [categoryProducts, setCategoryProducts] = useState<CategoryProduct[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (error) {
      message.error("Không thể tải dữ liệu!");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingCategory(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    form.setFieldsValue(category);
    setModalVisible(true);
  };

  const handleRestore = async (categoryId: number) => {
    try {
      await categoryService.restore(categoryId);
      message.success("Khôi phục danh mục thành công!");
      fetchData();
    } catch (error: any) {
      message.error(
        error.response?.data?.message || "Khôi phục danh mục thất bại!"
      );
    }
  };

  const handleHideClick = async (category: Category) => {
    try {
      // Kiểm tra xem category có sản phẩm không
      const checkResult = await categoryService.checkHide(category.categoryId);

      if (checkResult.productCount === 0) {
        // Không có sản phẩm -> ẩn trực tiếp
        Modal.confirm({
          title: "Ẩn danh mục?",
          content: `Bạn có chắc chắn muốn ẩn danh mục "${category.categoryName}"?`,
          okText: "Ẩn",
          cancelText: "Hủy",
          okType: "danger",
          onOk: async () => {
            try {
              const response = await categoryService.hide(category.categoryId, {
                hideProducts: false,
              });
              message.success(response.message || "Đã ẩn danh mục thành công!");
              fetchData();
            } catch (error: any) {
              message.error(
                error.response?.data?.message || "Ẩn danh mục thất bại!"
              );
            }
          },
        });
      } else {
        // Có sản phẩm -> mở modal reassign
        setDeletingCategory(category);
        setCategoryProducts(checkResult.affectedProducts || []);
        setDeleteModalVisible(true);
      }
    } catch (error: any) {
      message.error(
        error.response?.data?.message || "Không thể kiểm tra danh mục!"
      );
    }
  };

  const handleConfirmHide = async (request: CategoryDeleteRequest) => {
    if (!deletingCategory) return;

    try {
      const response = await categoryService.hide(
        deletingCategory.categoryId,
        request
      );

      if (response.success) {
        message.success(response.message);
      } else {
        message.warning(response.message);
      }

      setDeleteModalVisible(false);
      setDeletingCategory(null);
      setCategoryProducts([]);
      fetchData();
    } catch (error: any) {
      message.error(error.response?.data?.message || "Ẩn danh mục thất bại!");
      throw error; // Re-throw để modal có thể handle loading state
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingCategory) {
        await categoryService.update(editingCategory.categoryId, values);
        message.success("Cập nhật danh mục thành công!");
      } else {
        await categoryService.create(values);
        message.success("Thêm danh mục thành công!");
      }
      setModalVisible(false);
      fetchData();
    } catch (error) {
      message.error("Lưu danh mục thất bại!");
    }
  };

  const columns = [
    {
      title: "Mã DM",
      dataIndex: "categoryId",
      key: "categoryId",
      width: 80,
    },
    {
      title: "Tên danh mục",
      dataIndex: "categoryName",
      key: "categoryName",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: string) => (
        <Tag color={status === "active" ? "green" : "red"}>
          {status === "active" ? "Hoạt động" : "Đã ẩn"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 200,
      render: (_: any, record: Category) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          {record.status === "inactive" ? (
            <Button
              type="link"
              style={{ color: "green" }}
              onClick={() => handleRestore(record.categoryId)}
            >
              Khôi phục
            </Button>
          ) : (
            <Button
              type="link"
              danger
              icon={<EyeInvisibleOutlined />}
              onClick={() => handleHideClick(record)}
            >
              Ẩn
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
        <h2>Quản lý danh mục</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Thêm danh mục
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={categories}
        rowKey="categoryId"
        loading={loading}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ["10", "50", "100"],
          showTotal: (total) => `Tổng ${total} mục`,
        }}
      />

      <Modal
        title={editingCategory ? "Cập nhật danh mục" : "Thêm danh mục"}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="categoryName"
            label="Tên danh mục"
            rules={[{ required: true, message: "Vui lòng nhập tên danh mục!" }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      <CategoryDeleteModal
        visible={deleteModalVisible}
        category={deletingCategory}
        products={categoryProducts}
        allCategories={categories}
        onConfirm={handleConfirmHide}
        onCancel={() => {
          setDeleteModalVisible(false);
          setDeletingCategory(null);
          setCategoryProducts([]);
        }}
      />
    </div>
  );
};

export default CategoriesPage;
