import { DeleteOutlined, EyeOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
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
import CreatePurchaseOrderModal from "../components/PurchaseOrders/CreatePurchaseOrderModal";

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
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(
    null
  );

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

  const handleCreateModalOpen = () => {
    setIsCreateModalVisible(true);
  };

  const handleCreateModalClose = () => {
    setIsCreateModalVisible(false);
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

      <CreatePurchaseOrderModal
        visible={isCreateModalVisible}
        suppliers={suppliers}
        products={products}
        warehouseId={DEFAULT_WAREHOUSE_ID}
        onClose={handleCreateModalClose}
        onSuccess={fetchPurchaseOrders}
      />

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
