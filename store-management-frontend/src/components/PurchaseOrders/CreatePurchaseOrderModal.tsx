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
  Tooltip,
} from "antd";
import {
  DeleteOutlined,
  BarcodeOutlined,
  PlusOutlined,
  MinusOutlined,
} from "@ant-design/icons";
import BarcodeCameraButton from "../shared/BarcodeCameraButton";

interface Supplier {
  supplierId: number;
  name: string;
}

interface Product {
  productId: number;
  productName: string;
  barcode?: string;
  costPrice?: number;
  unit?: string;
  stockQuantity?: number;
}

interface PurchaseItem {
  productId: number;
  productName?: string;
  barcode?: string;
  quantity: number;
  costPrice: number;
  subtotal: number;
}

interface CreatePurchaseOrderModalProps {
  visible: boolean;
  suppliers: Supplier[];
  products: Product[];
  warehouseId: number;
  onClose: () => void;
  onSuccess: () => void;
}

const CreatePurchaseOrderModal: React.FC<CreatePurchaseOrderModalProps> = ({
  visible,
  suppliers,
  products,
  warehouseId,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([]);
  const [inputMode, setInputMode] = useState<"manual" | "barcode">("manual");
  const [barcodeInput, setBarcodeInput] = useState("");
  const barcodeInputRef = useRef<any>(null);
  const isProcessingRef = useRef(false);

  // Auto focus vào input barcode khi chuyển sang chế độ quét
  useEffect(() => {
    if (inputMode === "barcode" && visible && barcodeInputRef.current) {
      setTimeout(() => {
        barcodeInputRef.current?.focus();
      }, 100);
    }
  }, [inputMode, visible]);

  // Reset when modal closes
  useEffect(() => {
    if (!visible) {
      form.resetFields();
      setPurchaseItems([]);
      setBarcodeInput("");
      setInputMode("manual");
      isProcessingRef.current = false;
    }
  }, [visible, form]);

  // Handle barcode scan from camera
  const handleScanSuccess = async (barcode: string) => {
    try {
      const { productService } = await import("@/services/product.service");
      const product = await productService.getByBarcode(barcode);

      if (product) {
        addProductToPurchase(product, 1, product.costPrice || 0);
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        message.error(`Không tìm thấy sản phẩm với mã barcode: ${barcode}`);
      } else {
        message.error("Lỗi khi tìm sản phẩm!");
      }
    }
  };

  const handleProductChange = (productId: number) => {
    // Không tự động điền giá nhập vì mỗi lần nhập hàng giá có thể khác nhau
    // Người dùng tự nhập giá nhập cho từng lần
  };

  const handleAddItem = () => {
    const productId = form.getFieldValue("productId");
    const quantity = form.getFieldValue("quantity") || 1;
    const costPrice = form.getFieldValue("costPrice");

    if (!productId) {
      message.warning("Vui lòng chọn sản phẩm!");
      return;
    }

    if (!costPrice || costPrice <= 0) {
      message.warning("Vui lòng nhập giá nhập!");
      return;
    }

    const product = products.find((p) => p.productId === productId);
    if (!product) return;

    addProductToPurchase(product, quantity, costPrice);
    form.setFieldsValue({
      productId: undefined,
      quantity: 1,
      costPrice: undefined,
    });
  };

  const addProductToPurchase = (
    product: Product,
    quantity: number = 1,
    costPrice?: number
  ) => {
    const existingItemIndex = purchaseItems.findIndex(
      (item) => item.productId === product.productId
    );

    const price = costPrice || product.costPrice || 0;

    if (existingItemIndex >= 0) {
      const newItems = [...purchaseItems];
      newItems[existingItemIndex].quantity += quantity;
      newItems[existingItemIndex].subtotal =
        newItems[existingItemIndex].quantity *
        newItems[existingItemIndex].costPrice;
      setPurchaseItems(newItems);
      message.success(`Đã cập nhật số lượng "${product.productName}"`);
    } else {
      setPurchaseItems([
        ...purchaseItems,
        {
          productId: product.productId,
          productName: product.productName,
          barcode: product.barcode,
          quantity,
          costPrice: price,
          subtotal: price * quantity,
        },
      ]);
      message.success(`Đã thêm "${product.productName}" vào phiếu nhập`);
    }
  };

  const handleBarcodeInput = async (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    // Ngăn xử lý nếu đang xử lý request
    if (isProcessingRef.current) {
      return;
    }

    if (e.key === "Enter" && barcodeInput.trim()) {
      e.preventDefault();
      await handleBarcodeScan(barcodeInput.trim());
    }
  };

  const handleBarcodePaste = async (
    e: React.ClipboardEvent<HTMLInputElement>
  ) => {
    e.preventDefault();

    // Ngăn xử lý nếu đang xử lý request
    if (isProcessingRef.current) {
      return;
    }

    const pastedText = e.clipboardData.getData("text").trim();
    if (pastedText) {
      setBarcodeInput(pastedText);
      await handleBarcodeScan(pastedText);
    }
  };

  const handleBarcodeScan = async (barcode: string) => {
    // Đánh dấu đang xử lý
    if (isProcessingRef.current) {
      return;
    }

    isProcessingRef.current = true;

    try {
      const { productService } = await import("@/services/product.service");
      const product = await productService.getByBarcode(barcode);

      if (product) {
        addProductToPurchase(product, 1, product.costPrice || 0);
        setBarcodeInput("");

        // Focus lại vào input sau khi xử lý xong
        setTimeout(() => {
          barcodeInputRef.current?.focus();
        }, 100);
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        message.error(`Không tìm thấy sản phẩm với mã barcode: ${barcode}`);
      } else {
        message.error("Lỗi khi tìm sản phẩm!");
      }
      setBarcodeInput("");
    } finally {
      // Đợi một chút trước khi cho phép xử lý tiếp
      setTimeout(() => {
        isProcessingRef.current = false;
      }, 300);
    }
  };

  const handleRemoveItem = (productId: number) => {
    setPurchaseItems(
      purchaseItems.filter((item) => item.productId !== productId)
    );
  };

  const handleIncreaseQuantity = (productId: number) => {
    const itemIndex = purchaseItems.findIndex(
      (item) => item.productId === productId
    );
    if (itemIndex < 0) return;

    const newItems = [...purchaseItems];
    newItems[itemIndex].quantity += 1;
    newItems[itemIndex].subtotal =
      newItems[itemIndex].quantity * newItems[itemIndex].costPrice;
    setPurchaseItems(newItems);
  };

  const handleDecreaseQuantity = (productId: number) => {
    const itemIndex = purchaseItems.findIndex(
      (item) => item.productId === productId
    );
    if (itemIndex < 0) return;

    const currentItem = purchaseItems[itemIndex];
    const newQuantity = currentItem.quantity - 1;

    if (newQuantity <= 0) {
      handleRemoveItem(productId);
      return;
    }

    const newItems = [...purchaseItems];
    newItems[itemIndex].quantity = newQuantity;
    newItems[itemIndex].subtotal = newQuantity * currentItem.costPrice;
    setPurchaseItems(newItems);
  };

  const calculateTotal = () => {
    return purchaseItems.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields(["supplierId"]);

      if (purchaseItems.length === 0) {
        message.warning("Vui lòng thêm ít nhất 1 sản phẩm!");
        return;
      }

      const purchaseData = {
        supplierId: values.supplierId,
        warehouseId: warehouseId,
        items: purchaseItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          costPrice: item.costPrice,
        })),
      };

      const { default: api } = await import("@/services/api");
      await api.post("/purchaseorders", purchaseData);
      message.success("Tạo phiếu nhập hàng thành công!");

      form.resetFields();
      setPurchaseItems([]);
      setBarcodeInput("");
      setInputMode("manual");
      onSuccess();
      onClose();
    } catch (error) {
      message.error("Tạo phiếu nhập hàng thất bại!");
    }
  };

  const columns = [
    {
      title: "Sản phẩm",
      dataIndex: "productName",
      key: "productName",
      render: (text: string, record: PurchaseItem) => (
        <div>
          <div>{text}</div>
          {record.barcode && (
            <div style={{ fontSize: "12px", color: "#888" }}>
              <BarcodeOutlined /> {record.barcode}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      width: 180,
      render: (quantity: number, record: PurchaseItem) => (
        <Space>
          <Button
            size="small"
            icon={<MinusOutlined />}
            onClick={() => handleDecreaseQuantity(record.productId)}
          />
          <span style={{ margin: "0 8px", fontWeight: "bold" }}>
            {quantity}
          </span>
          <Button
            size="small"
            icon={<PlusOutlined />}
            onClick={() => handleIncreaseQuantity(record.productId)}
          />
        </Space>
      ),
    },
    {
      title: "Giá nhập",
      dataIndex: "costPrice",
      key: "costPrice",
      render: (price: number) => `${price.toLocaleString()} đ`,
    },
    {
      title: "Thành tiền",
      dataIndex: "subtotal",
      key: "subtotal",
      render: (subtotal: number) => `${subtotal.toLocaleString()} đ`,
    },
    {
      title: "",
      key: "action",
      width: 60,
      render: (_: any, record: PurchaseItem) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveItem(record.productId)}
        />
      ),
    },
  ];

  return (
    <Modal
      title="Tạo Phiếu Nhập Hàng"
      open={visible}
      onCancel={onClose}
      width={1000}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Hủy
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
          Tạo Phiếu Nhập
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="supplierId"
              label="Nhà cung cấp"
              rules={[
                { required: true, message: "Vui lòng chọn nhà cung cấp!" },
              ]}
            >
              <Select
                placeholder="Chọn nhà cung cấp"
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={suppliers.map((s) => ({
                  value: s.supplierId,
                  label: s.name,
                }))}
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left">Thêm Sản Phẩm</Divider>

        <Card size="small" style={{ marginBottom: 16 }}>
          <Radio.Group
            value={inputMode}
            onChange={(e) => setInputMode(e.target.value)}
            style={{ marginBottom: 16 }}
          >
            <Radio.Button value="manual">Chọn thủ công</Radio.Button>
            <Radio.Button value="barcode">
              <BarcodeOutlined /> Quét mã vạch
            </Radio.Button>
          </Radio.Group>

          {inputMode === "manual" ? (
            <Row gutter={8}>
              <Col span={12}>
                <Form.Item name="productId" noStyle>
                  <Select
                    placeholder="Chọn sản phẩm (tìm theo tên hoặc mã vạch)"
                    showSearch
                    onChange={handleProductChange}
                    dropdownStyle={{ minWidth: 500 }}
                    style={{ width: "100%" }}
                    filterOption={(input, option) => {
                      const searchText = input.toLowerCase();
                      const product = products.find(
                        (p) => p.productId === option?.value
                      );
                      if (!product) return false;

                      return (
                        product.productName.toLowerCase().includes(searchText) ||
                        (product.barcode &&
                          product.barcode.toLowerCase().includes(searchText))
                      );
                    }}
                    optionLabelProp="label"
                  >
                    {products.map((p) => (
                      <Select.Option
                        key={p.productId}
                        value={p.productId}
                        label={p.productName}
                      >
                        <Tooltip
                          title={p.productName}
                          placement="topLeft"
                          mouseEnterDelay={0.5}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div
                                style={{
                                  fontWeight: 500,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {p.productName}
                              </div>
                              {p.barcode && (
                                <div style={{ color: "#888", fontSize: "12px" }}>
                                  <BarcodeOutlined /> {p.barcode}
                                </div>
                              )}
                            </div>
                            <span
                              style={{
                                color:
                                  (p.stockQuantity || 0) < 10 ? "#ff4d4f" : "#52c41a",
                                fontWeight: "bold",
                                fontSize: "12px",
                                whiteSpace: "nowrap",
                              }}
                            >
                              Tồn: {p.stockQuantity || 0}
                            </span>
                          </div>
                        </Tooltip>
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item name="quantity" noStyle initialValue={1}>
                  <InputNumber
                    placeholder="Số lượng"
                    min={1}
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              </Col>
              <Col span={5}>
                <Form.Item name="costPrice" noStyle>
                  <InputNumber
                    placeholder="Giá nhập"
                    min={0}
                    style={{ width: "100%" }}
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    parser={(value) =>
                      value ? parseFloat(value.replace(/,/g, "")) : 0
                    }
                  />
                </Form.Item>
              </Col>
              <Col span={3}>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddItem}
                  block
                >
                  Thêm
                </Button>
              </Col>
            </Row>
          ) : (
            <Space.Compact style={{ width: "100%" }}>
              <Input
                ref={barcodeInputRef}
                placeholder="Quét hoặc nhập mã vạch sản phẩm..."
                prefix={<BarcodeOutlined />}
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                onKeyDown={handleBarcodeInput}
                onPaste={handleBarcodePaste}
                autoFocus
                size="large"
              />
              <BarcodeCameraButton
                onScan={handleScanSuccess}
                buttonText="Camera"
                buttonSize="large"
                buttonType="primary"
              />
            </Space.Compact>
          )}
        </Card>

        <Card
          title={`Danh sách sản phẩm (${purchaseItems.length})`}
          size="small"
        >
          <Table
            columns={columns}
            dataSource={purchaseItems}
            rowKey="productId"
            pagination={false}
            scroll={{ y: 300 }}
            summary={() => (
              <Table.Summary fixed>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={3}>
                    <strong>Tổng cộng:</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1}>
                    <strong style={{ fontSize: "16px", color: "#1890ff" }}>
                      {calculateTotal().toLocaleString()} đ
                    </strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2} />
                </Table.Summary.Row>
              </Table.Summary>
            )}
          />
        </Card>
      </Form>
    </Modal>
  );
};

export default CreatePurchaseOrderModal;
