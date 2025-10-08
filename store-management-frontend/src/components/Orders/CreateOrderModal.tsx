import React, { useState } from "react";
import {
  Modal,
  Form,
  Select,
  InputNumber,
  message,
  Card,
  Row,
  Col,
  Divider,
  Button,
  Table,
} from "antd";
import { DeleteOutlined, UserAddOutlined } from "@ant-design/icons";
import { Customer, Product, Promotion } from "@/types";

interface OrderItem {
  productId: number;
  productName?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface CreateOrderModalProps {
  visible: boolean;
  customers: Customer[];
  products: Product[];
  promotions: Promotion[];
  userId: number;
  onClose: () => void;
  onSuccess: () => void;
  onAddCustomer: () => void;
}

const CreateOrderModal: React.FC<CreateOrderModalProps> = ({
  visible,
  customers,
  products,
  promotions,
  userId,
  onClose,
  onSuccess,
  onAddCustomer,
}) => {
  const [form] = Form.useForm();
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  const handleAddItem = () => {
    const productId = form.getFieldValue("productId");
    const quantity = form.getFieldValue("quantity") || 1;

    if (!productId) {
      message.warning("Vui lòng chọn sản phẩm!");
      return;
    }

    const product = products.find((p) => p.productId === productId);
    if (!product) return;

    // Kiểm tra tồn kho
    if (!product.stockQuantity || product.stockQuantity === 0) {
      message.error(`Sản phẩm "${product.productName}" đã hết hàng!`);
      return;
    }

    const existingItemIndex = orderItems.findIndex(
      (item) => item.productId === productId
    );

    // Tính tổng số lượng sẽ thêm
    const currentQuantityInCart =
      existingItemIndex >= 0 ? orderItems[existingItemIndex].quantity : 0;
    const totalQuantity = currentQuantityInCart + quantity;

    // Kiểm tra xem tổng số lượng có vượt quá tồn kho không
    if (totalQuantity > product.stockQuantity) {
      message.error(
        `Không đủ hàng! Sản phẩm "${product.productName}" chỉ còn ${product.stockQuantity} ${product.unit} trong kho (Bạn đã thêm ${currentQuantityInCart} ${product.unit})`
      );
      return;
    }

    if (existingItemIndex >= 0) {
      const newItems = [...orderItems];
      newItems[existingItemIndex].quantity += quantity;
      newItems[existingItemIndex].totalPrice =
        newItems[existingItemIndex].quantity * product.price;
      setOrderItems(newItems);
      message.success(`Đã cập nhật số lượng "${product.productName}"`);
    } else {
      setOrderItems([
        ...orderItems,
        {
          productId: product.productId,
          productName: product.productName,
          quantity,
          unitPrice: product.price,
          totalPrice: product.price * quantity,
        },
      ]);
      message.success(`Đã thêm "${product.productName}" vào đơn hàng`);
    }

    form.setFieldsValue({ productId: undefined, quantity: 1 });
  };

  const handleRemoveItem = (productId: number) => {
    setOrderItems(orderItems.filter((item) => item.productId !== productId));
  };

  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields(["customerId", "promotionCode"]);

      if (orderItems.length === 0) {
        message.warning("Vui lòng thêm ít nhất 1 sản phẩm!");
        return;
      }

      const orderData = {
        customerId: values.customerId,
        userId: userId,
        promoCode: values.promotionCode,
        items: orderItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      };

      const { orderService } = await import("@/services/order.service");
      await orderService.create(orderData);
      message.success("Tạo đơn hàng thành công!");
      
      // Reset form và đóng modal
      form.resetFields();
      setOrderItems([]);
      onSuccess();
      onClose();
    } catch (error) {
      message.error("Tạo đơn hàng thất bại!");
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setOrderItems([]);
    onClose();
  };

  const itemColumns = [
    {
      title: "Sản phẩm",
      dataIndex: "productName",
      key: "productName",
      width: "40%",
      ellipsis: true,
    },
    {
      title: "SL",
      dataIndex: "quantity",
      key: "quantity",
      width: 60,
      align: "center" as const,
    },
    {
      title: "Đơn giá",
      dataIndex: "unitPrice",
      key: "unitPrice",
      width: "22%",
      align: "right" as const,
      render: (price: number) => `${price.toLocaleString("vi-VN")}đ`,
    },
    {
      title: "Thành tiền",
      dataIndex: "totalPrice",
      key: "totalPrice",
      width: "22%",
      align: "right" as const,
      render: (price: number) => `${price.toLocaleString("vi-VN")}đ`,
    },
    {
      title: "",
      key: "action",
      width: 70,
      align: "center" as const,
      render: (_: any, record: OrderItem) => (
        <Button
          type="link"
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveItem(record.productId)}
        />
      ),
    },
  ];

  return (
    <Modal
      title="Tạo đơn hàng"
      open={visible}
      onOk={handleSubmit}
      onCancel={handleCancel}
      width={900}
      okText="Tạo đơn hàng"
      cancelText="Hủy"
      maskClosable={false}
      keyboard={false}
      destroyOnClose={true}
      centered
      styles={{
        body: { fontSize: '13px' }
      }}
    >
      <Form form={form} layout="vertical">
        <Row gutter={12}>
          <Col span={14}>
            <Form.Item
              name="customerId"
              label="Khách hàng"
              rules={[{ required: true, message: "Vui lòng chọn khách hàng!" }]}
            >
              <Select
                showSearch
                placeholder="Chọn khách hàng"
                filterOption={(input, option: any) =>
                  option.children.toLowerCase().includes(input.toLowerCase())
                }
                popupRender={(menu) => (
                  <>
                    {menu}
                    <Divider style={{ margin: "8px 0" }} />
                    <Button
                      type="text"
                      icon={<UserAddOutlined />}
                      style={{ width: "100%", textAlign: "left", fontSize: '14px' }}
                      onClick={onAddCustomer}
                    >
                      Thêm khách hàng mới
                    </Button>
                  </>
                )}
              >
                {customers.map((cust) => (
                  <Select.Option
                    key={cust.customerId}
                    value={cust.customerId}
                    label={`${cust.name} - ${cust.phone}`}
                  >
                    <span style={{ fontSize: '14px' }}>{cust.name} - {cust.phone}</span>
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={10}>
            <Form.Item name="promotionCode" label="Mã khuyến mãi">
              <Select allowClear placeholder="Chọn mã khuyến mãi (tùy chọn)">
                {promotions
                  .filter((promo) => promo.status === "active")
                  .map((promo) => (
                    <Select.Option
                      key={promo.promoId}
                      value={promo.promoCode}
                      label={`${promo.promoCode} - Giảm ${promo.discountValue}${
                        promo.discountType === "percent" ? "%" : "đ"
                      }`}
                    >
                      <span style={{ fontSize: '14px' }}>
                        {promo.promoCode} - Giảm {promo.discountValue}
                        {promo.discountType === "percent" ? "%" : "đ"}
                      </span>
                    </Select.Option>
                  ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Divider style={{ margin: '12px 0', fontSize: '13px' }}>Thêm sản phẩm</Divider>

        <Row gutter={12}>
          <Col span={14}>
            <Form.Item name="productId" label="Sản phẩm">
              <Select
                showSearch
                placeholder="Chọn sản phẩm"
                filterOption={(input, option: any) =>
                  option.children.toLowerCase().includes(input.toLowerCase())
                }
              >
                {products.map((prod) => (
                  <Select.Option
                    key={prod.productId}
                    value={prod.productId}
                    label={`${prod.productName} - ${prod.price.toLocaleString(
                      "vi-VN"
                    )}đ (Còn: ${prod.stockQuantity || 0})`}
                    disabled={!prod.stockQuantity || prod.stockQuantity === 0}
                  >
                    <span style={{ fontSize: '14px' }}>
                      {prod.productName} - {prod.price.toLocaleString("vi-VN")}đ
                      <span
                        style={{
                          color:
                            prod.stockQuantity && prod.stockQuantity > 0
                              ? "#52c41a"
                              : "#ff4d4f",
                          marginLeft: "8px",
                        }}
                      >
                        (Còn: {prod.stockQuantity || 0} {prod.unit})
                      </span>
                    </span>
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="quantity" label="Số lượng" initialValue={1}>
              <InputNumber min={1} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item label=" ">
              <Button onClick={handleAddItem} block type="primary">
                Thêm
              </Button>
            </Form.Item>
          </Col>
        </Row>

        <Table
          dataSource={orderItems}
          columns={itemColumns}
          rowKey="productId"
          pagination={false}
          size="small"
          locale={{ emptyText: "Chưa có sản phẩm nào" }}
          scroll={{ y: 250 }}
          style={{ fontSize: '13px' }}
          tableLayout="fixed"
        />

        <Card 
          size="small" 
          style={{ 
            marginTop: 12, 
            backgroundColor: "#f5f5f5",
            padding: '4px 0'
          }}
          bodyStyle={{ padding: '8px 16px' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
            <div>
              Tổng SL:{" "}
              <strong style={{ color: "#52c41a", fontSize: "14px" }}>
                {orderItems.reduce((sum, item) => sum + item.quantity, 0)}
              </strong>
            </div>
            <div>
              Tổng cộng:{" "}
              <strong style={{ color: "#1890ff", fontSize: "16px" }}>
                {calculateTotal().toLocaleString("vi-VN")}đ
              </strong>
            </div>
          </div>
        </Card>
      </Form>
    </Modal>
  );
};

export default CreateOrderModal;
