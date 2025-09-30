import React, { useState } from 'react';
import { Dropdown, Avatar, Button, Divider } from 'antd';
import { 
  UserOutlined, 
  LogoutOutlined, 
  MailOutlined, 
  DownOutlined,
  SettingOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import Swal from 'sweetalert2';
import { authAPI } from '../apis/auth.api';

// const { Text } = Typography;

const UserProfileDropdown: React.FC = () => {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Debug log để kiểm tra user data
  console.log('UserProfileDropdown - User data:', user);
  console.log('UserProfileDropdown - isVerified:', user?.isVerified);

  const handleLogout = async () => {
    const result = await Swal.fire({
      icon: 'question',
      title: 'Đăng xuất',
      text: 'Bạn có chắc chắn muốn đăng xuất?',
      showCancelButton: true,
      confirmButtonText: 'Đăng xuất',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#ff4d4f',
      cancelButtonColor: '#6c757d'
    });

    if (result.isConfirmed) {
      setLoading(true);
      try {
        await logout();
        await Swal.fire({
          icon: 'success',
          title: 'Đăng xuất thành công!',
          text: 'Cảm ơn bạn đã sử dụng HiWork',
          confirmButtonText: 'Đóng',
          confirmButtonColor: '#00b14f',
          timer: 2000,
          timerProgressBar: true
        });
        navigate('/');
      } catch (error) {
        console.error('Logout error:', error);
        Swal.fire({
          icon: 'error',
          title: 'Lỗi đăng xuất',
          text: 'Có lỗi xảy ra khi đăng xuất',
          confirmButtonText: 'Thử lại',
          confirmButtonColor: '#ff4d4f'
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const menuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Thông tin tài khoản',
      onClick: () => navigate('/profile')
    },
    // New item: Applied Jobs
    {
      key: 'applied-jobs',
      icon: <FileTextOutlined />,
      label: 'Việc làm đã ứng tuyển',
      onClick: () => navigate('/applications')
    },
    user?.isVerified === true ? null : {
      key: 'verification',
      icon: <MailOutlined style={{ color: '#00b14f' }} />,
      label: 'Xác thực ngay !',
      onClick: async () => {
        if (!user?.email) return
        try {
          const res = await authAPI.resendVerification(user.email)
          if (res?.success !== false) {
            await Swal.fire({
              icon: 'success',
              title: 'Đã gửi email xác thực',
              text: 'Vui lòng kiểm tra hộp thư của bạn.',
              confirmButtonColor: '#00b14f'
            })
          } else {
            await Swal.fire({
              icon: 'error',
              title: 'Gửi không thành công',
              text: res?.message || 'Vui lòng thử lại sau.',
              confirmButtonColor: '#ff4d4f'
            })
          }
        } catch (e: any) {
          await Swal.fire({
            icon: 'error',
            title: 'Lỗi hệ thống',
            text: e?.message || 'Có lỗi xảy ra',
            confirmButtonColor: '#ff4d4f'
          })
        }
      }
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Cài đặt',
      onClick: () => {
        // TODO: Navigate to settings page
        console.log('Navigate to settings');
      }
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      onClick: handleLogout,
      danger: true
    }
  ];

  const dropdownOverlay = (
    <div style={{ 
      background: 'white', 
      borderRadius: '8px', 
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      padding: '8px 0',
      minWidth: '200px'
    }}>
      {/* User Info Header */}
      <div style={{ 
        padding: '12px 16px', 
        borderBottom: '1px solid #f0f0f0',
        background: '#fafafa'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Avatar 
            size={40} 
            icon={<UserOutlined />} 
            style={{ background: '#00b14f' }}
          />
          <div>
            <div style={{ fontWeight: 600, fontSize: '14px', color: '#262626' }}>
              {user?.fullName}
            </div>
            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
              {user?.email}
            </div>
            {user?.roles && user.roles.length > 0 && (
              <div style={{ fontSize: '11px', color: '#00b14f', marginTop: '2px' }}>
                {user.roles.join(', ')}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div style={{ padding: '4px 0' }}>
        {menuItems.map((item, index) => {
          if (item && item.type === 'divider') {
            return <Divider key={index} style={{ margin: '4px 0' }} />;
          }
          if (!item) {
            return null;
          }

          return (
            <div
              key={item.key}
              onClick={item.onClick}
              style={{
                padding: '8px 16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                color: item.danger ? '#ff4d4f' : '#262626',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.backgroundColor = item.danger ? '#fff2f0' : '#f5f5f5';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent';
              }}
            >
              {item.icon}
              <span>{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <Dropdown 
      dropdownRender={() => dropdownOverlay}
      trigger={['click']}
      placement="bottomRight"
      arrow
    >
      <Button 
        type="text" 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          height: '40px',
          padding: '0 12px',
          borderRadius: '20px',
          border: '1px solid #d9d9d9',
          background: 'white'
        }}
        loading={loading}
      >
        <Avatar 
          size={24} 
          icon={<UserOutlined />} 
          style={{ background: '#00b14f' }}
        />
        <span style={{ fontSize: '14px', color: '#262626' }}>
          {user?.fullName?.split(' ').pop() || 'User'}
        </span>
        <DownOutlined style={{ fontSize: '12px', color: '#8c8c8c' }} />
      </Button>
    </Dropdown>
  );
};

export default UserProfileDropdown;
