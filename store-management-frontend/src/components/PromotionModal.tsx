import React, { useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  message,
  Row,
  Col,
} from "antd";
import { Promotion } from "@/types";
import { promotionService } from "@/services/common.service";
import dayjs from "dayjs";

interface PromotionModalProps {
  visible: boolean;
  editingPromotion: Promotion | null;
  onClose: () => void;
  onSuccess: () => void;
}

const PromotionModal: React.FC<PromotionModalProps> = ({
  visible,
  editingPromotion,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      if (editingPromotion) {
        form.setFieldsValue({
          ...editingPromotion,
          startDate: dayjs(editingPromotion.startDate),
          endDate: dayjs(editingPromotion.endDate),
        });
      } else {
        form.resetFields();
      }
    }
  }, [visible, editingPromotion, form]);

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
      onSuccess();
      onClose();
    } catch (error) {
      message.error("Lưu khuyến mãi thất bại!");
    }
  };

  return (
    <Modal
      title={editingPromotion ? "Cập nhật khuyến mãi" : "Thêm khuyến mãi"}
      open={visible}
      onOk={handleSubmit}
      onCancel={onClose}
      width={800}
      okText="Lưu"
      cancelText="Hủy"
    >
      <Form form={form} layout="vertical">
        {/* Thông tin cơ bản */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="promoCode"
              label="Mã khuyến mãi"
              rules={[{ required: true, message: "Vui lòng nhập mã!" }]}
            >
              <Input placeholder="Nhập mã khuyến mãi" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="status"
              label="Trạng thái"
              rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
            >
              <Select placeholder="Chọn trạng thái">
                <Select.Option value="active">Đang áp dụng</Select.Option>
                <Select.Option value="inactive">Ngừng</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="description" label="Mô tả">
          <Input.TextArea rows={3} placeholder="Nhập mô tả khuyến mãi" />
        </Form.Item>

        {/* Thông tin giảm giá */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="discountType"
              label="Loại giảm giá"
              rules={[{ required: true, message: "Vui lòng chọn loại!" }]}
            >
              <Select placeholder="Chọn loại giảm giá">
                <Select.Option value="percent">Phần trăm (%)</Select.Option>
                <Select.Option value="fixed">Cố định (đ)</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="discountValue"
              label="Giá trị giảm"
              rules={[{ required: true, message: "Vui lòng nhập giá trị!" }]}
            >
              <InputNumber
                min={0}
                style={{ width: "100%" }}
                placeholder="Nhập giá trị giảm"
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Điều kiện áp dụng */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="minOrderAmount"
              label="Đơn hàng tối thiểu"
              rules={[{ required: true, message: "Vui lòng nhập giá trị!" }]}
            >
              <InputNumber
                min={0}
                style={{ width: "100%" }}
                placeholder="Nhập giá trị đơn hàng tối thiểu"
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="usageLimit"
              label="Giới hạn sử dụng"
              rules={[{ required: true, message: "Vui lòng nhập giá trị!" }]}
            >
              <InputNumber
                min={1}
                style={{ width: "100%" }}
                placeholder="Nhập số lần sử dụng tối đa"
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Thời gian áp dụng */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="startDate"
              label="Ngày bắt đầu"
              rules={[{ required: true, message: "Vui lòng chọn ngày!" }]}
            >
              <DatePicker
                style={{ width: "100%" }}
                format="DD/MM/YYYY"
                placeholder="Chọn ngày bắt đầu"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="endDate"
              label="Ngày kết thúc"
              rules={[{ required: true, message: "Vui lòng chọn ngày!" }]}
            >
              <DatePicker
                style={{ width: "100%" }}
                format="DD/MM/YYYY"
                placeholder="Chọn ngày kết thúc"
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default PromotionModal;
