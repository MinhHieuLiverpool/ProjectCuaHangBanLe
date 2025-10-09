import { PlusOutlined } from '@ant-design/icons';
import { Button, Card, Form, InputNumber, Select, Table, Tag, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useEffect, useState } from 'react';
import api from '../services/api';

interface Product {
  productId: number;
  productName: string;
  price: number;
  unit: string;
  status: string;
  categoryName?: string;
}

interface StockReceipt {
  inventoryId: number;
  productId: number;
  productName: string;
  quantity: number;
  updatedAt: string;
}

const StockReceiptsPage: React.FC = () => {
  const [form] = Form.useForm();
  const [receipts, setReceipts] = useState<StockReceipt[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // fetch sp
  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      // search sp active
      const activeProducts = response.data.filter((product: Product) => product.status === 'active');
      setProducts(activeProducts);
    } catch (error) {
      message.error('Không thể tải danh sách sản phẩm');
    }
  };

  //fecth ton kho
  const fetchStockReceipts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/inventory');
      setReceipts(response.data);
    } catch (error) {
      message.error('Không thể tải danh sách tồn kho');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchStockReceipts();
  }, []);

  // xly nhaphang
  const handleSubmit = async (values: { productId: number; quantity: number }) => {
    setSubmitting(true);
    try {
      await api.post('/inventory/add-stock', values);
      message.success('Nhập hàng thành công!');
      form.resetFields();
      fetchStockReceipts(); // refresh dsach
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Nhập hàng thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const columns: ColumnsType<StockReceipt> = [
    {
      title: 'Mã',
      dataIndex: 'inventoryId',
      key: 'inventoryId',
      width: 80,
      render: (id: number) => <Tag color="blue">#{id}</Tag>,
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'productName',
      key: 'productName',
      ellipsis: true,
    },
    {
      title: 'Số lượng tồn kho',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 150,
      align: 'right',
      render: (quantity: number) => (
        <span style={{ fontWeight: 600, color: quantity > 0 ? '#52c41a' : '#ff4d4f' }}>
          {quantity}
        </span>
      ),
    },
    {
      title: 'Cập nhật lần cuối',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 180,
      render: (date: string) => new Date(date).toLocaleString('vi-VN'),
    },
  ];

  return (
    <div >
      <h2 >Quản lý nhập hàng</h2>
      <Card title="Nhập hàng mới" style={{ marginBottom: '24px' }}>
        <Form
          form={form}
          layout="inline"
          onFinish={handleSubmit}
          style={{ gap: '16px', display: 'flex', flexWrap: 'wrap' }}
        >
          <Form.Item
            name="productId"
            label="Sản phẩm"
            rules={[{ required: true, message: 'Vui lòng chọn sản phẩm' }]}
            style={{ minWidth: '300px', flex: 1 }}
          >
            <Select
              showSearch
              placeholder="Chọn sản phẩm"
              optionFilterProp="label"
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={products.map((product) => ({
                label: `${product.productName} (${product.unit})`,
                value: product.productId,
              }))}
            />
          </Form.Item>

          <Form.Item
            name="quantity"
            label="Số lượng"
            rules={[
              { required: true, message: 'Vui lòng nhập số lượng' },
              { type: 'number', min: 1, message: 'Số lượng phải lớn hơn 0' },
            ]}
            style={{ minWidth: '200px' }}
          >
            <InputNumber
              placeholder="Nhập số lượng"
              style={{ width: '100%' }}
              min={1}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              icon={<PlusOutlined />}
              loading={submitting}
            >
              Nhập hàng
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Card title="Danh sách tồn kho">
        <Table
          columns={columns}
          dataSource={receipts}
          rowKey="inventoryId"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} sản phẩm`,
          }}
          scroll={{ x: 800 }}
        />
      </Card>
    </div>
  );
};

export default StockReceiptsPage;
