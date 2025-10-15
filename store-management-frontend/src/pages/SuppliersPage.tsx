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
import { Supplier } from "@/types";
import { supplierService } from "@/services/common.service";

const SuppliersPage: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await supplierService.getAll();
      setSuppliers(data);
    } catch (error) {
      message.error("Không thể tải dữ liệu!");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingSupplier(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    form.setFieldsValue(supplier);
    setModalVisible(true);
  };

  const handleRestore = async (supplierId: number) => {
    try {
      await supplierService.restore(supplierId);
      message.success("Khôi phục nhà cung cấp thành công!");
      fetchData();
    } catch (error: any) {
      message.error(
        error.response?.data?.message || "Khôi phục nhà cung cấp thất bại!"
      );
    }
  };

  const handleDelete = async (supplierId: number) => {
    try {
      const response = await supplierService.delete(supplierId);

      // Kiểm tra xem có phải soft delete không
      if (response.softDeleted) {
        message.warning(
          response.message ||
            "Nhà cung cấp có dữ liệu liên quan nên đã được ẩn thay vì xóa"
        );
      } else {
        message.success(response.message || "Xóa nhà cung cấp thành công!");
      }

      fetchData();
    } catch (error: any) {
      message.error(
        error.response?.data?.message || "Xóa nhà cung cấp thất bại!"
      );
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingSupplier) {
        await supplierService.update(editingSupplier.supplierId, values);
        message.success("Cập nhật nhà cung cấp thành công!");
      } else {
        await supplierService.create(values);
        message.success("Thêm nhà cung cấp thành công!");
      }
      setModalVisible(false);
      fetchData();
    } catch (error) {
      message.error("Lưu nhà cung cấp thất bại!");
    }
  };

  const columns = [
    {
      title: "Mã NCC",
      dataIndex: "supplierId",
      key: "supplierId",
      width: 80,
    },
    {
      title: "Tên nhà cung cấp",
      dataIndex: "name",
      key: "name",
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
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
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
      render: (_: any, record: Supplier) => (
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
              onClick={() => handleRestore(record.supplierId)}
            >
              Hiện lại
            </Button>
          ) : (
            <Popconfirm
              title="Xóa nhà cung cấp?"
              description="Nếu có sản phẩm hoặc đơn nhập hàng liên quan, nhà cung cấp sẽ được ẩn thay vì xóa."
              onConfirm={() => handleDelete(record.supplierId)}
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
        <h2>Quản lý nhà cung cấp</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Thêm nhà cung cấp
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={suppliers}
        rowKey="supplierId"
        loading={loading}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ["10", "50", "100"],
          showTotal: (total) => `Tổng ${total} mục`,
        }}
      />

      <Modal
        title={editingSupplier ? "Cập nhật nhà cung cấp" : "Thêm nhà cung cấp"}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Tên nhà cung cấp"
            rules={[{ required: true, message: "Vui lòng nhập tên!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="phone" label="Số điện thoại">
            <Input />
          </Form.Item>

          <Form.Item name="email" label="Email">
            <Input type="email" />
          </Form.Item>

          <Form.Item name="address" label="Địa chỉ">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SuppliersPage;
