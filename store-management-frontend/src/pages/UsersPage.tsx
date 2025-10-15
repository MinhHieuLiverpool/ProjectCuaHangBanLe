import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  message,
  Tag,
} from "antd";
import { PlusOutlined, LockOutlined, UnlockOutlined } from "@ant-design/icons";
import { userService } from "@/services/user.service";
import { User } from "@/types";


const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
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
    setModalVisible(true);
  };

  const handleChangePassword = (record: User) => {
    passwordForm.resetFields();
    setChangingPasswordId(record.userId);
    setPasswordModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      // Mặc định tạo tài khoản với role là "staff" (nhân viên)
      const userData = {
        ...values,
        role: "staff"
      };
      await userService.createUser(userData);
      message.success("Thêm tài khoản nhân viên thành công");
      setModalVisible(false);
      form.resetFields();
      fetchUsers();
    } catch (error: any) {
      message.error(error.response?.data?.message || "Có lỗi xảy ra khi thêm tài khoản");
    }
  };
  const handlePasswordModalOk = async () => {
    try {
      const values = await passwordForm.validateFields();
      if (changingPasswordId == null) {
        message.error("Không xác định được người dùng cần đổi mật khẩu!");
        return;
      }
      await userService.updatePassword(changingPasswordId, values.oldPassword, values.newPassword);
      message.success('Đổi mật khẩu thành công');
      setPasswordModalVisible(false);
      passwordForm.resetFields();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Không thể đổi mật khẩu');
    }
  };

  const handleToggleStatus = async (userId: number, currentStatus: string) => {
    try {
      await userService.toggleUserStatus(userId);
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      message.success(`${newStatus === 'active' ? 'Mở khóa' : 'Khóa'} tài khoản thành công`);
      fetchUsers();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Không thể thay đổi trạng thái tài khoản');
    }
  };



  const columns = [
    {
      title: "ID",
      dataIndex: "userId",
      key: "userId",
      width: 80,
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
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "active" ? "green" : "red"}>
          {status === "active" ? "Hoạt động" : "Đã khóa"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_: any, record: User) => (
        <Space>
          <Button
            type="link"
            icon={<LockOutlined />}
            onClick={() => handleChangePassword(record)}
          >
            Đổi MK
          </Button>
          {record.userId !== 1 && (
            <Button
              type="link"
              icon={record.status === "active" ? <LockOutlined /> : <UnlockOutlined />}
              onClick={() => handleToggleStatus(record.userId, record.status)}
              style={{ color: record.status === "active" ? "orange" : "green" }}
            >
              {record.status === "active" ? "Khóa" : "Mở khóa"}
            </Button>
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
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ["10", "50", "100"],
          showTotal: (total) => `Tổng ${total} mục`,
        }}
      />

      <Modal
        title="Thêm tài khoản nhân viên mới"
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
            <Input />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            name="fullName"
            label="Tên đầy đủ"
            rules={[{ required: true, message: "Vui lòng nhập tên đầy đủ" }]}
          >
            <Input />
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
            name="oldPassword"
            label="Mật khẩu cũ"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu cũ' }
            ]}
          >
            <Input.Password placeholder="Nhập mật khẩu cũ để xác nhận" />
          </Form.Item>
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
