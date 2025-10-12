import { DeleteOutlined, EyeOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Form,
  InputNumber,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  message,
  Popconfirm,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import React, { useEffect, useState } from "react";
import api from "../services/api";

interface Supplier {
  supplierId: number;
  name: string;
}

interface Product {
  productId: number;
  productName: string;
  barcode?: string;
  costPrice: number;
}

interface PurchaseItem {
  productId: number;
  productName?: string;
  barcode?: string;
  quantity: number;
  costPrice: number;
  subtotal?: number;
  currentStock?: number;
}

interface PurchaseOrder {
  purchaseId: number;
  supplierId: number;
  supplierName?: string;
  userId: number;
  userName?: string;
  purchaseDate: string;
  totalAmount: number;
  status: string;
  items: PurchaseItem[];
}

const StockReceiptsPage: React.FC = () => {
  const [form] = Form.useForm();
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(
    null
  );
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([]);

  // Kho mặc định
  const DEFAULT_WAREHOUSE_ID = 1;

  const fetchData = async () => {
    try {
      const [productsRes, suppliersRes] = await Promise.all([
        api.get("/products"),
        api.get("/suppliers"),
      ]);
      setProducts(productsRes.data.filter((p: any) => p.status === "active"));
      setSuppliers(suppliersRes.data.filter((s: any) => s.status === "active"));
    } catch (error) {
      message.error("Không thể tải dữ liệu");
    }
  };

  const fetchPurchaseOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get("/purchaseorders");
      setPurchaseOrders(response.data);
    } catch (error) {
      message.error("Không thể tải danh sách phiếu nhập hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchPurchaseOrders();
  }, []);

  const addPurchaseItem = () => {
    setPurchaseItems([
      ...purchaseItems,
      { productId: 0, quantity: 1, costPrice: 0, currentStock: 0 },
    ]);
  };

  const removePurchaseItem = (index: number) => {
    setPurchaseItems(purchaseItems.filter((_, i) => i !== index));
  };

  const updatePurchaseItem = async (
    index: number,
    field: string,
    value: any
  ) => {
    const newItems = [...purchaseItems];
    newItems[index] = { ...newItems[index], [field]: value };

    // If product changed, fetch its cost price and current stock
    if (field === "productId" && value) {
      const selectedProduct = products.find((p) => p.productId === value);

      if (selectedProduct) {
        newItems[index].costPrice = selectedProduct.costPrice || 0;
        newItems[index].productName = selectedProduct.productName;

        // Fetch current stock từ kho mặc định
        try {
          const response = await api.get(
            `/inventory/warehouse/${DEFAULT_WAREHOUSE_ID}`
          );

          const inventory = response.data.find(
            (inv: any) => inv.productId === value
          );
          newItems[index].currentStock = inventory ? inventory.quantity : 0;
        } catch (error) {
          console.error("Error fetching inventory:", error);
          newItems[index].currentStock = 0;
        }
      }
    }

    setPurchaseItems(newItems);
  };

  const handleCreateModalOpen = () => {
    form.resetFields();
    setPurchaseItems([]);
    setIsCreateModalVisible(true);
  };

  const handleCreateModalClose = () => {
    setIsCreateModalVisible(false);
    form.resetFields();
    setPurchaseItems([]);
  };

  const handleSubmit = async (values: any) => {
    if (purchaseItems.length === 0) {
      message.error("Vui lòng thêm ít nhất một sản phẩm");
      return;
    }

    const hasInvalid = purchaseItems.some(
      (item) => !item.productId || item.quantity <= 0
    );

    if (hasInvalid) {
      message.error("Vui lòng chọn sản phẩm và nhập số lượng");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/purchaseorders", {
        supplierId: values.supplierId,
        warehouseId: DEFAULT_WAREHOUSE_ID, // Sử dụng kho mặc định
        items: purchaseItems,
      });
      message.success("Tạo phiếu nhập hàng thành công");
      handleCreateModalClose();
      fetchPurchaseOrders();
    } catch (error: any) {
      message.error(
        error.response?.data?.message || "Không thể tạo phiếu nhập hàng"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (purchaseId: number, status: string) => {
    try {
      await api.patch(`/purchaseorders/${purchaseId}/status`, { status });
      message.success("Cập nhật trạng thái thành công");
      fetchPurchaseOrders();
    } catch (error: any) {
      message.error(error.response?.data?.message || "Không thể cập nhật");
    }
  };

  const viewDetails = async (purchaseId: number) => {
    try {
      const response = await api.get(`/purchaseorders/${purchaseId}`);
      setSelectedOrder(response.data);
      setIsDetailModalVisible(true);
    } catch (error) {
      message.error("Không thể tải chi tiết phiếu nhập");
    }
  };

  const deletePurchase = async (purchaseId: number) => {
    try {
      await api.delete(`/purchaseorders/${purchaseId}`);
      message.success("Xóa phiếu nhập thành công");
      fetchPurchaseOrders();
    } catch (error: any) {
      message.error(error.response?.data?.message || "Không thể xóa");
    }
  };

  const columns: ColumnsType<PurchaseOrder> = [
    {
      title: "Mã phiếu",
      dataIndex: "purchaseId",
      key: "purchaseId",
      width: 100,
    },
    { title: "Nhà cung cấp", dataIndex: "supplierName", key: "supplierName" },
    { title: "Người nhập", dataIndex: "userName", key: "userName" },
    {
      title: "Ngày nhập",
      dataIndex: "purchaseDate",
      key: "purchaseDate",
      render: (date: string) => new Date(date).toLocaleString("vi-VN"),
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amount: number) => `${(amount || 0).toLocaleString("vi-VN")}đ`,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const configs: any = {
          pending: { color: "blue", text: "Chờ xử lý" },
          completed: { color: "green", text: "Đã hoàn thành" },
          canceled: { color: "red", text: "Đã hủy" },
        };
        const config = configs[status] || configs.pending;
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_: any, record: PurchaseOrder) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => viewDetails(record.purchaseId)}
          >
            Xem
          </Button>
          {record.status === "pending" && (
            <>
              <Button
                type="link"
                onClick={() => updateStatus(record.purchaseId, "completed")}
                style={{ color: "green" }}
              >
                Hoàn thành
              </Button>
              <Button
                type="link"
                onClick={() => updateStatus(record.purchaseId, "canceled")}
                danger
              >
                Hủy
              </Button>
              <Popconfirm
                title="Bạn có chắc muốn xóa?"
                onConfirm={() => deletePurchase(record.purchaseId)}
                okText="Có"
                cancelText="Không"
              >
                <Button type="link" danger icon={<DeleteOutlined />}>
                  Xóa
                </Button>
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ];

  const itemColumns: ColumnsType<PurchaseItem> = [
    { title: "Sản phẩm", dataIndex: "productName", key: "productName" },
    { title: "Mã vạch", dataIndex: "barcode", key: "barcode" },
    { title: "Số lượng", dataIndex: "quantity", key: "quantity" },
    {
      title: "Giá nhập",
      dataIndex: "costPrice",
      key: "costPrice",
      render: (price: number) => `${(price || 0).toLocaleString("vi-VN")}đ`,
    },
    {
      title: "Thành tiền",
      dataIndex: "subtotal",
      key: "subtotal",
      render: (subtotal: number) =>
        `${(subtotal || 0).toLocaleString("vi-VN")}đ`,
    },
  ];

  return (
    <div>
      <Card
        title="Nhập hàng"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreateModalOpen}
          >
            Tạo phiếu nhập
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={purchaseOrders}
          rowKey="purchaseId"
          loading={loading}
          pagination={{ pageSize: 10 }}
          onRow={(record) => ({
            onDoubleClick: () => viewDetails(record.purchaseId),
          })}
        />
      </Card>

      <Modal
        title="Tạo phiếu nhập hàng"
        open={isCreateModalVisible}
        onCancel={handleCreateModalClose}
        footer={null}
        width={900}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Nhà cung cấp"
            name="supplierId"
            rules={[{ required: true, message: "Vui lòng chọn nhà cung cấp" }]}
          >
            <Select
              placeholder="Chọn nhà cung cấp"
              showSearch
              optionFilterProp="children"
            >
              {suppliers.map((s) => (
                <Select.Option key={s.supplierId} value={s.supplierId}>
                  {s.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <div style={{ marginBottom: 16 }}>
            <h4>Danh sách sản phẩm</h4>
            {purchaseItems.map((item, index) => (
              <div
                key={index}
                style={{
                  marginBottom: 16,
                  padding: 12,
                  border: "1px solid #d9d9d9",
                  borderRadius: 4,
                  backgroundColor: "#fafafa",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    marginBottom: 8,
                    alignItems: "center",
                  }}
                >
                  <Select
                    style={{ flex: 2 }}
                    placeholder="Chọn sản phẩm"
                    showSearch
                    optionFilterProp="children"
                    value={item.productId || undefined}
                    onChange={(value) =>
                      updatePurchaseItem(index, "productId", value)
                    }
                  >
                    {products.map((p) => (
                      <Select.Option key={p.productId} value={p.productId}>
                        {p.productName} - {p.barcode}
                      </Select.Option>
                    ))}
                  </Select>
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => removePurchaseItem(index)}
                  />
                </div>
                <div
                  style={{ display: "flex", gap: 8, alignItems: "flex-start" }}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{ fontSize: 12, color: "#666", marginBottom: 4 }}
                    >
                      Giá nhập (không sửa được)
                    </div>
                    <InputNumber
                      style={{ width: "100%" }}
                      placeholder="Giá nhập"
                      min={0}
                      disabled
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "đ"
                      }
                      value={item.costPrice}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{ fontSize: 12, color: "#666", marginBottom: 4 }}
                    >
                      Số lượng tồn kho hiện tại
                    </div>
                    <InputNumber
                      style={{ width: "100%" }}
                      placeholder="Tồn kho"
                      disabled
                      value={item.currentStock || 0}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{ fontSize: 12, color: "#666", marginBottom: 4 }}
                    >
                      <span style={{ color: "red" }}>* </span>Số lượng nhập
                    </div>
                    <InputNumber
                      style={{ width: "100%" }}
                      placeholder="Nhập số lượng"
                      min={1}
                      value={item.quantity}
                      onChange={(value) =>
                        updatePurchaseItem(index, "quantity", value || 1)
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={addPurchaseItem}
              block
            >
              Thêm sản phẩm
            </Button>
          </div>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={submitting}>
                Tạo phiếu nhập
              </Button>
              <Button onClick={handleCreateModalClose}>Hủy</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`Chi tiết phiếu nhập #${selectedOrder?.purchaseId}`}
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={null}
        width={900}
      >
        {selectedOrder && (
          <div>
            <Card size="small" style={{ marginBottom: 16 }}>
              <Space direction="vertical" style={{ width: "100%" }}>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <div>
                    <strong>Nhà cung cấp:</strong> {selectedOrder.supplierName}
                  </div>
                  <div>
                    <strong>Người nhập:</strong> {selectedOrder.userName}
                  </div>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <div>
                    <strong>Ngày nhập:</strong>{" "}
                    {new Date(selectedOrder.purchaseDate).toLocaleString(
                      "vi-VN"
                    )}
                  </div>
                  <div>
                    <strong>Trạng thái:</strong>{" "}
                    <Tag
                      color={
                        selectedOrder.status === "completed"
                          ? "green"
                          : selectedOrder.status === "canceled"
                          ? "red"
                          : "blue"
                      }
                    >
                      {selectedOrder.status === "completed"
                        ? "Đã hoàn thành"
                        : selectedOrder.status === "canceled"
                        ? "Đã hủy"
                        : "Chờ xử lý"}
                    </Tag>
                  </div>
                </div>
                <div
                  style={{ fontSize: 18, fontWeight: "bold", color: "#1890ff" }}
                >
                  Tổng tiền:{" "}
                  {(selectedOrder.totalAmount || 0).toLocaleString("vi-VN")}đ
                </div>
              </Space>
            </Card>
            <h4>Chi tiết sản phẩm:</h4>
            <Table
              columns={itemColumns}
              dataSource={selectedOrder.items}
              rowKey={(item) => `${item.productId}-${item.quantity}`}
              pagination={false}
              size="small"
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StockReceiptsPage;
