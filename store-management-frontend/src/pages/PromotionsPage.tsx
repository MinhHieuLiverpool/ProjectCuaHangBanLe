import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  message,
  Popconfirm,
  Tag,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { Promotion } from "@/types";
import { promotionService } from "@/services/common.service";
import dayjs from "dayjs";

const PromotionsPage: React.FC = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(
    null
  );
  const [form] = Form.useForm();

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
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    form.setFieldsValue({
      ...promotion,
      startDate: dayjs(promotion.startDate),
      endDate: dayjs(promotion.endDate),
    });
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

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const data = {
        ...values,
        startDate: values.startDate.format("YYYY-MM-DD"),
        endDate: values.endDate.format("YYYY-MM-DD"),
      };

      if (editingPromotion) {
        await promotionService.update(editingPromotion.promoId, data);
        message.success("Cập nhật khuyến mãi thành công!");
      } else {
        await promotionService.create(data);
        message.success("Thêm khuyến mãi thành công!");
      }
      setModalVisible(false);
      fetchData();
    } catch (error) {
      message.error("Lưu khuyến mãi thất bại!");
    }
  };

  const columns = [
    {
      title: "Mã KM",
      dataIndex: "promoCode",
      key: "promoCode",
      width: 120,
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Loại giảm",
      dataIndex: "discountType",
      key: "discountType",
      render: (type: string) => (type === "percent" ? "Phần trăm" : "Cố định"),
    },
    {
      title: "Giá trị",
      dataIndex: "discountValue",
      key: "discountValue",
      render: (value: number, record: Promotion) =>
        record.discountType === "percent"
          ? `${value}%`
          : `${value.toLocaleString("vi-VN")}đ`,
    },
    {
      title: "Đơn tối thiểu",
      dataIndex: "minOrderAmount",
      key: "minOrderAmount",
      render: (amount: number) => `${amount.toLocaleString("vi-VN")}đ`,
    },
    {
      title: "Đã dùng/Giới hạn",
      key: "usage",
      render: (_: any, record: Promotion) =>
        `${record.usedCount}/${record.usageLimit}`,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "active" ? "green" : "red"}>
          {status === "active" ? "Đang áp dụng" : "Ngừng"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 150,
      render: (_: any, record: Promotion) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa?"
            onConfirm={() => handleDelete(record.promoId)}
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
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
        }}
      >
        <h2>Quản lý khuyến mãi</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Thêm khuyến mãi
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={promotions}
        rowKey="promoId"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingPromotion ? "Cập nhật khuyến mãi" : "Thêm khuyến mãi"}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={700}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="promoCode"
            label="Mã khuyến mãi"
            rules={[{ required: true, message: "Vui lòng nhập mã!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={2} />
          </Form.Item>

          <Form.Item
            name="discountType"
            label="Loại giảm giá"
            rules={[{ required: true, message: "Vui lòng chọn loại!" }]}
          >
            <Select>
              <Select.Option value="percent">Phần trăm (%)</Select.Option>
              <Select.Option value="fixed">Cố định (đ)</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="discountValue"
            label="Giá trị giảm"
            rules={[{ required: true, message: "Vui lòng nhập giá trị!" }]}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="minOrderAmount"
            label="Đơn hàng tối thiểu"
            rules={[{ required: true, message: "Vui lòng nhập giá trị!" }]}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="usageLimit"
            label="Giới hạn sử dụng"
            rules={[{ required: true, message: "Vui lòng nhập giá trị!" }]}
          >
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="startDate"
            label="Ngày bắt đầu"
            rules={[{ required: true, message: "Vui lòng chọn ngày!" }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="endDate"
            label="Ngày kết thúc"
            rules={[{ required: true, message: "Vui lòng chọn ngày!" }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
          >
            <Select>
              <Select.Option value="active">Đang áp dụng</Select.Option>
              <Select.Option value="inactive">Ngừng</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PromotionsPage;
