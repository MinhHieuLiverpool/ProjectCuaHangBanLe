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
  Button,
} from "antd";
import { Promotion, Product } from "@/types";
import { promotionService, categoryService } from "@/services/common.service";
import { productService } from "@/services/product.service";
import dayjs from "dayjs";

interface Category {
  categoryId: number;
  categoryName: string;
  status: string;
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
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [applyType, setApplyType] = useState<string>("order");

  useEffect(() => {
    if (visible) {
      loadProducts();
      loadCategories();
      if (editingPromotion) {
        form.setFieldsValue({
          ...editingPromotion,
          startDate: dayjs(editingPromotion.startDate),
          endDate: dayjs(editingPromotion.endDate),
          applyType: editingPromotion.applyType || "order",
        });
        setApplyType(editingPromotion.applyType || "order");
        // Load selected products từ promotion
        const productIds =
          (editingPromotion as any).products?.map((p: any) => p.productId) ||
          [];
        setSelectedProductIds(productIds);
      } else {
        form.resetFields();
        form.setFieldsValue({
          applyType: "order",
          status: "active", // Luôn set active khi tạo mới
        });
        setApplyType("order");
        setSelectedProductIds([]);
      }
    }
  }, [visible, editingPromotion, form]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getAll();
      setProducts(data);
    } catch (error) {
      message.error("Tải danh sách sản phẩm thất bại!");
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await categoryService.getAll();
      setCategories(data.filter((c) => c.status === "active"));
    } catch (error) {
      message.error("Tải danh sách loại sản phẩm thất bại!");
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // Xác định applyType dựa trên form value và productIds
      let finalApplyType = values.applyType || "order";
      if (selectedProductIds.length > 0 && finalApplyType === "order") {
        // Nếu có sản phẩm được chọn nhưng applyType vẫn là order, tự động đổi thành product
        finalApplyType = "product";
      }

      const data = {
        ...values,
        startDate: values.startDate.format("YYYY-MM-DD"),
        endDate: values.endDate.format("YYYY-MM-DD"),
        applyType: finalApplyType,
        status: editingPromotion ? values.status : "active", // Luôn active khi tạo mới
        productIds: selectedProductIds, // Luôn gửi productIds
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
      const oldEndDate = dayjs(editingPromotion.endDate).startOf("day");
      const newEndDate = value.startOf("day");

      if (newEndDate.isBefore(oldEndDate)) {
        return Promise.reject(
          new Error(
            `Ngày kết thúc mới không được trước ngày ${oldEndDate.format(
              "DD/MM/YYYY"
            )}`
          )
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
              name="applyType"
              label="Loại khuyến mãi"
              rules={[{ required: true, message: "Vui lòng chọn loại!" }]}
            >
              <Select
                placeholder="Chọn loại khuyến mãi"
                onChange={(value) => setApplyType(value)}
                disabled={!!editingPromotion}
              >
                <Select.Option value="order">
                  Giảm giá theo đơn hàng
                </Select.Option>
                <Select.Option value="product">
                  Giảm giá theo sản phẩm
                </Select.Option>
                <Select.Option value="combo">
                  Giảm giá nhiều sản phẩm cùng lúc
                </Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {editingPromotion && (
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Trạng thái"
                rules={[
                  { required: true, message: "Vui lòng chọn trạng thái!" },
                ]}
              >
                <Select placeholder="Chọn trạng thái">
                  <Select.Option value="active">Đang áp dụng</Select.Option>
                  <Select.Option value="inactive">Hết hạn</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}></Col>
          </Row>
        )}

        <Form.Item name="description" label="Mô tả">
          <Input.TextArea rows={2} placeholder="Nhập mô tả khuyến mãi" />
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
                { validator: validateEndDate },
              ]}
              validateTrigger={["onChange", "onBlur"]}
            >
              <DatePicker
                style={{ width: "100%" }}
                format="DD/MM/YYYY"
                placeholder="Chọn ngày kết thúc"
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Áp dụng cho sản phẩm - chỉ hiện khi applyType là product hoặc category */}
        {!hideProductSelection &&
          (applyType === "product" || applyType === "combo") && (
            <>
              <Divider style={{ margin: "16px 0" }}>
                {applyType === "product"
                  ? "Áp dụng cho sản phẩm"
                  : "Chọn nhiều sản phẩm cùng lúc"}
              </Divider>

              <Form.Item
                label={
                  applyType === "product"
                    ? "Chọn sản phẩm áp dụng"
                    : "Chọn các sản phẩm áp dụng"
                }
                tooltip={
                  applyType === "product"
                    ? "Chọn các sản phẩm được áp dụng khuyến mãi này"
                    : "Chọn nhiều sản phẩm. Khuyến mãi sẽ áp dụng cho TẤT CẢ sản phẩm đã chọn nếu đơn hàng có ít nhất 1 sản phẩm trong danh sách này."
                }
              >
                <Select
                  mode="multiple"
                  placeholder={
                    applyType === "product"
                      ? "Chọn sản phẩm"
                      : "Chọn nhiều sản phẩm"
                  }
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
                  options={
                    applyType === "product" || applyType === "combo"
                      ? products.map((product) => ({
                          value: product.productId,
                          label: `${
                            product.productName
                          } - ${product.price.toLocaleString()}đ`,
                        }))
                      : categories.map((category) => ({
                          value: category.categoryId,
                          label: category.categoryName,
                        }))
                  }
                />
              </Form.Item>

              {selectedProductIds.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ color: "#666", fontSize: 13 }}>
                      Đã chọn: {selectedProductIds.length}{" "}
                      {applyType === "product" || applyType === "combo"
                        ? "sản phẩm"
                        : "loại sản phẩm"}
                    </span>
                    <Button
                      type="link"
                      size="small"
                      onClick={() => setSelectedProductIds([])}
                      style={{ padding: 0, height: "auto", fontSize: 12 }}
                    >
                      Xóa tất cả
                    </Button>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    {selectedProductIds.slice(0, 5).map((id) => {
                      const item =
                        applyType === "product" || applyType === "combo"
                          ? products.find((p) => p.productId === id)
                          : categories.find((c) => c.categoryId === id);
                      return item ? (
                        <Tag key={id} color="blue" style={{ marginBottom: 4 }}>
                          {applyType === "product" || applyType === "combo"
                            ? (item as Product).productName
                            : (item as Category).categoryName}
                        </Tag>
                      ) : null;
                    })}
                    {selectedProductIds.length > 5 && (
                      <Tag>
                        +{selectedProductIds.length - 5}{" "}
                        {applyType === "product" || applyType === "combo"
                          ? "sản phẩm"
                          : "loại sản phẩm"}{" "}
                        khác
                      </Tag>
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
