import {
  AuditOutlined,
  EyeOutlined,
  FilterOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Descriptions,
  Input,
  message,
  Modal,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";

const { Title } = Typography;
const { RangePicker } = DatePicker;

interface AuditLog {
  auditId: number;
  userId?: number;
  username?: string;
  action: string;
  entityType: string;
  entityId?: number;
  entityName?: string;
  oldValues?: string;
  newValues?: string;
  changesSummary?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  additionalInfo?: string;
}

interface AuditLogFilter {
  action?: string;
  entityType?: string;
  username?: string;
  fromDate?: string;
  toDate?: string;
  page: number;
  pageSize: number;
}

const actionColors: { [key: string]: string } = {
  CREATE: "success",
  UPDATE: "processing",
  DELETE: "error",
  SOFT_DELETE: "warning",
  VIEW: "default",
  LOGIN: "purple",
  LOGOUT: "default",
  APPROVE: "success",
  REJECT: "error",
  CANCEL: "warning",
};

const actionLabels: { [key: string]: string } = {
  CREATE: "Tạo mới",
  UPDATE: "Cập nhật",
  DELETE: "Xóa",
  SOFT_DELETE: "Ẩn",
  VIEW: "Xem",
  LOGIN: "Đăng nhập",
  LOGOUT: "Đăng xuất",
  APPROVE: "Duyệt",
  REJECT: "Từ chối",
  CANCEL: "Hủy",
};

const entityTypeLabels: { [key: string]: string } = {
  Product: "Sản phẩm",
  Category: "Danh mục",
  Supplier: "Nhà cung cấp",
  Customer: "Khách hàng",
  Order: "Đơn hàng",
  OrderItem: "Chi tiết đơn hàng",
  PurchaseOrder: "Phiếu nhập hàng",
  PurchaseItem: "Chi tiết phiếu nhập",
  Inventory: "Tồn kho",
  Warehouse: "Kho hàng",
  Promotion: "Khuyến mãi",
  Payment: "Thanh toán",
  User: "Người dùng",
  Auth: "Xác thực",
};

const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [filter, setFilter] = useState<AuditLogFilter>({
    page: 1,
    pageSize: 50,
  });
  const [total, setTotal] = useState(0);

  // Filter states
  const [searchUsername, setSearchUsername] = useState("");
  const [selectedAction, setSelectedAction] = useState<string | undefined>();
  const [selectedEntityType, setSelectedEntityType] = useState<
    string | undefined
  >();
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(
    null
  );

  useEffect(() => {
    fetchLogs();
  }, [filter.page, filter.pageSize]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: filter.page.toString(),
        pageSize: filter.pageSize.toString(),
      });

      if (filter.action) params.append("action", filter.action);
      if (filter.entityType) params.append("entityType", filter.entityType);
      if (filter.username) params.append("username", filter.username);
      if (filter.fromDate) params.append("fromDate", filter.fromDate);
      if (filter.toDate) params.append("toDate", filter.toDate);

      const response = await fetch(
        `http://localhost:5122/api/auditlogs?${params.toString()}`
      );
      if (!response.ok) throw new Error("Failed to fetch audit logs");

      const data = await response.json();
      setLogs(data);
      // Note: Backend chưa trả về total count, tạm tính
      setTotal(
        data.length === filter.pageSize
          ? filter.page * filter.pageSize + 1
          : (filter.page - 1) * filter.pageSize + data.length
      );
    } catch (error) {
      message.error("Không thể tải dữ liệu audit logs");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    setFilter({
      ...filter,
      page: 1,
      action: selectedAction,
      entityType: selectedEntityType,
      username: searchUsername || undefined,
      fromDate: dateRange?.[0]?.toISOString(),
      toDate: dateRange?.[1]?.toISOString(),
    });
    fetchLogs();
  };

  const handleClearFilter = () => {
    setSearchUsername("");
    setSelectedAction(undefined);
    setSelectedEntityType(undefined);
    setDateRange(null);
    setFilter({
      page: 1,
      pageSize: 50,
    });
    setTimeout(fetchLogs, 0);
  };

  const handleViewDetail = (record: AuditLog) => {
    setSelectedLog(record);
    setDetailModalVisible(true);
  };

  const formatDate = (dateString: string) => {
    return dayjs(dateString).format("DD/MM/YYYY HH:mm:ss");
  };

  const columns: ColumnsType<AuditLog> = [
    {
      title: "ID",
      dataIndex: "auditId",
      key: "auditId",
      width: 80,
      fixed: "left",
    },
    {
      title: "Thời gian",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 160,
      render: (text: string) => formatDate(text),
      sorter: (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: "Hành động",
      dataIndex: "action",
      key: "action",
      width: 120,
      render: (action: string) => (
        <Tag color={actionColors[action] || "default"}>
          {actionLabels[action] || action}
        </Tag>
      ),
      filters: Object.entries(actionLabels).map(([key, label]) => ({
        text: label,
        value: key,
      })),
      onFilter: (value, record) => record.action === value,
    },
    {
      title: "Đối tượng",
      dataIndex: "entityType",
      key: "entityType",
      width: 140,
      render: (type: string) => entityTypeLabels[type] || type,
      filters: Object.entries(entityTypeLabels).map(([key, label]) => ({
        text: label,
        value: key,
      })),
      onFilter: (value, record) => record.entityType === value,
    },
    {
      title: "Tên đối tượng",
      dataIndex: "entityName",
      key: "entityName",
      width: 200,
      render: (name: string, record) => name || `#${record.entityId}`,
    },
    {
      title: "Người thực hiện",
      dataIndex: "username",
      key: "username",
      width: 150,
      render: (username: string) => username || <Tag>Hệ thống</Tag>,
    },
    {
      title: "Mô tả",
      dataIndex: "changesSummary",
      key: "changesSummary",
      ellipsis: true,
    },
    {
      title: "Thao tác",
      key: "action",
      width: 100,
      fixed: "right",
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetail(record)}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  const renderJsonValue = (jsonString?: string) => {
    if (!jsonString)
      return <Typography.Text type="secondary">N/A</Typography.Text>;
    try {
      const obj = JSON.parse(jsonString);
      return (
        <pre
          style={{
            backgroundColor: "#f5f5f5",
            padding: 12,
            borderRadius: 4,
            overflow: "auto",
            maxHeight: 300,
          }}
        >
          {JSON.stringify(obj, null, 2)}
        </pre>
      );
    } catch {
      return <Typography.Text type="secondary">{jsonString}</Typography.Text>;
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Space align="center" style={{ marginBottom: 16 }}>
            <AuditOutlined style={{ fontSize: 24, color: "#1890ff" }} />
            <Title level={2} style={{ margin: 0 }}>
              Audit Logs - Lịch sử hoạt động
            </Title>
          </Space>
          <Typography.Text type="secondary">
            Theo dõi toàn bộ hoạt động trong hệ thống
          </Typography.Text>
        </Col>

        <Col span={24}>
          <Card
            title={
              <>
                <FilterOutlined /> Bộ lọc
              </>
            }
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <Typography.Text strong>Hành động:</Typography.Text>
                <Select
                  allowClear
                  placeholder="Tất cả"
                  style={{ width: "100%", marginTop: 8 }}
                  value={selectedAction}
                  onChange={setSelectedAction}
                >
                  {Object.entries(actionLabels).map(([key, label]) => (
                    <Select.Option key={key} value={key}>
                      {label}
                    </Select.Option>
                  ))}
                </Select>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <Typography.Text strong>Loại đối tượng:</Typography.Text>
                <Select
                  allowClear
                  placeholder="Tất cả"
                  style={{ width: "100%", marginTop: 8 }}
                  value={selectedEntityType}
                  onChange={setSelectedEntityType}
                >
                  {Object.entries(entityTypeLabels).map(([key, label]) => (
                    <Select.Option key={key} value={key}>
                      {label}
                    </Select.Option>
                  ))}
                </Select>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <Typography.Text strong>Người dùng:</Typography.Text>
                <Input
                  placeholder="Tìm theo tên..."
                  prefix={<SearchOutlined />}
                  style={{ marginTop: 8 }}
                  value={searchUsername}
                  onChange={(e) => setSearchUsername(e.target.value)}
                  onPressEnter={handleFilter}
                />
              </Col>

              <Col xs={24} sm={12} md={6}>
                <Typography.Text strong>Khoảng thời gian:</Typography.Text>
                <RangePicker
                  showTime
                  style={{ width: "100%", marginTop: 8 }}
                  value={dateRange}
                  onChange={(dates) => setDateRange(dates as any)}
                  format="DD/MM/YYYY HH:mm"
                />
              </Col>

              <Col span={24}>
                <Space>
                  <Button
                    type="primary"
                    icon={<SearchOutlined />}
                    onClick={handleFilter}
                  >
                    Lọc
                  </Button>
                  <Button onClick={handleClearFilter}>Xóa bộ lọc</Button>
                  <Button icon={<ReloadOutlined />} onClick={fetchLogs}>
                    Làm mới
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col span={24}>
          <Card>
            <Table
              columns={columns}
              dataSource={logs}
              rowKey="auditId"
              loading={loading}
              pagination={{
                current: filter.page,
                pageSize: filter.pageSize,
                total: total,
                showSizeChanger: true,
                showTotal: (total) => `Tổng ${total} bản ghi`,
                onChange: (page, pageSize) => {
                  setFilter({ ...filter, page, pageSize });
                },
              }}
              scroll={{ x: 1400 }}
            />
          </Card>
        </Col>
      </Row>

      <Modal
        title={
          <Space>
            <EyeOutlined />
            Chi tiết Audit Log #{selectedLog?.auditId}
          </Space>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button
            key="close"
            type="primary"
            onClick={() => setDetailModalVisible(false)}
          >
            Đóng
          </Button>,
        ]}
        width={900}
      >
        {selectedLog && (
          <div>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="ID" span={1}>
                {selectedLog.auditId}
              </Descriptions.Item>
              <Descriptions.Item label="Thời gian" span={1}>
                {formatDate(selectedLog.createdAt)}
              </Descriptions.Item>
              <Descriptions.Item label="Hành động" span={1}>
                <Tag color={actionColors[selectedLog.action] || "default"}>
                  {actionLabels[selectedLog.action] || selectedLog.action}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Đối tượng" span={1}>
                {entityTypeLabels[selectedLog.entityType] ||
                  selectedLog.entityType}
              </Descriptions.Item>
              <Descriptions.Item label="Tên đối tượng" span={1}>
                {selectedLog.entityName || `#${selectedLog.entityId}`}
              </Descriptions.Item>
              <Descriptions.Item label="ID đối tượng" span={1}>
                {selectedLog.entityId || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Người thực hiện" span={1}>
                {selectedLog.username || "Hệ thống"}
              </Descriptions.Item>
              <Descriptions.Item label="User ID" span={1}>
                {selectedLog.userId || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Mô tả thay đổi" span={2}>
                {selectedLog.changesSummary || "N/A"}
              </Descriptions.Item>
            </Descriptions>

            {selectedLog.oldValues && (
              <div style={{ marginTop: 16 }}>
                <Typography.Title level={5}>Giá trị cũ:</Typography.Title>
                {renderJsonValue(selectedLog.oldValues)}
              </div>
            )}

            {selectedLog.newValues && (
              <div style={{ marginTop: 16 }}>
                <Typography.Title level={5}>Giá trị mới:</Typography.Title>
                {renderJsonValue(selectedLog.newValues)}
              </div>
            )}

            {selectedLog.additionalInfo && (
              <div style={{ marginTop: 16 }}>
                <Typography.Title level={5}>
                  Thông tin bổ sung:
                </Typography.Title>
                {renderJsonValue(selectedLog.additionalInfo)}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AuditLogsPage;
