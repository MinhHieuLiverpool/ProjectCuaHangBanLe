import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  message,
  Popconfirm,
  Tag,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { Category } from "@/types";
import { categoryService } from "@/services/common.service";

const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form] = Form.useForm();

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

  const handleDelete = async (categoryId: number) => {
    try {
      const response = await categoryService.delete(categoryId);

      // Kiểm tra xem có phải soft delete không
      if (response.softDeleted) {
        message.warning(
          response.message ||
            "Danh mục có sản phẩm liên quan nên đã được ẩn thay vì xóa"
        );
      } else {
        message.success(response.message || "Xóa danh mục thành công!");
      }

      fetchData();
    } catch (error: any) {
      message.error(error.response?.data?.message || "Xóa danh mục thất bại!");
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
              Hiện lại
            </Button>
          ) : (
            <Popconfirm
              title="Xóa danh mục?"
              description="Nếu có sản phẩm liên quan, danh mục sẽ được ẩn thay vì xóa."
              onConfirm={() => handleDelete(record.categoryId)}
            >
              <Button type="link" danger icon={<DeleteOutlined />}>
                Xóa
              </Button>
            </Popconfirm>
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
    </div>
  );
};

export default CategoriesPage;
