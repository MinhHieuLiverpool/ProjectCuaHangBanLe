import React from "react";
import { Modal, Descriptions, Tag, Divider, List, Empty } from "antd";
import { Promotion } from "@/types";

interface PromotionDetailModalProps {
  visible: boolean;
  promotion: Promotion | null;
  onClose: () => void;
}

const PromotionDetailModal: React.FC<PromotionDetailModalProps> = ({
  visible,
  promotion,
  onClose,
}) => {
  if (!promotion) return null;

  // Hàm lấy thông tin hiển thị trạng thái
  const getPromotionStatusDisplay = () => {
    const now = new Date();
    const startDate = new Date(promotion.startDate);
    const endDate = new Date(promotion.endDate);

    if (now < startDate) {
      return {
        text: "Chưa bắt đầu",
        color: "orange",
      };
    }

    if (now > endDate || promotion.status !== "active") {
      return {
        text: "Hết hạn",
        color: "red",
      };
    }

    return {
      text: "Đang áp dụng",
      color: "green",
    };
  };

  const statusInfo = getPromotionStatusDisplay();
  const usagePercentage =
    promotion.usageLimit > 0
      ? Math.round((promotion.usedCount / promotion.usageLimit) * 100)
      : 0;

  const getApplyTypeText = (type?: string) => {
    switch (type) {
      case "product":
        return "Giảm giá theo sản phẩm";
      case "combo":
        return "Giảm giá combo sản phẩm";
      case "order":
      default:
        return "Giảm giá theo đơn hàng";
    }
  };

  return (
    <Modal
      title="Chi tiết khuyến mãi"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      <Descriptions bordered column={2} size="small">
        <Descriptions.Item label="Mã khuyến mãi" span={2}>
          <strong style={{ fontSize: "14px" }}>{promotion.promoCode}</strong>
        </Descriptions.Item>

        <Descriptions.Item label="Trạng thái" span={1}>
          <Tag color={statusInfo.color}>{statusInfo.text}</Tag>
        </Descriptions.Item>

        <Descriptions.Item label="Loại khuyến mãi" span={1}>
          {getApplyTypeText(promotion.applyType)}
        </Descriptions.Item>

        <Descriptions.Item label="Mô tả" span={2}>
          {promotion.description || "Không có mô tả"}
        </Descriptions.Item>

        <Descriptions.Item label="Loại giảm giá">
          {promotion.discountType === "percent"
            ? "Phần trăm (%)"
            : "Cố định (đ)"}
        </Descriptions.Item>

        <Descriptions.Item label="Giá trị giảm">
          <strong style={{ color: "#52c41a", fontSize: "14px" }}>
            {promotion.discountType === "percent"
              ? `${promotion.discountValue}%`
              : `${(promotion.discountValue || 0).toLocaleString("vi-VN")}đ`}
          </strong>
        </Descriptions.Item>

        <Descriptions.Item label="Đơn hàng tối thiểu" span={2}>
          {(promotion.minOrderAmount || 0).toLocaleString("vi-VN")}đ
        </Descriptions.Item>

        <Descriptions.Item label="Ngày bắt đầu">
          {new Date(promotion.startDate).toLocaleDateString("vi-VN")}
        </Descriptions.Item>

        <Descriptions.Item label="Ngày kết thúc">
          {new Date(promotion.endDate).toLocaleDateString("vi-VN")}
        </Descriptions.Item>

        <Descriptions.Item label="Đã sử dụng">
          <span style={{ fontWeight: 500 }}>
            {promotion.usedCount} / {promotion.usageLimit}
          </span>
        </Descriptions.Item>

        <Descriptions.Item label="Tỷ lệ sử dụng">
          <span
            style={{
              fontWeight: 600,
              color:
                usagePercentage >= 100
                  ? "#ff4d4f"
                  : usagePercentage > 80
                  ? "#faad14"
                  : "#52c41a",
            }}
          >
            {usagePercentage}%
          </span>
        </Descriptions.Item>
      </Descriptions>

      {/* Hiển thị danh sách sản phẩm áp dụng */}
      {(promotion.applyType === "product" ||
        promotion.applyType === "combo") && (
        <>
          <Divider
            orientation="left"
            style={{ marginTop: 20, marginBottom: 16 }}
          >
            Sản phẩm áp dụng ({promotion.products?.length || 0})
          </Divider>

          {promotion.products && promotion.products.length > 0 ? (
            <List
              size="small"
              bordered
              dataSource={promotion.products}
              renderItem={(product) => (
                <List.Item>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      width: "100%",
                    }}
                  >
                    <span>{product.productName}</span>
                    {product.price && (
                      <span style={{ color: "#1890ff" }}>
                        {product.price.toLocaleString("vi-VN")}đ
                      </span>
                    )}
                  </div>
                </List.Item>
              )}
              style={{ maxHeight: "300px", overflowY: "auto" }}
            />
          ) : (
            <Empty
              description="Không có sản phẩm nào được áp dụng"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </>
      )}

      {promotion.applyType === "order" && (
        <div
          style={{
            marginTop: 20,
            padding: "12px",
            background: "#f0f2f5",
            borderRadius: "4px",
          }}
        >
          <span style={{ fontSize: "13px", color: "#666" }}>
            Khuyến mãi này áp dụng cho tất cả sản phẩm trong đơn hàng đạt giá
            trị tối thiểu.
          </span>
        </div>
      )}
    </Modal>
  );
};

export default PromotionDetailModal;
