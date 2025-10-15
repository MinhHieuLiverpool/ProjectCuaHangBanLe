import React, { useEffect, useState } from "react";
import { Table, Button, Space, message, Popconfirm, Tooltip, Tag } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { Promotion } from "@/types";
import { promotionService } from "@/services/common.service";
import PromotionModal from "@/components/PromotionModal";
import PromotionDetailModal from "@/components/PromotionDetailModal";

const PromotionsPage: React.FC = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(
    null
  );
  const [viewingPromotion, setViewingPromotion] = useState<Promotion | null>(
    null
  );

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await promotionService.getAll();
      setPromotions(data);
    } catch (error) {
      message.error("Không thể tải dữ liệu!");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingPromotion(null);
    setModalVisible(true);
  };

  const handleEdit = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    setModalVisible(true);
  };

  const handleDelete = async (promoId: number) => {
    try {
      await promotionService.delete(promoId);
      message.success("Xóa khuyến mãi thành công!");
      fetchData();
    } catch (error) {
      message.error("Xóa khuyến mãi thất bại!");
    }
  };

  const handleModalClose = () => {
    setModalVisible(false);
  };

  const handleModalSuccess = () => {
    fetchData();
  };

  const handleViewDetail = (promotion: Promotion) => {
    setViewingPromotion(promotion);
    setDetailModalVisible(true);
  };

  const handleDetailModalClose = () => {
    setDetailModalVisible(false);
    setViewingPromotion(null);
  };

  // Hàm lấy thông tin hiển thị trạng thái từ database
  const getPromotionStatusDisplay = (promotion: Promotion) => {
    const now = new Date();
    const startDate = new Date(promotion.startDate);
    const endDate = new Date(promotion.endDate);

    // Kiểm tra chưa bắt đầu
    if (now < startDate) {
      return {
        text: "Chưa bắt đầu",
        color: "orange",
        tooltip: `Sẽ bắt đầu từ ${startDate.toLocaleDateString("vi-VN")}`,
      };
    }

    // Đang áp dụng
    if (promotion.status === "active") {
      return {
        text: "Đang áp dụng",
        color: "green",
        tooltip: "Khuyến mãi đang hoạt động",
      };
    } else {
      // Inactive = Hết hạn
      return {
        text: "Hết hạn",
        color: "red",
        tooltip:
          now > endDate
            ? `Đã quá ngày kết thúc: ${endDate.toLocaleDateString("vi-VN")}`
            : "Khuyến mãi đã ngừng hoạt động",
      };
    }
  };

  const columns = [
    {
      title: "Mã KM",
      dataIndex: "promoCode",
      key: "promoCode",
      width: 100,
      align: "center" as const,
      render: (text: string) => (
        <span style={{ fontSize: "13px" }}>{text}</span>
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      width: 200,
      align: "center" as const,
      render: (text: string) => (
        <span style={{ fontSize: "13px" }}>{text}</span>
      ),
    },
    {
      title: "Sản phẩm",
      key: "products",
      width: 100,
      align: "center" as const,
      render: (_: any, record: any) => {
        const productCount = record.products?.length || 0;
        return (
          <span
            style={{
              fontSize: "13px",
              color: productCount > 0 ? "#1890ff" : "#999",
            }}
          >
            {productCount > 0 ? `${productCount} SP` : "Tất cả"}
          </span>
        );
      },
    },
    {
      title: "Loại giảm",
      dataIndex: "discountType",
      key: "discountType",
      width: 100,
      align: "center" as const,
      render: (type: string) => (
        <span style={{ fontSize: "13px" }}>
          {type === "percent" ? "Phần trăm" : "Cố định"}
        </span>
      ),
    },
    {
      title: "Giá trị",
      dataIndex: "discountValue",
      key: "discountValue",
      width: 100,
      align: "center" as const,
      render: (value: number, record: Promotion) => (
        <span style={{ fontSize: "13px" }}>
          {record.discountType === "percent"
            ? `${value}%`
            : `${(value || 0).toLocaleString("vi-VN")}đ`}
        </span>
      ),
    },
    {
      title: "Đơn tối thiểu",
      dataIndex: "minOrderAmount",
      key: "minOrderAmount",
      width: 120,
      align: "center" as const,
      render: (amount: number) => (
        <span style={{ fontSize: "13px" }}>
          {(amount || 0).toLocaleString("vi-VN")}đ
        </span>
      ),
    },
    {
      title: "Thời gian",
      key: "period",
      width: 110,
      align: "center" as const,
      render: (_: any, record: Promotion) => {
        const start = new Date(record.startDate).toLocaleDateString("vi-VN");
        const end = new Date(record.endDate).toLocaleDateString("vi-VN");
        return (
          <div style={{ fontSize: "11px", lineHeight: "1.4" }}>
            <div style={{ color: "#52c41a", fontWeight: 500 }}>{start}</div>
            <div style={{ color: "#ff4d4f", fontWeight: 500 }}>{end}</div>
          </div>
        );
      },
    },
    {
      title: "Đã dùng/Giới hạn",
      key: "usage",
      width: 110,
      align: "center" as const,
      render: (_: any, record: Promotion) => {
        const percentage =
          record.usageLimit > 0
            ? Math.round((record.usedCount / record.usageLimit) * 100)
            : 0;
        const isFull =
          record.usedCount >= record.usageLimit && record.usageLimit > 0;

        return (
          <div style={{ fontSize: "12px" }}>
            <div
              style={{ fontWeight: 500 }}
            >{`${record.usedCount}/${record.usageLimit}`}</div>
            {record.usageLimit > 0 && (
              <div
                style={{
                  fontSize: "10px",
                  color: isFull
                    ? "#ff4d4f"
                    : percentage > 80
                    ? "#faad14"
                    : "#52c41a",
                  fontWeight: 500,
                }}
              >
                {percentage}%
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: "Trạng thái",
      key: "status",
      width: 130,
      align: "center" as const,
      render: (_: any, record: Promotion) => {
        const statusInfo = getPromotionStatusDisplay(record);
        const colorMap: any = {
          green: "#52c41a",
          orange: "#faad14",
          red: "#ff4d4f",
        };
        return (
          <Tooltip title={statusInfo.tooltip}>
            <span
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: colorMap[statusInfo.color] || statusInfo.color,
              }}
            >
              {statusInfo.text}
            </span>
          </Tooltip>
        );
      },
    },
    {
      title: "Thao tác",
      key: "action",
      width: 150,
      align: "center" as const,
      render: (_: any, record: Promotion) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
            style={{ fontSize: "13px" }}
          >
            Chi tiết
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            style={{ fontSize: "13px" }}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa?"
            onConfirm={() => handleDelete(record.promoId)}
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              style={{ fontSize: "13px" }}
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
          alignItems: "center",
        }}
      >
        <h2 style={{ margin: 0 }}>Quản lý khuyến mãi</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Thêm khuyến mãi
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={promotions}
        rowKey="promoId"
        loading={loading}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ["10", "50", "100"],
          showTotal: (total) => `Tổng ${total} mục`,
        }}
        size="small"
      />

      <PromotionModal
        visible={modalVisible}
        editingPromotion={editingPromotion}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        hideProductSelection={false}
      />

      <PromotionDetailModal
        visible={detailModalVisible}
        promotion={viewingPromotion}
        onClose={handleDetailModalClose}
      />
    </div>
  );
};

export default PromotionsPage;
