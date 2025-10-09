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
  Select,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, LockOutlined } from "@ant-design/icons";
import { userService } from "@/services/user.service";
import { User } from "@/types";


const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [changingPasswordId, setChangingPasswordId] = useState<number | null>(null);



  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (error: any) {
      message.error(error.response?.data?.message || "Có lỗi xảy ra khi tải danh sách tài khoản");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreate = () => {
    form.resetFields();
    setEditingId(null);
    setModalVisible(true);

  };

  const handleEdit = (record: User) => {
    form.setFieldsValue({
      username: record.username,
      fullName: record.fullName,
      role: record.role,
    });
    setEditingId(record.userId)
    setModalVisible(true);

  };
  const handleChangePassword = (record: User) => {
    passwordForm.resetFields();
    setChangingPasswordId(record.userId);
    setPasswordModalVisible(true);
  };


  const handleDelete = async (userId: number) => {
    try {
      await userService.deleteUser(userId);
      message.success("Xóa tài khoản thành công");
      fetchUsers();
    } catch (error: any) {
      message.error(error.response?.data?.message || "Có lỗi xảy ra khi xóa tài khoản");
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingId) {
        await userService.updateUser(editingId, values);
        message.success("Cập nhật tài khoản thành công");
      } else {
        await userService.createUser(values);
        message.success("Thêm tài khoản thành công");
      }
      setModalVisible(false);
      fetchUsers();
    } catch (error: any) {
      message.error(error.response?.data?.message || "Có lỗi xảy ra khi lưu tài khoản");
    }
  };
  const handlePasswordModalOk = async () => {
    try {
      const values = await passwordForm.validateFields();
      if (changingPasswordId == null) {
      message.error("Không xác định được người dùng cần đổi mật khẩu!");
      return;
    }
      await userService.updatePassword(changingPasswordId, values.newPassword);
      message.success('Đổi mật khẩu thành công');
      setPasswordModalVisible(false);
      passwordForm.resetFields();
    } catch (error) {
      message.error('Không thể đổi mật khẩu');
    }
  };



  const columns = [
    {
      title: "ID",
      dataIndex: "userId",
      key: "userId",
    },
    {
      title: "Tên đăng nhập",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "Tên đầy đủ",
      dataIndex: "fullName",
      key: "fullName",
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      render: (role: string) => (role === "admin" ? "Quản trị viên" : "Nhân viên"),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_: any, record: User) => (
        <Space>
          <Button
           type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Button
           type="link"
            icon={<LockOutlined />}
            onClick={() => handleChangePassword(record)}
          >
            Đổi MK
          </Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa?"
            onConfirm={() => handleDelete(record.userId)}
            okText="Có"
            cancelText="Không"
          >
            <Button  type="link" icon={<DeleteOutlined />} danger>
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
        <h2>Quản lý Tài khoản</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Thêm tài khoản
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={users}
        rowKey="userId"
        loading={loading}
      />

      <Modal
        title={editingId ? "Sửa tài khoản" : "Thêm tài khoản"}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="username"
            label="Tên đăng nhập"
            rules={[{ required: true, message: "Vui lòng nhập tên đăng nhập" }]}
          >
            <Input disabled={!!editingId} />
          </Form.Item>

          {!editingId && (
            <Form.Item
              name="password"
              label="Mật khẩu"
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
            >
              <Input.Password />
            </Form.Item>
          )}

          <Form.Item
            name="fullName"
            label="Tên đầy đủ"
            rules={[{ required: true, message: "Vui lòng nhập tên đầy đủ" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="role"
            label="Vai trò"
            rules={[{ required: true, message: "Vui lòng chọn vai trò" }]}
          >
            <Select>
              <Select.Option value="admin">Quản trị viên</Select.Option>
              <Select.Option value="staff">Nhân viên</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Đổi mật khẩu"
        open={passwordModalVisible}
        onOk={handlePasswordModalOk}
        onCancel={() => setPasswordModalVisible(false)}
      >
        <Form
          form={passwordForm}
          layout="vertical"
        >
          <Form.Item
            name="newPassword"
            label="Mật khẩu mới"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu mới' },
              { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' }
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="Xác nhận mật khẩu"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Mật khẩu xác nhận không khớp'));
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>

    </div>
  );
};

export default UsersPage;
