import React, { useEffect, useState } from "react";
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
  Divider,
  Tag,
  Spin,
} from "antd";
import { Promotion } from "@/types";
import { promotionService } from "@/services/common.service";
import { productService } from "@/services/product.service";
import dayjs from "dayjs";

interface Product {
  productId: number;
  productName: string;
  price: number;
}

interface PromotionModalProps {
  visible: boolean;
  editingPromotion: Promotion | null;
  onClose: () => void;
  onSuccess: () => void;
  hideProductSelection?: boolean; // True = không hiện chọn sản phẩm (khuyến mãi chung)
}

const PromotionModal: React.FC<PromotionModalProps> = ({
  visible,
  editingPromotion,
  onClose,
  onSuccess,
  hideProductSelection = false,
}) => {
  const [form] = Form.useForm();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);

  useEffect(() => {
    if (visible) {
      loadProducts();
      if (editingPromotion) {
        form.setFieldsValue({
          ...editingPromotion,
          startDate: dayjs(editingPromotion.startDate),
          endDate: dayjs(editingPromotion.endDate),
        });
        // TODO: Load selected products từ API
        setSelectedProductIds([]);
      } else {
        form.resetFields();
        setSelectedProductIds([]);
      }
    }
  }, [visible, editingPromotion, form]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getAll();
      setProducts(
        data.map((p) => ({
          productId: p.productId,
          productName: p.productName,
          price: p.price,
        }))
      );
    } catch (error) {
      message.error("Tải danh sách sản phẩm thất bại!");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const data = {
        ...values,
        startDate: values.startDate.format("YYYY-MM-DD"),
        endDate: values.endDate.format("YYYY-MM-DD"),
        productIds: selectedProductIds, // Thêm danh sách sản phẩm
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

  // Validator cho ngày kết thúc khi sửa
  const validateEndDate = (_: any, value: any) => {
    if (!value) {
      return Promise.reject(new Error("Vui lòng chọn ngày!"));
    }

    // Nếu đang sửa, kiểm tra ngày kết thúc mới phải >= ngày kết thúc cũ
    if (editingPromotion) {
      const oldEndDate = dayjs(editingPromotion.endDate).startOf('day');
      const newEndDate = value.startOf('day');
      
      if (newEndDate.isBefore(oldEndDate)) {
        return Promise.reject(
          new Error(`Ngày kết thúc mới không được trước ngày ${oldEndDate.format("DD/MM/YYYY")}`)
        );
      }
    }

    return Promise.resolve();
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
              <Input 
                placeholder="Nhập mã khuyến mãi" 
                disabled={!!editingPromotion}
              />
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
                <Select.Option value="inactive">Hết hạn</Select.Option>
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
                disabled={!!editingPromotion}
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
                disabled={!!editingPromotion}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="endDate"
              label="Ngày kết thúc"
              rules={[
                { required: true, message: "Vui lòng chọn ngày!" },
                { validator: validateEndDate }
              ]}
              validateTrigger={['onChange', 'onBlur']}
            >
              <DatePicker
                style={{ width: "100%" }}
                format="DD/MM/YYYY"
                placeholder="Chọn ngày kết thúc"
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Áp dụng cho sản phẩm - chỉ hiện khi không phải khuyến mãi chung */}
        {!hideProductSelection && (
          <>
            <Divider style={{ margin: "16px 0" }}>Áp dụng cho sản phẩm</Divider>
            
            <Form.Item
              label="Chọn sản phẩm áp dụng"
              tooltip="Chọn các sản phẩm được áp dụng khuyến mãi này"
            >
          <Select
            mode="multiple"
            placeholder="Chọn sản phẩm"
            style={{ width: "100%" }}
            loading={loading}
            value={selectedProductIds}
            onChange={setSelectedProductIds}
            optionFilterProp="label"
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? "")
                .toString()
                .toLowerCase()
                .includes(input.toLowerCase())
            }
            options={products.map((product) => ({
              value: product.productId,
              label: `${product.productName} - ${product.price.toLocaleString()}đ`,
            }))}
          />
        </Form.Item>

        {selectedProductIds.length > 0 && (
          <div style={{ marginTop: 8 }}>
            <span style={{ color: "#666", fontSize: 13 }}>
              Đã chọn: {selectedProductIds.length} sản phẩm
            </span>
            <div style={{ marginTop: 8 }}>
              {selectedProductIds.slice(0, 5).map((id) => {
                const product = products.find((p) => p.productId === id);
                return product ? (
                  <Tag key={id} color="blue" style={{ marginBottom: 4 }}>
                    {product.productName}
                  </Tag>
                ) : null;
              })}
              {selectedProductIds.length > 5 && (
                <Tag>+{selectedProductIds.length - 5} sản phẩm khác</Tag>
              )}
            </div>
          </div>
        )}
          </>
        )}
      </Form>
    </Modal>
  );
};

export default PromotionModal;
