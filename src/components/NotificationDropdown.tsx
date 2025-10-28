import React from 'react';
import { List, Avatar, Typography, Button, Empty, Spin, Tooltip, Badge, Dropdown } from 'antd';
import { BellOutlined, CheckCircleOutlined, DeleteOutlined, FileTextOutlined, MessageOutlined, InfoCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import { useNotifications } from '../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const { Text, Paragraph } = Typography;

const getIconByType = (type: string) => {
  switch (type) {
    case 'NEW_APPLICATION':
      return <FileTextOutlined style={{ color: '#52c41a' }} />;
    case 'MESSAGE':
      return <MessageOutlined style={{ color: '#722ed1' }} />;
    case 'SYSTEM':
      return <InfoCircleOutlined style={{ color: '#1890ff' }} />;
    default:
      return <InfoCircleOutlined style={{ color: '#faad14' }} />;
  }
};

const getTypeText = (type: string) => {
  switch (type) {
    case 'NEW_APPLICATION':
      return 'Đơn ứng tuyển mới';
    case 'APPLICATION_VIEWED':
      return 'NTD đã xem';
    case 'APPLICATION_PASSED':
      return 'Qua vòng CV';
    case 'APPLICATION_REJECTED':
      return 'Bị loại';
    case 'INTERVIEW_INVITED':
      return 'Mời phỏng vấn';
    case 'INTERVIEW_RESULT':
      return 'Kết quả phỏng vấn';
    case 'OFFER_SENT':
      return 'Gửi offer';
    case 'OFFER_RESPONSE':
      return 'Phản hồi offer';
    case 'HIRED':
      return 'Đã tuyển';
    case 'MESSAGE':
      return 'Tin nhắn';
    case 'SYSTEM':
      return 'Hệ thống';
    default:
      return 'Khác';
  }
};

const NotificationDropdown: React.FC = () => {
  const navigate = useNavigate();
  const { notifications, isLoading, unreadCount, markAsRead, markAllAsRead, deleteNotification, refreshNotifications } = useNotifications();

  const content = (
    <div style={{ width: 360, maxHeight: 480, overflow: 'hidden', background: '#fff', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 700, fontSize: 14 }}>Thông báo {unreadCount > 0 ? `(${unreadCount})` : ''}</span>
        {unreadCount > 0 ? (
          <Button type="link" size="small" onClick={markAllAsRead} style={{ padding: 0 }}>Đánh dấu tất cả đã đọc</Button>
        ) : (
          <Button type="link" size="small" onClick={refreshNotifications} style={{ padding: 0 }}>Làm mới</Button>
        )}
      </div>

      <div style={{ maxHeight: 400, overflowY: 'auto', padding: '8px 0' }}>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
            <Spin size="large" />
          </div>
        ) : notifications.length === 0 ? (
          <Empty description="Không có thông báo" image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ margin: '40px 0' }} />
        ) : (
          <List
            dataSource={[...notifications].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())}
            renderItem={(n) => (
              <List.Item
                key={n._id}
                style={{ padding: '10px 14px', background: '#fff', borderLeft: n.isRead ? '3px solid transparent' : '3px solid #52c41a', cursor: 'pointer', borderBottom: '1px solid #f5f5f5' }}
                onClick={async () => {
                  if (!n.isRead) await markAsRead(n._id);
                  if (
                    n.type === 'NEW_APPLICATION' ||
                    n.type === 'APPLICATION_VIEWED' ||
                    n.type === 'APPLICATION_PASSED' ||
                    n.type === 'APPLICATION_REJECTED' ||
                    n.type === 'INTERVIEW_INVITED' ||
                    n.type === 'INTERVIEW_RESULT' ||
                    n.type === 'OFFER_SENT' ||
                    n.type === 'OFFER_RESPONSE' ||
                    n.type === 'HIRED'
                  ) {
                    navigate('/applications');
                  } else {
                    navigate('/profile');
                  }
                }}
                actions={[
                  !n.isRead && (
                    <Tooltip title="Đánh dấu đã đọc" key="read"><Button type="text" icon={<CheckCircleOutlined />} size="small" onClick={(e) => { e.stopPropagation(); markAsRead(n._id); }} /></Tooltip>
                  ),
                  <Tooltip title="Xóa" key="del"><Button type="text" icon={<DeleteOutlined />} size="small" danger onClick={(e) => { e.stopPropagation(); deleteNotification(n._id); }} /></Tooltip>
                ]}
              >
                <List.Item.Meta
                  avatar={<Avatar icon={getIconByType(n.type)} style={{ background: n.isRead ? '#f0f0f0' : '#52c41a' }} />}
                  title={<div style={{ display: 'flex', justifyContent: 'space-between' }}><Text strong={!n.isRead} style={{ color: n.isRead ? '#666' : '#000' }}>{getTypeText(n.type)}</Text><Text type="secondary" style={{ fontSize: 12 }}>{dayjs(n.createdAt).fromNow()}</Text></div>}
                  description={<Paragraph style={{ margin: 0, color: '#444', fontSize: 13 }} ellipsis={{ rows: 2 }}>{n.message}</Paragraph>}
                />
              </List.Item>
            )}
          />
        )}
      </div>
    </div>
  );

  return (
    <Dropdown popupRender={() => content} trigger={["click"]} placement="bottomRight">
      <Badge count={unreadCount} size="small">
        <BellOutlined style={{ fontSize: 20, color: '#0f172a', cursor: 'pointer' }} />
      </Badge>
    </Dropdown>
  );
};

export default NotificationDropdown;


