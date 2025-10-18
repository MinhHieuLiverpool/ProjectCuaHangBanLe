import React, { useEffect, useState } from "react";
import {
    Table,
    Button,
    Space,
    Modal,
    Form,
    Input,
    message,
    Popconfirm,
    Tag,
    Select,
} from "antd";
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeInvisibleOutlined,
    SearchOutlined,
} from "@ant-design/icons";
import { Supplier } from "@/types";
import { supplierService } from "@/services/common.service";

const SuppliersPage: React.FC = () => {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
    const [searchValue, setSearchValue] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [form] = Form.useForm();
    const [canDeleteMap, setCanDeleteMap] = useState<Record<number, boolean>>({});

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            fetchData(searchValue, statusFilter);
        }, 500);
        return () => clearTimeout(delayDebounce);
    }, [searchValue, statusFilter]);

    const fetchData = async (searchTerm?: string, status?: string) => {
        setLoading(true);
        try {
            let data;
            if (searchTerm && searchTerm.trim() !== "") {
                data = await supplierService.search(searchTerm);
            } else {
                data = await supplierService.getAll();
            }

            // Lọc theo trạng thái nếu không chọn "all"
            if (status && status !== "all") {
                data = data.filter(
                    (item: Supplier) => item.status.toLowerCase() === status
                );
            }

            setSuppliers(data);

            // Kiểm tra khả năng xóa
            const canDeleteChecks: Record<number, boolean> = {};
            for (const supplier of data) {
                if (supplier.status === "active") {
                    try {
                        const checkResult = await supplierService.canDelete(
                            supplier.supplierId
                        );
                        canDeleteChecks[supplier.supplierId] = checkResult.canHardDelete;
                    } catch {
                        canDeleteChecks[supplier.supplierId] = false;
                    }
                }
            }
            setCanDeleteMap(canDeleteChecks);
        } catch {
            message.error("Không thể tải dữ liệu!");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingSupplier(null);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEdit = (supplier: Supplier) => {
        setEditingSupplier(supplier);
        form.setFieldsValue(supplier);
        setModalVisible(true);
    };

    const handleRestore = async (supplierId: number) => {
        try {
            await supplierService.restore(supplierId);
            message.success("Khôi phục nhà cung cấp thành công!");
            fetchData(searchValue, statusFilter);
        } catch (error: any) {
            message.error(error.response?.data?.message || "Khôi phục thất bại!");
        }
    };

    const handleHide = async (supplierId: number) => {
        try {
            const response = await supplierService.hide(supplierId);
            message.success(response.message || "Đã ẩn nhà cung cấp!");
            fetchData(searchValue, statusFilter);
        } catch (error: any) {
            message.error(error.response?.data?.message || "Ẩn thất bại!");
        }
    };

    const handleDelete = async (supplierId: number) => {
        try {
            const response = await supplierService.delete(supplierId);
            message.success(response.message || "Xóa thành công!");
            fetchData(searchValue, statusFilter);
        } catch (error: any) {
            message.error(error.response?.data?.message || "Xóa thất bại!");
        }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            if (editingSupplier) {
                await supplierService.update(editingSupplier.supplierId, values);
                message.success("Cập nhật thành công!");
            } else {
                await supplierService.create(values);
                message.success("Thêm mới thành công!");
            }
            setModalVisible(false);
            fetchData(searchValue, statusFilter);
        } catch {
            message.error("Lưu thất bại!");
        }
    };

    const columns = [
        { title: "Mã NCC", dataIndex: "supplierId", key: "supplierId", width: 80 },
        { title: "Tên nhà cung cấp", dataIndex: "name", key: "name" },
        { title: "Số điện thoại", dataIndex: "phone", key: "phone" },
        { title: "Email", dataIndex: "email", key: "email" },
        { title: "Địa chỉ", dataIndex: "address", key: "address" },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            width: 120,
            render: (status: string) => (
                <Tag color={status === "active" ? "green" : "red"}>
                    {status === "active" ? "Hoạt động" : "Đã ẩn"}
                </Tag>
            ),
        },
        {
            title: "Thao tác",
            key: "action",
            width: 200,
            render: (_: any, record: Supplier) => (
                <Space>
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    >
                        Sửa
                    </Button>
                    {record.status === "inactive" ? (
                        <Button
                            type="link"
                            style={{ color: "green" }}
                            onClick={() => handleRestore(record.supplierId)}
                        >
                            Khôi phục
                        </Button>
                    ) : canDeleteMap[record.supplierId] ? (
                        <Popconfirm
                            title="Xóa nhà cung cấp?"
                            description="Nhà cung cấp chưa có dữ liệu liên quan, sẽ bị xóa hoàn toàn."
                            onConfirm={() => handleDelete(record.supplierId)}
                            okType="danger"
                        >
                            <Button type="link" danger icon={<DeleteOutlined />}>
                                Xóa
                            </Button>
                        </Popconfirm>
                    ) : (
                        <Popconfirm
                            title="Ẩn nhà cung cấp?"
                            description="Nhà cung cấp có dữ liệu liên quan, chỉ có thể ẩn."
                            onConfirm={() => handleHide(record.supplierId)}
                            okType="danger"
                        >
                            <Button type="link" danger icon={<EyeInvisibleOutlined />}>
                                Ẩn
                            </Button>
                        </Popconfirm>
                    )}
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
                    alignItems: "center",
                }}
            >
                <h2>Quản lý nhà cung cấp</h2>
                <Space>
                    <Input
                        placeholder="Tìm kiếm nhà cung cấp..."
                        allowClear
                        prefix={<SearchOutlined />}
                        style={{ width: 300 }}
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                    />
                    <Select
                        value={statusFilter}
                        style={{ width: 150 }}
                        onChange={(value) => setStatusFilter(value)}
                        options={[
                            { value: "all", label: "Tất cả" },
                            { value: "active", label: "Hoạt động" },
                            { value: "inactive", label: "Đã ẩn" },
                        ]}
                    />
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                        Thêm nhà cung cấp
                    </Button>
                </Space>
            </div>

            <Table
                columns={columns}
                dataSource={suppliers}
                rowKey="supplierId"
                loading={loading}
                pagination={{
                    defaultPageSize: 10,
                    showSizeChanger: false,
                    showTotal: (total) => `Tổng ${total} mục`,
                }}
            />

            <Modal
                title={editingSupplier ? "Cập nhật nhà cung cấp" : "Thêm nhà cung cấp"}
                open={modalVisible}
                onOk={handleSubmit}
                onCancel={() => setModalVisible(false)}
                width={600}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="name"
                        label="Tên nhà cung cấp"
                        rules={[
                            { required: true, message: "Vui lòng nhập tên!" },
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
                                pattern: /^0\d{9}$/, message: "Số điện thoại gồm 10 chữ số và bắt đầu bằng số 0!" },
                            {
                                validator: async (_, value) => {
                                    if (!value) return Promise.resolve();
                                    const exists = await supplierService.checkPhoneExists(value);
                                    if (exists) {
                                        return Promise.reject(new Error("Số điện thoại đã được sử dụng!"));
                                    }
                                    return Promise.resolve();
                                }
                            }
                        ]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: "Vui lòng nhập email!" },
                            { type: "email", message: "Định dạng email không hợp lệ!" },
                            {
                                validator: async (_, value) => {
                                    if (!value) return Promise.resolve();
                                    const exists = await supplierService.checkEmailExists(value);
                                    if (exists) {
                                        return Promise.reject(new Error("Email đã được sử dụng!"));
                                    }
                                    return Promise.resolve();
                                }
                            }
                        ]}
                    >
                        <Input type="email" />
                    </Form.Item>

                    <Form.Item
                        name="address"
                        label="Địa chỉ"
                    >
                        <Input.TextArea rows={3} />
                    </Form.Item>
                </Form>
            </Modal>

        </div>
    );
};

export default SuppliersPage;
