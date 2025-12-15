import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Space,
  message,
  Popconfirm,
  Tooltip,
  Tag,
  Input,
  Select,
  Row,
  Col,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
  EyeInvisibleOutlined,
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
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetchData();
  }, []);

  // Tự động tìm kiếm khi thay đổi keyword hoặc status filter
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      handleSearch();
    }, 500); // Debounce 500ms để tránh gọi API quá nhiều

    return () => clearTimeout(delaySearch);
  }, [searchKeyword, statusFilter]);

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

  const handleSearch = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (searchKeyword.trim()) {
        params.keyword = searchKeyword.trim();
      }
      if (statusFilter && statusFilter !== "all") {
        params.promotionStatus = statusFilter;
      }

      const data = await promotionService.search(params);
      setPromotions(data);
    } catch (error) {
      message.error("Tìm kiếm thất bại!");
    } finally {
      setLoading(false);
    }
  };

  const handleResetSearch = () => {
    setSearchKeyword("");
    setStatusFilter("all");
    fetchData();
  };

  const handleCreate = () => {
    setEditingPromotion(null);
    setModalVisible(true);
  };

  const handleEdit = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    setModalVisible(true);
  };

  const handleHide = async (promoId: number) => {
    try {
      await promotionService.delete(promoId);
      message.success("Ẩn khuyến mãi thành công!");
      // Sau khi ẩn, nếu đang có filter thì search lại, không thì fetch all
      if (searchKeyword.trim() || (statusFilter && statusFilter !== "all")) {
        handleSearch();
      } else {
        fetchData();
      }
    } catch (error) {
      message.error("Ẩn khuyến mãi thất bại!");
    }
  };

  const handleModalClose = () => {
    setModalVisible(false);
  };

  const handleModalSuccess = () => {
    // Sau khi tạo/sửa thành công, nếu đang có filter thì search lại, không thì fetch all
    if (searchKeyword.trim() || (statusFilter && statusFilter !== "all")) {
      handleSearch();
    } else {
      fetchData();
    }
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

    // Sử dụng promotionStatus từ backend nếu có
    const promotionStatus = (promotion as any).promotionStatus || "";

    // 1. Đã ẩn (hidden)
    if (promotionStatus === "hidden" || promotion.status === "hidden") {
      return {
        text: "Đã ẩn",
        color: "gray",
        tooltip: "Khuyến mãi đã bị ẩn",
      };
    }

    // 2. Chưa đến (upcoming)
    if (promotionStatus === "upcoming" || now < startDate) {
      return {
        text: "Chưa đến",
        color: "orange",
        tooltip: `Sẽ bắt đầu từ ${startDate.toLocaleDateString("vi-VN")}`,
      };
    }

    // 3. Hết hạn (expired)
    if (promotionStatus === "expired" || now > endDate) {
      return {
        text: "Hết hạn",
        color: "red",
        tooltip: `Đã quá ngày kết thúc: ${endDate.toLocaleDateString("vi-VN")}`,
      };
    }

    // 4. Đang áp dụng (active)
    return {
      text: "Đang áp dụng",
      color: "green",
      tooltip: "Khuyến mãi đang hoạt động",
    };
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
          gray: "#8c8c8c",
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
      render: (_: any, record: Promotion) => {
        const promotionStatus = (record as any).promotionStatus || "";
        const isHidden =
          promotionStatus === "hidden" || record.status === "hidden";

        return (
          <Space>
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
              style={{ fontSize: "13px" }}
            >
              Chi tiết
            </Button>
            {!isHidden && (
              <Button
                type="link"
                icon={<EditOutlined />}
                onClick={() => handleEdit(record)}
                style={{ fontSize: "13px" }}
              >
                Sửa
              </Button>
            )}
            {!isHidden && (
              <Popconfirm
                title="Bạn có chắc muốn ẩn khuyến mãi này?"
                description="Khuyến mãi sẽ không bị xóa hoàn toàn, chỉ được ẩn đi."
                onConfirm={() => handleHide(record.promoId)}
                okText="Ẩn"
                cancelText="Hủy"
              >
                <Button
                  type="link"
                  danger
                  icon={<EyeInvisibleOutlined />}
                  style={{ fontSize: "13px" }}
                >
                  Ẩn
                </Button>
              </Popconfirm>
            )}
          </Space>
        );
      },
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

      {/* Bộ lọc tìm kiếm */}
      <div
        style={{
          marginBottom: 16,
          padding: "16px",
          background: "#f5f5f5",
          borderRadius: "8px",
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Input
              placeholder="Tìm kiếm theo mã hoặc mô tả khuyến mãi"
              prefix={<SearchOutlined />}
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onPressEnter={handleSearch}
              allowClear
            />
          </Col>
          <Col span={8}>
            <Select
              placeholder="Lọc theo trạng thái"
              style={{ width: "100%" }}
              value={statusFilter}
              onChange={setStatusFilter}
            >
              <Select.Option value="all">Tất cả trạng thái</Select.Option>
              <Select.Option value="upcoming">Chưa đến</Select.Option>
              <Select.Option value="active">Đang áp dụng</Select.Option>
              <Select.Option value="expired">Hết hạn</Select.Option>
              <Select.Option value="hidden">Đã ẩn</Select.Option>
            </Select>
          </Col>
          <Col span={4}>
            <Space>
              <Button onClick={handleResetSearch}>Làm mới</Button>
            </Space>
          </Col>
        </Row>
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
