import React, { useState, useRef, useEffect } from "react";
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
  Input,
  Radio,
  Space,
} from "antd";
import {
  DeleteOutlined,
  UserAddOutlined,
  BarcodeOutlined,
  EditOutlined,
  PlusOutlined,
  MinusOutlined,
  EyeOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { Customer, Product, Promotion } from "@/types";
import BarcodeCameraButton from "../shared/BarcodeCameraButton";

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

const CreateOrderModal = ({
  visible,
  customers,
  products,
  promotions,
  userId,
  onClose,
  onSuccess,
  onAddCustomer,
}: CreateOrderModalProps): JSX.Element => {
  const [form] = Form.useForm();
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [inputMode, setInputMode] = useState<"manual" | "barcode">("manual");
  const [barcodeInput, setBarcodeInput] = useState("");
  const [selectedPromotionType, setSelectedPromotionType] =
    useState<string>("");
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(
    null
  );
  const [promotionDetailVisible, setPromotionDetailVisible] = useState(false);
  const barcodeInputRef = useRef<any>(null);

  // Auto focus vào input barcode khi chuyển sang chế độ quét
  useEffect(() => {
    if (inputMode === "barcode" && visible && barcodeInputRef.current) {
      setTimeout(() => {
        barcodeInputRef.current?.focus();
      }, 100);
    }
  }, [inputMode, visible]);

  const handleAddItem = () => {
    const productId = form.getFieldValue("productId");
    const quantity = form.getFieldValue("quantity") || 1;

    if (!productId) {
      message.warning("Vui lòng chọn sản phẩm!");
      return;
    }

    const product = products.find((p) => p.productId === productId);
    if (!product) return;

    addProductToOrder(product, quantity);
    form.setFieldsValue({ productId: undefined, quantity: 1 });
  };

  const addProductToOrder = (product: Product, quantity: number = 1) => {
    // Kiểm tra tồn kho
    if (!product.stockQuantity || product.stockQuantity === 0) {
      message.error(`Sản phẩm "${product.productName}" đã hết hàng!`);
      return;
    }

    const existingItemIndex = orderItems.findIndex(
      (item) => item.productId === product.productId
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
  };

  const handleBarcodeInput = async (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter" && barcodeInput.trim()) {
      await handleBarcodeScan(barcodeInput.trim());
    }
  };

  const handleBarcodeScan = async (barcode: string) => {
    try {
      const { productService } = await import("@/services/product.service");
      const product = await productService.getByBarcode(barcode);

      if (product) {
        addProductToOrder(product, 1);
        setBarcodeInput("");
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        message.error(`Không tìm thấy sản phẩm với mã barcode: ${barcode}`);
      } else {
        message.error("Lỗi khi tìm sản phẩm!");
      }
    }
  };

  const handleRemoveItem = (productId: number) => {
    setOrderItems(orderItems.filter((item) => item.productId !== productId));
  };

  const handleIncreaseQuantity = (productId: number) => {
    const product = products.find((p) => p.productId === productId);
    if (!product) return;

    const itemIndex = orderItems.findIndex(
      (item) => item.productId === productId
    );
    if (itemIndex < 0) return;

    const currentItem = orderItems[itemIndex];
    const newQuantity = currentItem.quantity + 1;

    // Kiểm tra tồn kho
    if (!product.stockQuantity || newQuantity > product.stockQuantity) {
      message.error(
        `Không đủ hàng! Sản phẩm "${product.productName}" chỉ còn ${
          product.stockQuantity || 0
        } ${product.unit} trong kho`
      );
      return;
    }

    const newItems = [...orderItems];
    newItems[itemIndex].quantity = newQuantity;
    newItems[itemIndex].totalPrice = newQuantity * currentItem.unitPrice;
    setOrderItems(newItems);
  };

  const handleDecreaseQuantity = (productId: number) => {
    const itemIndex = orderItems.findIndex(
      (item) => item.productId === productId
    );
    if (itemIndex < 0) return;

    const currentItem = orderItems[itemIndex];
    const newQuantity = currentItem.quantity - 1;

    if (newQuantity <= 0) {
      // Nếu giảm xuống 0 thì xóa sản phẩm
      handleRemoveItem(productId);
      return;
    }

    const newItems = [...orderItems];
    newItems[itemIndex].quantity = newQuantity;
    newItems[itemIndex].totalPrice = newQuantity * currentItem.unitPrice;
    setOrderItems(newItems);
  };

  const calculateTotal = () => {
    const subtotal = orderItems.reduce((sum, item) => sum + item.totalPrice, 0);

    if (selectedPromotion) {
      const { discount } = calculatePromotionDiscount(selectedPromotion);
      return Math.max(0, subtotal - discount);
    }

    return subtotal;
  };

  const calculateSubtotal = () => {
    return orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  const calculateDiscount = () => {
    if (selectedPromotion) {
      const { discount } = calculatePromotionDiscount(selectedPromotion);
      return discount;
    }
    return 0;
  };

  const calculatePromotionDiscount = (promotion: Promotion) => {
    const subtotal = calculateSubtotal();
    let discount = 0;
    const isEligible = subtotal >= promotion.minOrderAmount;
    const requiredAmount = promotion.minOrderAmount - subtotal;

    if (isEligible) {
      if (promotion.applyType === "order") {
        // Áp dụng cho toàn bộ đơn hàng
        if (promotion.discountType === "percent") {
          discount = subtotal * (promotion.discountValue / 100);
        } else {
          discount = promotion.discountValue;
        }
      } else if (promotion.applyType === "product") {
        // Áp dụng cho sản phẩm cụ thể
        if (promotion.products && promotion.products.length > 0) {
          const applicableProductIds = promotion.products.map(
            (p) => p.productId
          );

          orderItems.forEach((item) => {
            if (applicableProductIds.includes(item.productId)) {
              if (promotion.discountType === "percent") {
                discount += item.totalPrice * (promotion.discountValue / 100);
              } else {
                discount += Math.min(promotion.discountValue, item.totalPrice);
              }
            }
          });
        }
      } else if (promotion.applyType === "combo") {
        // Áp dụng giảm giá cho combo sản phẩm
        if (promotion.products && promotion.products.length > 0) {
          const applicableProductIds = promotion.products.map(
            (p) => p.productId
          );

          // Tính tổng tiền của các sản phẩm áp dụng
          let applicableSubtotal = 0;
          orderItems.forEach((item) => {
            if (applicableProductIds.includes(item.productId)) {
              applicableSubtotal += item.totalPrice;
            }
          });

          // Áp dụng giảm giá cho tổng tiền áp dụng
          if (promotion.discountType === "percent") {
            discount = applicableSubtotal * (promotion.discountValue / 100);
          } else {
            discount = promotion.discountValue;
          }

          // Giới hạn giảm giá không vượt quá tổng tiền áp dụng
          discount = Math.min(discount, applicableSubtotal);
        }
      }
    }

    return {
      discount,
      isEligible,
      requiredAmount: Math.max(0, requiredAmount),
    };
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
        promoCode:
          values.promotionCode === "none" ? null : values.promotionCode,
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
      setBarcodeInput("");
      setInputMode("manual");
      setSelectedPromotionType("");
      setSelectedPromotion(null);
      onSuccess();
      onClose();
    } catch (error) {
      message.error("Tạo đơn hàng thất bại!");
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setOrderItems([]);
    setBarcodeInput("");
    setInputMode("manual");
    setSelectedPromotionType("");
    setSelectedPromotion(null);
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
      width: 120,
      align: "center" as const,
      render: (quantity: number, record: OrderItem) => {
        // Tìm sản phẩm để lấy thông tin tồn kho
        const product = products.find((p) => p.productId === record.productId);
        const maxStock = product?.stockQuantity || 0;
        const isAtMin = quantity <= 1; // Số lượng = 1 (có nút xóa rồi)
        const isAtMax = quantity >= maxStock; // Đã đạt max tồn kho

        return (
          <Space size="small">
            {!isAtMin && (
              <Button
                type="text"
                size="small"
                icon={<MinusOutlined />}
                onClick={() => handleDecreaseQuantity(record.productId)}
                style={{ fontSize: 12 }}
              />
            )}
            <span
              style={{
                fontWeight: 600,
                minWidth: 20,
                display: "inline-block",
                textAlign: "center",
                marginLeft: isAtMin ? 24 : 0, // Căn giữa khi không có nút -
                marginRight: isAtMax ? 24 : 0, // Căn giữa khi không có nút +
              }}
            >
              {quantity}
            </span>
            {!isAtMax && (
              <Button
                type="text"
                size="small"
                icon={<PlusOutlined />}
                onClick={() => handleIncreaseQuantity(record.productId)}
                style={{ fontSize: 12 }}
              />
            )}
          </Space>
        );
      },
    },
    {
      title: "Đơn giá",
      dataIndex: "unitPrice",
      key: "unitPrice",
      width: "22%",
      align: "right" as const,
      render: (price: number) => `${(price || 0).toLocaleString("vi-VN")}đ`,
    },
    {
      title: "Thành tiền",
      dataIndex: "totalPrice",
      key: "totalPrice",
      width: "22%",
      align: "right" as const,
      render: (price: number) => `${(price || 0).toLocaleString("vi-VN")}đ`,
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
        body: { fontSize: "13px" },
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
                      style={{
                        width: "100%",
                        textAlign: "left",
                        fontSize: "14px",
                      }}
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
                    <span style={{ fontSize: "14px" }}>
                      {cust.name} - {cust.phone}
                    </span>
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Divider style={{ margin: "12px 0", fontSize: "13px" }}>
          Thêm sản phẩm
        </Divider>
        <Row gutter={12} style={{ marginBottom: 12 }}>
          <Col span={24}>
            <Space>
              <span style={{ fontSize: "13px" }}>Chế độ nhập:</span>
              <Radio.Group
                value={inputMode}
                onChange={(e) => setInputMode(e.target.value)}
                size="small"
              >
                <Radio.Button value="manual">
                  <EditOutlined /> Nhập tay
                </Radio.Button>
                <Radio.Button value="barcode">
                  <BarcodeOutlined /> Quét Barcode
                </Radio.Button>
              </Radio.Group>
            </Space>
          </Col>
        </Row>
        {inputMode === "manual" ? (
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
                      label={`${prod.productName} - ${(
                        prod.price || 0
                      ).toLocaleString("vi-VN")}đ (Còn: ${
                        prod.stockQuantity || 0
                      })`}
                      disabled={!prod.stockQuantity || prod.stockQuantity === 0}
                    >
                      <span style={{ fontSize: "14px" }}>
                        {prod.productName} -{" "}
                        {(prod.price || 0).toLocaleString("vi-VN")}đ
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
        ) : (
          <Row gutter={12}>
            <Col span={20}>
              <Form.Item label="Quét mã Barcode">
                <Input
                  ref={barcodeInputRef}
                  placeholder="Quét hoặc nhập mã barcode rồi nhấn Enter..."
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  onKeyPress={handleBarcodeInput}
                  prefix={<BarcodeOutlined />}
                  size="large"
                  autoFocus
                />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item label=" ">
                <BarcodeCameraButton
                  onScan={handleBarcodeScan}
                  buttonText="Camera"
                  buttonSize="large"
                  block
                />
              </Form.Item>
            </Col>
          </Row>
        )}
        <Table
          dataSource={orderItems}
          columns={itemColumns}
          rowKey="productId"
          pagination={false}
          size="small"
          locale={{ emptyText: "Chưa có sản phẩm nào" }}
          scroll={{ y: 250 }}
          style={{ fontSize: "13px" }}
          tableLayout="fixed"
        />
        <Card
          size="small"
          style={{
            marginTop: 12,
            backgroundColor: "#f5f5f5",
            padding: "4px 0",
          }}
          bodyStyle={{ padding: "8px 16px" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "13px",
            }}
          >
            <div>
              <div>
                Tổng SL:{" "}
                <strong style={{ color: "#52c41a", fontSize: "14px" }}>
                  {orderItems.reduce((sum, item) => sum + item.quantity, 0)}
                </strong>
              </div>
              {selectedPromotion && (
                <div style={{ marginTop: "4px", fontSize: "12px" }}>
                  Mã KM:{" "}
                  <span style={{ color: "#1890ff", fontWeight: "bold" }}>
                    {selectedPromotion.promoCode}
                  </span>
                </div>
              )}
            </div>
            <div style={{ textAlign: "right" }}>
              <div>
                Tạm tính:{" "}
                <span style={{ color: "#666", fontSize: "14px" }}>
                  {calculateSubtotal().toLocaleString("vi-VN")}đ
                </span>
              </div>
              {calculateDiscount() > 0 && (
                <div>
                  Giảm giá:{" "}
                  <span style={{ color: "#ff4d4f", fontSize: "14px" }}>
                    -{calculateDiscount().toLocaleString("vi-VN")}đ
                  </span>
                </div>
              )}
              <div
                style={{
                  marginTop: "4px",
                  borderTop: "1px solid #d9d9d9",
                  paddingTop: "4px",
                }}
              >
                <strong style={{ color: "#1890ff", fontSize: "16px" }}>
                  Tổng cộng: {calculateTotal().toLocaleString("vi-VN")}đ
                </strong>
              </div>
            </div>
          </div>
        </Card>
        <Divider style={{ margin: "12px 0", fontSize: "13px" }}>
          Khuyến mãi
        </Divider>
        <Row gutter={12} style={{ marginBottom: 12 }}>
          <Col span={8}>
            <Form.Item name="promotionType" label="Loại KM">
              <Select
                allowClear
                placeholder="Loại"
                style={{ width: "100%" }}
                onChange={(value) => {
                  setSelectedPromotionType(value || "");
                  // Reset promotion code when type changes
                  form.setFieldsValue({ promotionCode: undefined });
                }}
              >
                <Select.Option value="order">Theo bill</Select.Option>
                <Select.Option value="product">Theo SP</Select.Option>
                <Select.Option value="combo">Combo</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={16}>
            <Form.Item name="promotionCode" label="Mã khuyến mãi">
              <Space.Compact style={{ width: "100%" }}>
                <Select
                  allowClear
                  placeholder={
                    selectedPromotionType
                      ? "Chọn mã khuyến mãi"
                      : "Chọn loại KM trước"
                  }
                  disabled={!selectedPromotionType}
                  onChange={(value) => {
                    if (value === "none") {
                      setSelectedPromotion(null);
                      form.setFieldsValue({ promotionCode: "none" });
                    } else if (value) {
                      const promo = promotions.find(
                        (p) => p.promoCode === value
                      );
                      setSelectedPromotion(promo || null);
                      form.setFieldsValue({ promotionCode: value });
                    } else {
                      setSelectedPromotion(null);
                      form.setFieldsValue({ promotionCode: undefined });
                    }
                  }}
                  style={{ flex: 1 }}
                >
                  <Select.Option value="none">
                    <div style={{ fontStyle: "italic", color: "#666" }}>
                      Không áp dụng mã
                    </div>
                  </Select.Option>
                  {promotions
                    .filter(
                      (promo) =>
                        promo.status === "active" &&
                        (!selectedPromotionType ||
                          promo.applyType === selectedPromotionType)
                    )
                    .map((promo) => {
                      const { discount, isEligible, requiredAmount } =
                        calculatePromotionDiscount(promo);
                      return (
                        <Select.Option
                          key={promo.promoId}
                          value={promo.promoCode}
                          label={`${promo.promoCode} - ${
                            isEligible
                              ? `Giảm ${discount.toLocaleString("vi-VN")}đ`
                              : `Cần thêm ${requiredAmount.toLocaleString(
                                  "vi-VN"
                                )}đ`
                          }`}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              padding: "4px 0",
                            }}
                          >
                            <span
                              style={{
                                fontSize: "14px",
                                fontWeight: "bold",
                                color: isEligible ? "#000" : "#999",
                              }}
                            >
                              {promo.promoCode}
                            </span>
                            <span
                              style={{
                                fontSize: "13px",
                                color: isEligible ? "#52c41a" : "#ff4d4f",
                                fontWeight: "bold",
                              }}
                            >
                              {isEligible
                                ? `Giảm ${discount.toLocaleString("vi-VN")}đ`
                                : `Cần thêm ${requiredAmount.toLocaleString(
                                    "vi-VN"
                                  )}đ`}
                            </span>
                          </div>
                          <div
                            style={{
                              fontSize: "12px",
                              color: "#666",
                              marginTop: "2px",
                              lineHeight: "1.4",
                            }}
                          >
                            <span style={{ color: "#1890ff" }}>
                              {promo.discountValue}
                              {promo.discountType === "percent" ? "%" : "đ"}
                            </span>
                            <span style={{ marginLeft: "8px" }}>
                              {promo.applyType === "order"
                                ? "cho bill"
                                : promo.applyType === "product"
                                ? "cho sản phẩm"
                                : "combo"}
                            </span>
                            {!isEligible && (
                              <div
                                style={{
                                  color: "#ff4d4f",
                                  fontSize: "11px",
                                  marginTop: "2px",
                                }}
                              >
                                Đơn tối thiểu:{" "}
                                {promo.minOrderAmount.toLocaleString("vi-VN")}đ
                              </div>
                            )}
                          </div>
                        </Select.Option>
                      );
                    })}
                </Select>
                <Button
                  icon={<EyeOutlined />}
                  disabled={
                    !selectedPromotion ||
                    form.getFieldValue("promotionCode") === "none"
                  }
                  onClick={() => setPromotionDetailVisible(true)}
                  style={{
                    borderLeft: 0,
                    borderColor:
                      selectedPromotion &&
                      form.getFieldValue("promotionCode") !== "none"
                        ? "#d9d9d9"
                        : "#f0f0f0",
                    backgroundColor:
                      selectedPromotion &&
                      form.getFieldValue("promotionCode") !== "none"
                        ? "#fff"
                        : "#f5f5f5",
                  }}
                >
                  Chi tiết
                </Button>
                {selectedPromotion &&
                  form.getFieldValue("promotionCode") !== "none" && (
                    <Button
                      danger
                      icon={<CloseOutlined />}
                      onClick={() => {
                        form.setFieldsValue({ promotionCode: "none" });
                        setSelectedPromotion(null);
                      }}
                      style={{ borderLeft: 0 }}
                    >
                      Bỏ áp dụng
                    </Button>
                  )}
              </Space.Compact>
            </Form.Item>
          </Col>
        </Row>
      </Form>

      {/* Promotion Detail Modal */}
      <Modal
        title="Chi tiết khuyến mãi"
        open={promotionDetailVisible}
        onCancel={() => setPromotionDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setPromotionDetailVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={600}
      >
        {selectedPromotion && (
          <div>
            <Row gutter={16}>
              <Col span={12}>
                <strong>Mã khuyến mãi:</strong> {selectedPromotion.promoCode}
              </Col>
              <Col span={12}>
                <strong>Mô tả:</strong>{" "}
                {selectedPromotion.description || "Không có"}
              </Col>
            </Row>
            <Row gutter={16} style={{ marginTop: 8 }}>
              <Col span={12}>
                <strong>Loại:</strong>{" "}
                {selectedPromotion.applyType === "order"
                  ? "Theo bill"
                  : selectedPromotion.applyType === "product"
                  ? "Theo sản phẩm"
                  : "Combo"}
              </Col>
              <Col span={12}>
                <strong>Giảm giá:</strong> {selectedPromotion.discountValue}
                {selectedPromotion.discountType === "percent" ? "%" : "đ"}
              </Col>
            </Row>
            <Row gutter={16} style={{ marginTop: 8 }}>
              <Col span={12}>
                <strong>Ngày bắt đầu:</strong>{" "}
                {new Date(selectedPromotion.startDate).toLocaleDateString(
                  "vi-VN"
                )}
              </Col>
              <Col span={12}>
                <strong>Ngày kết thúc:</strong>{" "}
                {new Date(selectedPromotion.endDate).toLocaleDateString(
                  "vi-VN"
                )}
              </Col>
            </Row>
            <Row gutter={16} style={{ marginTop: 8 }}>
              <Col span={12}>
                <strong>Đơn hàng tối thiểu:</strong>{" "}
                {selectedPromotion.minOrderAmount.toLocaleString("vi-VN")}đ
              </Col>
              <Col span={12}>
                <strong>Lượt sử dụng còn lại:</strong>{" "}
                {selectedPromotion.usageLimit === 0
                  ? "Không giới hạn"
                  : `${
                      selectedPromotion.usageLimit - selectedPromotion.usedCount
                    }/${selectedPromotion.usageLimit}`}
              </Col>
            </Row>
            {selectedPromotion.products &&
              selectedPromotion.products.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <Divider style={{ margin: "8px 0", fontSize: "14px" }}>
                    Sản phẩm áp dụng
                  </Divider>
                  <div>
                    {selectedPromotion.products.map((product, index) => (
                      <Row
                        key={index}
                        gutter={16}
                        style={{
                          padding: "8px 0",
                          borderBottom:
                            index < selectedPromotion.products!.length - 1
                              ? "1px solid #f0f0f0"
                              : "none",
                        }}
                      >
                        <Col span={16}>
                          <strong>{product.productName}</strong>
                        </Col>
                        <Col span={8} style={{ textAlign: "right" }}>
                          <span
                            style={{ color: "#52c41a", fontWeight: "bold" }}
                          >
                            Giảm {selectedPromotion.discountValue}
                            {selectedPromotion.discountType === "percent"
                              ? "%"
                              : "đ"}
                          </span>
                        </Col>
                      </Row>
                    ))}
                  </div>
                </div>
              )}
            {selectedPromotion.description && (
              <Row gutter={16} style={{ marginTop: 8 }}>
                <Col span={24}>
                  <strong>Mô tả:</strong> {selectedPromotion.description}
                </Col>
              </Row>
            )}
          </div>
        )}
      </Modal>
    </Modal>
  );
};

export default CreateOrderModal;
