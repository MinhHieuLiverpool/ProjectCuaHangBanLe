import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Form,
  Input,
  Modal,
  Space,
  Table,
  Tag,
  message,
  Popconfirm,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import React, { useEffect, useState } from "react";
import api from "../services/api";

interface Warehouse {
  warehouseId: number;
  warehouseName: string;
  address?: string;
  status: string;
}

interface InventoryItem {
  productId: number;
  productName: string;
  barcode?: string;
  quantity: number;
  unit: string;
  categoryName?: string;
}

const WarehousesPage: React.FC = () => {
  const [form] = Form.useForm();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isInventoryModalVisible, setIsInventoryModalVisible] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(
    null
  );
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(
    null
  );
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);

  const fetchWarehouses = async () => {
    setLoading(true);
    try {
      const response = await api.get("/warehouses");
      setWarehouses(response.data);
    } catch (error) {
      message.error("Không thể tải danh sách kho hàng");
    } finally {
      setLoading(false);
    }
  };

  const fetchWarehouseInventory = async (warehouseId: number) => {
    setInventoryLoading(true);
    try {
      // Dùng endpoint mới để lấy inventory theo warehouse
      const response = await api.get(`/inventory/warehouse/${warehouseId}`);
      setInventoryItems(response.data);
    } catch (error) {
      message.error("Không thể tải danh sách tồn kho");
      setInventoryItems([]);
    } finally {
      setInventoryLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const showModal = (warehouse?: Warehouse) => {
    if (warehouse) {
      setEditingWarehouse(warehouse);
      form.setFieldsValue(warehouse);
    } else {
      setEditingWarehouse(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingWarehouse) {
        await api.put(`/warehouses/${editingWarehouse.warehouseId}`, values);
        message.success("Cập nhật kho hàng thành công");
      } else {
        await api.post("/warehouses", values);
        message.success("Tạo kho hàng thành công");
      }
      setIsModalVisible(false);
      form.resetFields();
      fetchWarehouses();
    } catch (error: any) {
      message.error(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const deleteWarehouse = async (warehouseId: number) => {
    try {
      await api.delete(`/warehouses/${warehouseId}`);
      message.success("Xóa kho hàng thành công");
      fetchWarehouses();
    } catch (error: any) {
      message.error(error.response?.data?.message || "Không thể xóa kho hàng");
    }
  };

  const viewWarehouseInventory = (warehouse: Warehouse) => {
    setSelectedWarehouse(warehouse);
    fetchWarehouseInventory(warehouse.warehouseId);
    setIsInventoryModalVisible(true);
  };

  const columns: ColumnsType<Warehouse> = [
    {
      title: "Mã kho",
      dataIndex: "warehouseId",
      key: "warehouseId",
      width: 100,
    },
    {
      title: "Tên kho",
      dataIndex: "warehouseName",
      key: "warehouseName",
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
      ellipsis: true,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: string) => {
        let color = "green";
        let text = "Hoạt động";
        if (status === "inactive") {
          color = "orange";
          text = "Không hoạt động";
        } else if (status === "deleted") {
          color = "red";
          text = "Đã xóa";
        }
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "Thao tác",
      key: "action",
      width: 250,
      render: (_: any, record: Warehouse) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => viewWarehouseInventory(record)}
          >
            Xem tồn kho
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
          >
            Sửa
          </Button>
          {record.status !== "deleted" && (
            <Popconfirm
              title="Bạn có chắc muốn xóa kho này?"
              onConfirm={() => deleteWarehouse(record.warehouseId)}
              okText="Có"
              cancelText="Không"
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

  const inventoryColumns: ColumnsType<InventoryItem> = [
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
      title: "Mã vạch",
      dataIndex: "barcode",
      key: "barcode",
    },
    {
      title: "Danh mục",
      dataIndex: "categoryName",
      key: "categoryName",
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      width: 100,
      render: (quantity: number) => (
        <Tag color={quantity > 50 ? "green" : quantity > 10 ? "orange" : "red"}>
          {quantity}
        </Tag>
      ),
    },
    {
      title: "Đơn vị",
      dataIndex: "unit",
      key: "unit",
      width: 80,
    },
  ];

  return (
    <div>
      <Card
        title="Quản lý kho hàng"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => showModal()}
          >
            Thêm kho mới
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={warehouses}
          rowKey="warehouseId"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Modal thêm/sửa kho */}
      <Modal
        title={editingWarehouse ? "Sửa thông tin kho" : "Thêm kho mới"}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Tên kho"
            name="warehouseName"
            rules={[{ required: true, message: "Vui lòng nhập tên kho" }]}
          >
            <Input placeholder="Nhập tên kho" />
          </Form.Item>

          <Form.Item
            label="Địa chỉ"
            name="address"
            rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
          >
            <Input.TextArea placeholder="Nhập địa chỉ kho" rows={3} />
          </Form.Item>

          {editingWarehouse && (
            <Form.Item
              label="Trạng thái"
              name="status"
              rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
            >
              <Input placeholder="active, inactive, deleted" />
            </Form.Item>
          )}

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingWarehouse ? "Cập nhật" : "Tạo mới"}
              </Button>
              <Button onClick={() => setIsModalVisible(false)}>Hủy</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal xem tồn kho */}
      <Modal
        title={`Tồn kho tại: ${selectedWarehouse?.warehouseName}`}
        open={isInventoryModalVisible}
        onCancel={() => setIsInventoryModalVisible(false)}
        footer={null}
        width={900}
      >
        <Card size="small" style={{ marginBottom: 16 }}>
          <p>
            <strong>Địa chỉ:</strong> {selectedWarehouse?.address}
          </p>
          <p>
            <strong>Tổng số loại sản phẩm:</strong> {inventoryItems.length}
          </p>
          <p>
            <strong>Tổng số lượng:</strong>{" "}
            {inventoryItems.reduce((sum, item) => sum + item.quantity, 0)}
          </p>
        </Card>
        <Table
          columns={inventoryColumns}
          dataSource={inventoryItems}
          rowKey="productId"
          loading={inventoryLoading}
          pagination={{ pageSize: 10 }}
          size="small"
        />
      </Modal>
    </div>
  );
};

export default WarehousesPage;
