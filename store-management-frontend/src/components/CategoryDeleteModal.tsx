import React, { useState, useEffect } from "react";
import {
  Modal,
  Table,
  Select,
  Button,
  Checkbox,
  message,
  Space,
  Alert,
} from "antd";
import type { ColumnType } from "antd/es/table";
import {
  Category,
  CategoryProduct,
  CategoryDeleteRequest,
} from "@/types";

interface CategoryDeleteModalProps {
  visible: boolean;
  category: Category | null;
  products: CategoryProduct[];
  allCategories: Category[];
  onConfirm: (request: CategoryDeleteRequest) => Promise<void>;
  onCancel: () => void;
}

const CategoryDeleteModal: React.FC<CategoryDeleteModalProps> = ({
  visible,
  category,
  products,
  allCategories,
  onConfirm,
  onCancel,
}) => {
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  // Map productId -> newCategoryId cho từng sản phẩm
  const [productCategoryMap, setProductCategoryMap] = useState<Record<number, number>>({});
  // Category chung khi chọn tất cả
  const [sharedCategoryId, setSharedCategoryId] = useState<number | undefined>(undefined);
  const [step, setStep] = useState<"reassign" | "confirm-hide">("reassign");
  const [loading, setLoading] = useState(false);

  // Reset state khi modal mở/đóng
  useEffect(() => {
    if (visible) {
      setSelectedProductIds([]);
      setProductCategoryMap({});
      setSharedCategoryId(undefined);
      setStep("reassign");
    }
  }, [visible]);

  // Lọc các category có thể chọn (không bao gồm category đang xóa và chỉ active)
  const availableCategories = allCategories.filter(
    (c) => c.categoryId !== category?.categoryId && c.status === "active"
  );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProductIds(products.map((p) => p.productId));
    } else {
      setSelectedProductIds([]);
      setSharedCategoryId(undefined);
    }
  };

  const handleSelectProduct = (productId: number, checked: boolean) => {
    if (checked) {
      setSelectedProductIds([...selectedProductIds, productId]);
    } else {
      setSelectedProductIds(selectedProductIds.filter((id) => id !== productId));
      // Xóa category của sản phẩm này
      const newMap = { ...productCategoryMap };
      delete newMap[productId];
      setProductCategoryMap(newMap);
    }
  };

  const handleProductCategoryChange = (productId: number, categoryId: number) => {
    setProductCategoryMap({
      ...productCategoryMap,
      [productId]: categoryId,
    });
  };

  // Khi thay đổi category chung, áp dụng cho tất cả sản phẩm đã chọn
  const handleSharedCategoryChange = (categoryId: number) => {
    setSharedCategoryId(categoryId);
    const newMap: Record<number, number> = {};
    selectedProductIds.forEach((productId) => {
      newMap[productId] = categoryId;
    });
    setProductCategoryMap(newMap);
  };

  const handleReassign = async () => {
    if (selectedProductIds.length === 0) {
      // Không có sản phẩm nào được chọn để đổi
      const remainingProducts = products.length;
      if (remainingProducts > 0) {
        // Chuyển sang bước xác nhận ẩn
        setStep("confirm-hide");
      } else {
        // Không có sản phẩm -> ẩn trực tiếp
        await handleConfirmDelete(false);
      }
      return;
    }

    // Kiểm tra tất cả sản phẩm đã chọn đều có category mới
    const unconfiguredProducts = selectedProductIds.filter(
      (id) => !productCategoryMap[id]
    );

    if (unconfiguredProducts.length > 0) {
      message.warning(
        `Vui lòng chọn danh mục mới cho ${unconfiguredProducts.length} sản phẩm`
      );
      return;
    }

    const remainingProducts = products.filter(
      (p) => !selectedProductIds.includes(p.productId)
    );

    if (remainingProducts.length > 0) {
      // Còn sản phẩm chưa đổi -> chuyển sang bước xác nhận ẩn
      setStep("confirm-hide");
    } else {
      // Đã đổi hết sản phẩm -> ẩn category
      await handleConfirmDelete(false);
    }
  };

  const handleConfirmDelete = async (hideProducts: boolean) => {
    setLoading(true);
    try {
      const request: CategoryDeleteRequest = {
        productCategoryMap:
          Object.keys(productCategoryMap).length > 0 ? productCategoryMap : undefined,
        hideProducts,
      };

      await onConfirm(request);
      setStep("reassign");
    } catch (error) {
      console.error("Error hiding category:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setStep("reassign");
    onCancel();
  };

  const isAllSelected = selectedProductIds.length === products.length && products.length > 0;

  const columns: ColumnType<CategoryProduct>[] = [
    {
      title: (
        <Checkbox
          checked={isAllSelected}
          indeterminate={
            selectedProductIds.length > 0 &&
            selectedProductIds.length < products.length
          }
          onChange={(e) => handleSelectAll(e.target.checked)}
        >
          Chọn
        </Checkbox>
      ),
      dataIndex: "select",
      width: 80,
      render: (_: any, record: CategoryProduct) => (
        <Checkbox
          checked={selectedProductIds.includes(record.productId)}
          onChange={(e) =>
            handleSelectProduct(record.productId, e.target.checked)
          }
        />
      ),
    },
    {
      title: "Mã SP",
      dataIndex: "productId",
      width: 80,
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "productName",
      ellipsis: true,
    },
    {
      title: "Danh mục mới",
      dataIndex: "newCategory",
      width: 200,
      render: (_: any, record: CategoryProduct) => {
        const isSelected = selectedProductIds.includes(record.productId);

        if (!isSelected) {
          return <span style={{ color: "#999" }}>Chưa chọn</span>;
        }

        return (
          <Select
            style={{ width: "100%" }}
            placeholder="Chọn danh mục"
            value={productCategoryMap[record.productId]}
            onChange={(value) => handleProductCategoryChange(record.productId, value)}
            options={availableCategories.map((c) => ({
              label: c.categoryName,
              value: c.categoryId,
            }))}
            size="small"
          />
        );
      },
    },
  ];

  const remainingProducts = products.filter(
    (p) => !selectedProductIds.includes(p.productId)
  );

  if (step === "reassign") {
    return (
      <Modal
        title={`Ẩn danh mục: ${category?.categoryName}`}
        open={visible}
        onCancel={handleCancel}
        width={800}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Hủy
          </Button>,
          <Button
            key="next"
            type="primary"
            onClick={handleReassign}
            loading={loading}
          >
            {selectedProductIds.length === 0 && products.length > 0
              ? "Tiếp tục"
              : selectedProductIds.length === products.length
              ? "Ẩn danh mục"
              : "Tiếp tục"}
          </Button>,
        ]}
      >
        <Space direction="vertical" style={{ width: "100%" }} size="large">
          <Alert
            message={`Danh mục này có ${products.length} sản phẩm đang hoạt động`}
            description="Chọn sản phẩm và chọn danh mục mới cho từng sản phẩm. Các sản phẩm không được chọn sẽ được hỏi có muốn ẩn không ở bước tiếp theo."
            type="warning"
            showIcon
          />

          {isAllSelected && (
            <div>
              <label style={{ fontWeight: 500, marginBottom: 8, display: "block" }}>
                Áp dụng danh mục chung cho tất cả sản phẩm đã chọn:
              </label>
              <Select
                style={{ width: "100%" }}
                placeholder="Chọn danh mục chung"
                value={sharedCategoryId}
                onChange={handleSharedCategoryChange}
                options={availableCategories.map((c) => ({
                  label: c.categoryName,
                  value: c.categoryId,
                }))}
                allowClear
              />
            </div>
          )}

          <div>
            <div
              style={{
                marginBottom: 8,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span style={{ fontWeight: 500 }}>Danh sách sản phẩm:</span>
              <span style={{ color: "#666" }}>
                Đã chọn: {selectedProductIds.length}/{products.length}
                {selectedProductIds.length > 0 && (
                  <> | Đã cấu hình: {Object.keys(productCategoryMap).length}/{selectedProductIds.length}</>
                )}
              </span>
            </div>
            <Table
              columns={columns}
              dataSource={products}
              rowKey="productId"
              pagination={false}
              scroll={{ y: 300 }}
              size="small"
            />
          </div>
        </Space>
      </Modal>
    );
  }

  // Step 2: Confirm hide products
  return (
    <Modal
      title="Xác nhận ẩn sản phẩm"
      open={visible}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Hủy
        </Button>,
        <Button
          key="no-hide"
          onClick={() => handleConfirmDelete(false)}
          loading={loading}
        >
          Không ẩn
        </Button>,
        <Button
          key="hide"
          type="primary"
          danger
          onClick={() => handleConfirmDelete(true)}
          loading={loading}
        >
          Ẩn sản phẩm và ẩn danh mục
        </Button>,
      ]}
    >
      <Space direction="vertical" style={{ width: "100%" }} size="large">
        <Alert
          message={`Còn ${remainingProducts.length} sản phẩm chưa được chuyển danh mục`}
          description="Bạn có muốn ẩn các sản phẩm này không?"
          type="warning"
          showIcon
        />

        <div>
          <div style={{ fontWeight: 500, marginBottom: 8 }}>
            Danh sách sản phẩm chưa xử lý:
          </div>
          <Table
            columns={[
              {
                title: "Mã SP",
                dataIndex: "productId",
                width: 80,
              },
              {
                title: "Tên sản phẩm",
                dataIndex: "productName",
                ellipsis: true,
              },
            ]}
            dataSource={remainingProducts}
            rowKey="productId"
            pagination={false}
            scroll={{ y: 200 }}
            size="small"
          />
        </div>

        <Alert
          message="Lưu ý"
          description={
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              <li>
                Nếu chọn <strong>"Ẩn sản phẩm và ẩn danh mục"</strong>: Các sản phẩm
                này sẽ bị ẩn và danh mục cũng sẽ bị ẩn
              </li>
              <li>
                Nếu chọn <strong>"Không ẩn"</strong>: Chỉ ẩn danh mục, các sản phẩm
                vẫn giữ nguyên trạng thái
              </li>
              <li>
                Tất cả đều có thể khôi phục lại sau
              </li>
            </ul>
          }
          type="info"
        />
      </Space>
    </Modal>
  );
};

export default CategoryDeleteModal;
