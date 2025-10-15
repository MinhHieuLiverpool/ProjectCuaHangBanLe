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
  Button,
  Table,
  Space,
  Tag,
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { productService } from "@/services/product.service";
import {
  ComboPromotion,
  comboPromotionService,
} from "@/services/combo.service";
import dayjs from "dayjs";

interface Product {
  productId: number;
  productName: string;
  price: number;
}

interface ComboItem {
  productId: number;
  productName?: string;
  price?: number;
  quantity: number;
}

interface ComboPromotionModalProps {
  visible: boolean;
  editingCombo: ComboPromotion | null;
  onClose: () => void;
  onSuccess: () => void;
}

const ComboPromotionModal: React.FC<ComboPromotionModalProps> = ({
  visible,
  editingCombo,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [comboItems, setComboItems] = useState<ComboItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    null
  );
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  useEffect(() => {
    if (visible) {
      loadProducts();
      if (editingCombo) {
        form.setFieldsValue({
          ...editingCombo,
          startDate: dayjs(editingCombo.startDate),
          endDate: dayjs(editingCombo.endDate),
        });
        setComboItems(
          editingCombo.items.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            price: item.price,
            quantity: item.quantity,
          }))
        );
      } else {
        form.resetFields();
        setComboItems([]);
      }
    }
  }, [visible, editingCombo, form]);

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

  const handleAddProduct = () => {
    if (!selectedProductId) {
      message.warning("Vui lòng chọn sản phẩm!");
      return;
    }

    // Kiểm tra đã có chưa
    if (comboItems.some((item) => item.productId === selectedProductId)) {
      message.warning("Sản phẩm đã có trong combo!");
      return;
    }

    const product = products.find((p) => p.productId === selectedProductId);
    if (product) {
      setComboItems([
        ...comboItems,
        {
          productId: product.productId,
          productName: product.productName,
          price: product.price,
          quantity: selectedQuantity,
        },
      ]);
      setSelectedProductId(null);
      setSelectedQuantity(1);
    }
  };

  const handleRemoveProduct = (productId: number) => {
    setComboItems(comboItems.filter((item) => item.productId !== productId));
  };

  const handleUpdateQuantity = (productId: number, quantity: number) => {
    setComboItems(
      comboItems.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleSubmit = async () => {
    try {
      if (comboItems.length === 0) {
        message.warning("Vui lòng thêm ít nhất 1 sản phẩm vào combo!");
        return;
      }

      const values = await form.validateFields();
      const data = {
        ...values,
        startDate: values.startDate.format("YYYY-MM-DD"),
        endDate: values.endDate.format("YYYY-MM-DD"),
        items: comboItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      };

      if (editingCombo) {
        await comboPromotionService.update(editingCombo.comboId, data);
        message.success("Cập nhật combo khuyến mãi thành công!");
      } else {
        await comboPromotionService.create(data);
        message.success("Thêm combo khuyến mãi thành công!");
      }
      onSuccess();
      onClose();
    } catch (error) {
      message.error("Lưu combo khuyến mãi thất bại!");
    }
  };

  const validateEndDate = (_: any, value: any) => {
    if (!value) {
      return Promise.reject(new Error("Vui lòng chọn ngày!"));
    }

    if (editingCombo) {
      const oldEndDate = dayjs(editingCombo.endDate).startOf("day");
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

  const columns = [
    {
      title: "Sản phẩm",
      dataIndex: "productName",
      key: "productName",
      width: "40%",
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      width: "25%",
      render: (price: number) => `${price.toLocaleString()}đ`,
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      width: "20%",
      render: (quantity: number, record: ComboItem) => (
        <InputNumber
          min={1}
          value={quantity}
          onChange={(val) => handleUpdateQuantity(record.productId, val || 1)}
          style={{ width: 80 }}
        />
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: "15%",
      render: (_: any, record: ComboItem) => (
        <Button
          type="link"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveProduct(record.productId)}
        >
          Xóa
        </Button>
      ),
    },
  ];

  const totalOriginalPrice = comboItems.reduce(
    (sum, item) => sum + (item.price || 0) * item.quantity,
    0
  );

  return (
    <Modal
      title={
        editingCombo ? "Cập nhật combo khuyến mãi" : "Thêm combo khuyến mãi"
      }
      open={visible}
      onOk={handleSubmit}
      onCancel={onClose}
      width={900}
      okText="Lưu"
      cancelText="Hủy"
    >
      <Form form={form} layout="vertical">
        {/* Thông tin cơ bản */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="comboName"
              label="Tên combo"
              rules={[{ required: true, message: "Vui lòng nhập tên combo!" }]}
            >
              <Input
                placeholder="VD: Combo 2 SP giảm 20%"
                disabled={!!editingCombo}
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
          <Input.TextArea rows={2} placeholder="Nhập mô tả combo" />
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
                <Select.Option value="percentage">Phần trăm (%)</Select.Option>
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

        {/* Thời gian và giới hạn */}
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="startDate"
              label="Ngày bắt đầu"
              rules={[{ required: true, message: "Vui lòng chọn ngày!" }]}
            >
              <DatePicker
                style={{ width: "100%" }}
                format="DD/MM/YYYY"
                placeholder="Chọn ngày bắt đầu"
                disabled={!!editingCombo}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
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
          <Col span={8}>
            <Form.Item
              name="usageLimit"
              label="Giới hạn sử dụng"
              rules={[{ required: true, message: "Vui lòng nhập giá trị!" }]}
            >
              <InputNumber
                min={0}
                style={{ width: "100%" }}
                placeholder="0 = không giới hạn"
                disabled={!!editingCombo}
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Sản phẩm trong combo */}
        <Divider style={{ margin: "16px 0" }}>Sản phẩm trong combo</Divider>

        <Space.Compact style={{ width: "100%", marginBottom: 16 }}>
          <Select
            placeholder="Chọn sản phẩm"
            style={{ width: "50%" }}
            loading={loading}
            value={selectedProductId}
            onChange={setSelectedProductId}
            showSearch
            optionFilterProp="label"
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
          <InputNumber
            min={1}
            value={selectedQuantity}
            onChange={(val) => setSelectedQuantity(val || 1)}
            placeholder="SL"
            style={{ width: "20%" }}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddProduct}
            style={{ width: "30%" }}
          >
            Thêm sản phẩm
          </Button>
        </Space.Compact>

        <Table
          columns={columns}
          dataSource={comboItems}
          rowKey="productId"
          pagination={false}
          size="small"
          locale={{ emptyText: "Chưa có sản phẩm nào" }}
          scroll={{ y: 200 }}
        />

        {comboItems.length > 0 && (
          <div
            style={{
              marginTop: 16,
              padding: 12,
              background: "#f5f5f5",
              borderRadius: 4,
            }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <div style={{ fontSize: 13 }}>
                  <strong>Tổng số sản phẩm:</strong>{" "}
                  <Tag color="blue">
                    {comboItems.reduce((sum, item) => sum + item.quantity, 0)}{" "}
                    SP
                  </Tag>
                </div>
              </Col>
              <Col span={12} style={{ textAlign: "right" }}>
                <div style={{ fontSize: 13 }}>
                  <strong>Giá trị combo:</strong>{" "}
                  <span style={{ color: "#52c41a", fontSize: 15 }}>
                    {totalOriginalPrice.toLocaleString()}đ
                  </span>
                </div>
              </Col>
            </Row>
          </div>
        )}
      </Form>
    </Modal>
  );
};

export default ComboPromotionModal;
