import React, { useEffect, useState } from "react";
import AdvancedSearchFilter from "@/components/AdvancedSearchFilter";
import {
  Button,
  Descriptions,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Space,
  Table,
  Tag,
} from "antd";
import {
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { Customer } from "@/types";
import { customerService } from "@/services/common.service";
import * as XLSX from "xlsx";

const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomer, setFilteredCustomer] = useState<Customer[]>([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
  const [isEdit, setIsEdit] = useState(false);
const [currentCustomer, setCurrentCustomer] = useState<{ phone?: string } | null>(null);


  const [form] = Form.useForm();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterCustomers();
  }, [customers, searchText]);

useEffect(() => {
  if (isEdit && editingCustomer) {
    setCurrentCustomer(editingCustomer); // sử dụng editingCustomer
    form.setFieldsValue(editingCustomer); // điền dữ liệu vào form
  }
}, [isEdit, editingCustomer]);
  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await customerService.getAll();
      setCustomers(data);
    } catch (error) {
      message.error("Không thể tải dữ liệu!");
    } finally {
      setLoading(false);
    }
  };

  const filterCustomers = () => {
    let filtered = [...customers];

    if (searchText.trim()) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name?.toLowerCase().includes(search) ||
          c.phone?.includes(search) ||
          c.email?.toLowerCase().includes(search) ||
          c.address?.toLowerCase().includes(search)
      );
    }

    setFilteredCustomer(filtered);
  };

  const handleCreate = () => {
    setIsEdit(false);
    setEditingCustomer(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (customer: Customer) => {
    setIsEdit(true);
    setEditingCustomer(customer);
    form.setFieldsValue(customer);
    setModalVisible(true);
  };

  const handleViewDetail = (customer: Customer) => {
    setViewingCustomer(customer);
    setDetailModalVisible(true);
  };
  const handleExportAllCustomers = () => {
    if (filteredCustomer.length === 0) {
      message.warning("Không có khách hàng để xuất!");
      return;
    }

    // Chuẩn bị dữ liệu xuất Excel
    const excelData = filteredCustomer.map((customer, index) => ({
      STT: index + 1,
      "Mã KH": customer.customerId,
      "Tên khách hàng": customer.name,
      "Số điện thoại": customer.phone || "",
      Email: customer.email || "",
      "Địa chỉ": customer.address || "",
      "Ngày tạo": customer.createdAt
        ? new Date(customer.createdAt).toLocaleDateString("vi-VN")
        : "",
    }));

    // Tạo worksheet
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Tự động điều chỉnh độ rộng cột
    ws["!cols"] = [
      { wch: 6 }, // STT
      { wch: 10 }, // Mã KH
      { wch: 25 }, // Tên KH
      { wch: 15 }, // SĐT
      { wch: 25 }, // Email
      { wch: 30 }, // Địa chỉ
      { wch: 15 }, // Ngày tạo
    ];

    // Tạo workbook và sheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Danh sách khách hàng");

    // Tên file xuất ra
    const fileName = `DanhSachKhachHang_${new Date()
      .toLocaleDateString("vi-VN")
      .replace(/\//g, "-")}_${new Date().getTime()}.xlsx`;

    // Ghi file Excel
    XLSX.writeFile(wb, fileName);

    message.success(`Đã xuất ${filteredCustomer.length} khách hàng ra Excel!`);
  };

  const handleResetFilters = () => {
    setSearchText("");
    setFilteredCustomer(customers);
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await customerService.delete(id);

      // Kiểm tra xem có phải soft delete không
      if (response.softDeleted) {
        message.warning(
          response.message || "Khách hàng đã được bán nên đã được ẩn thay vì xóa"
        );
      } else {
        message.success(response.message || "Xóa khách hàng thành công!");
      }

      fetchData();
    } catch (error: any) {
      message.error(error.response?.data?.message || "Xóa khách hàng thất bại!");
    }
  };

const handleToggleStatus = async (customerId: number, newStatus: "active" | "inactive") => {
  try {
    await customerService.updateStatus(customerId, newStatus);
    message.success(
      newStatus === "active"
        ? "Hiển thị khách hàng thành công!"
        : "Ẩn khách hàng thành công!"
    );

    // Cập nhật trực tiếp state
    setCustomers((prev) =>
      prev.map((c) =>
        c.customerId === customerId ? { ...c, status: newStatus } : c
      )
    );
  } catch (error: any) {
    console.error(error);
    message.error(error.response?.data?.message || "Cập nhật trạng thái thất bại!");
  }
};


  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingCustomer) {
        await customerService.update(editingCustomer.customerId, values);
        message.success("Cập nhật khách hàng thành công!");
      } else {
        await customerService.create(values);
        message.success("Thêm khách hàng thành công!");
      }
      setModalVisible(false);
      fetchData();
    } catch (error) {
      message.error("Lưu khách hàng thất bại!");
    }
  };

  const columns = [
    {
      title: "Mã KH",
      dataIndex: "customerId",
      key: "customerId",
      width: 80,
    },
    {
      title: "Tên khách hàng",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "Thao tác",
      key: "action",
      width: 150,
      render: (_: any, record: Customer) => (
        <Space
          size="small"
          style={{ display: "flex", justifyContent: "center" }}
        >
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            Xem
          </Button>
          <Button
            type="default"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          {record.status === "active" ? (
            <Button
              type="default"
              size="small"
              onClick={() => handleToggleStatus(record.customerId, "inactive")}
              style={{ color: "orange" }}
            >
              Ẩn
            </Button>
          ) : (
            <Button
              type="default"
              size="small"
              onClick={() => handleToggleStatus(record.customerId, "active")}
              style={{ color: "green" }}
            >
              Hiện
            </Button>
          )}
          <Popconfirm
            title={
              <div>
                <div>Bạn có chắc muốn xóa?</div>
                <div style={{ fontSize: "12px", color: "#666", marginTop: 4 }}>
                  * Khách hàng sẽ được ẩn thay vì xóa
                </div>
              </div>
            }
            onConfirm={() => handleDelete(record.customerId)}
          >
            <Button
              type="default"
              size="small"
              danger
              icon={<DeleteOutlined />}
            >
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
        <h2>Quản lý khách hàng</h2>
        <Space>
          <Button
            type="default"
            icon={<DownloadOutlined />}
            onClick={handleExportAllCustomers}
          >
            Xuất Excel
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            Thêm khách hàng
          </Button>
        </Space>
      </div>

      {/* Bộ lọc nâng cao cho Khách hàng */}
      <AdvancedSearchFilter
        searchText={searchText}
        onSearchChange={setSearchText}
        searchPlaceholder="Tìm kiếm theo tên, số điện thoại hoặc email..."
        onReset={handleResetFilters}
      ></AdvancedSearchFilter>

      <Table
        columns={columns}
        dataSource={filteredCustomer}
        rowKey="customerId"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingCustomer ? "Cập nhật khách hàng" : "Thêm khách hàng"}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Tên khách hàng"
            rules={[
              { required: true, message: "Vui lòng nhập tên!" },
              { min: 3, message: "Tên phải có ít nhất 3 ký tự!" },
              {
                pattern: /^[\p{L}\s]+$/u,
                message: "Tên chỉ được chứa chữ cái và khoảng trắng!",
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[
              { required: true, message: "Vui lòng nhập số điện thoại!" },
              {
                pattern: /^[0-9]{10,11}$/,
                message: "Số điện thoại phải gồm 10-11 chữ số!",
              },
              {
  validator: async (_, value) => {
    if (!value) return Promise.resolve();

    // bỏ qua nếu số điện thoại chưa đổi
    if (currentCustomer && value === currentCustomer.phone) {
      return Promise.resolve();
    }

    try {
      const exists = await customerService.checkPhoneExists(value); // trả về boolean
      if (exists) {
        return Promise.reject("Số điện thoại đã tồn tại!");
      }
      return Promise.resolve();
    } catch (err) {
      return Promise.reject("Không thể kiểm tra số điện thoại!");
    }
  }
},

            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Vui lòng nhập email!" },
              { type: "email", message: "Email không hợp lệ!" },
              {
                validator: async (_, value) => {
                  if (!value) return Promise.resolve();

                  try {
                    // Nếu đang sửa thì bỏ qua email cũ (cho phép giữ nguyên)
                    if (editingCustomer && value === editingCustomer.email) {
                      return Promise.resolve();
                    }

                    // Gọi API kiểm tra email tồn tại
                    const customers = await customerService.getAll();
                    const emailExists = customers.some(
                      (customer) => customer.email === value
                    );

                    if (emailExists) {
                      return Promise.reject(
                        "Email đã tồn tại, vui lòng nhập email khác!"
                      );
                    }
                    return Promise.resolve();
                  } catch (error) {
                    return Promise.reject(
                      "Không thể kiểm tra email, vui lòng thử lại!"
                    );
                  }
                },
              },
            ]}
          >
            <Input type="email" />
          </Form.Item>

          <Form.Item
            name="address"
            label="Địa chỉ"
            rules={[
              { required: true, message: "Vui lòng nhập địa chỉ!" },
              { min: 5, message: "Địa chỉ phải có ít nhất 5 ký tự!" },
            ]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
      {/* Modal Chi tiết khách hàng */}
      <Modal
        title={
          <div style={{ fontSize: "18px", fontWeight: 600 }}>
            Chi tiết khách hàng
          </div>
        }
        open={!!viewingCustomer}
        onCancel={() => setViewingCustomer(null)}
        footer={[
          <Button key="close" onClick={() => setViewingCustomer(null)}>
            Đóng
          </Button>,
        ]}
        width={700}
      >
        {viewingCustomer && (
          <div>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Mã khách hàng" span={1}>
                <strong>{viewingCustomer.customerId}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái" span={1}>
                <Tag
                  color={viewingCustomer.status === "active" ? "green" : "red"}
                >
                  {viewingCustomer.status === "active"
                    ? "Đang hoạt động"
                    : "Ngừng hoạt động"}
                </Tag>
              </Descriptions.Item>

              <Descriptions.Item label="Ngày tạo" span={1}>
                {new Date(viewingCustomer.createdAt).toLocaleDateString(
                  "vi-VN"
                )}
              </Descriptions.Item>

              <Descriptions.Item label="Tên khách hàng" span={2}>
                <strong style={{ fontSize: "15px" }}>
                  {viewingCustomer.name}
                </strong>
              </Descriptions.Item>

              <Descriptions.Item label="Số điện thoại" span={1}>
                {viewingCustomer.phone || <i>Chưa có</i>}
              </Descriptions.Item>

              <Descriptions.Item label="Email" span={1}>
                {viewingCustomer.email || <i>Chưa có</i>}
              </Descriptions.Item>

              <Descriptions.Item label="Địa chỉ" span={2}>
                {viewingCustomer.address || <i>Chưa có</i>}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CustomersPage;
