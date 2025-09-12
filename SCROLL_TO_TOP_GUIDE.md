# Scroll to Top Feature - Client App

## Tổng quan
Tính năng auto scroll về đầu trang đã được tích hợp vào client-app để cải thiện trải nghiệm người dùng khi chuyển đổi giữa các trang.

## Tính năng đã thêm

### 1. ScrollToTop Component
- **File**: `src/components/ScrollToTop.tsx`
- **Chức năng**: Tự động scroll về đầu trang khi chuyển route
- **Tùy chọn**:
  - `behavior`: 'smooth' | 'auto' | 'instant' (mặc định: 'smooth')
  - `delay`: Số milliseconds delay trước khi scroll (mặc định: 0)
  - `offset`: Vị trí scroll offset từ đầu trang (mặc định: 0)

### 2. BackToTopButton Component
- **File**: `src/components/BackToTopButton.tsx`
- **Chức năng**: Nút "Back to Top" xuất hiện khi scroll xuống
- **Tùy chọn**:
  - `threshold`: Ngưỡng scroll để hiển thị nút (mặc định: 300px)
  - `behavior`: Hành vi scroll (mặc định: 'smooth')
  - `offset`: Vị trí scroll offset (mặc định: 0)
  - `className`: CSS class tùy chỉnh
  - `style`: Inline styles tùy chỉnh

### 3. useScrollToTop Hook
- **File**: `src/hooks/useScrollToTop.ts`
- **Chức năng**: Hook tùy chỉnh để quản lý scroll behavior
- **Tùy chọn**:
  - `behavior`: Hành vi scroll
  - `delay`: Delay trước khi scroll
  - `offset`: Vị trí scroll offset
  - `enabled`: Bật/tắt tính năng

## Cách sử dụng

### 1. Auto Scroll khi chuyển route
```tsx
// Trong App.tsx - đã được tích hợp sẵn
<ScrollToTop />

// Hoặc với tùy chọn tùy chỉnh
<ScrollToTop 
  behavior="smooth" 
  delay={100} 
  offset={0} 
/>
```

### 2. Nút Back to Top
```tsx
// Trong App.tsx - đã được tích hợp sẵn
<BackToTopButton />

// Hoặc với tùy chọn tùy chỉnh
<BackToTopButton 
  threshold={500}
  behavior="smooth"
  offset={0}
  style={{ bottom: '32px', right: '32px' }}
/>
```

### 3. Sử dụng Hook trong component
```tsx
import { useScrollToTop } from '../hooks/useScrollToTop';

const MyComponent = () => {
  useScrollToTop({
    behavior: 'smooth',
    delay: 200,
    offset: 0,
    enabled: true
  });

  return <div>My Component</div>;
};
```

## Tùy chọn cấu hình

### ScrollToTop Props
| Prop | Type | Default | Mô tả |
|------|------|---------|-------|
| `behavior` | 'smooth' \| 'auto' \| 'instant' | 'smooth' | Hành vi scroll animation |
| `delay` | number | 0 | Delay trước khi scroll (ms) |
| `offset` | number | 0 | Vị trí scroll offset từ đầu trang |

### BackToTopButton Props
| Prop | Type | Default | Mô tả |
|------|------|---------|-------|
| `threshold` | number | 300 | Ngưỡng scroll để hiển thị nút (px) |
| `behavior` | 'smooth' \| 'auto' \| 'instant' | 'smooth' | Hành vi scroll animation |
| `offset` | number | 0 | Vị trí scroll offset từ đầu trang |
| `className` | string | undefined | CSS class tùy chỉnh |
| `style` | React.CSSProperties | undefined | Inline styles tùy chỉnh |

### useScrollToTop Options
| Option | Type | Default | Mô tả |
|--------|------|---------|-------|
| `behavior` | 'smooth' \| 'auto' \| 'instant' | 'smooth' | Hành vi scroll animation |
| `delay` | number | 0 | Delay trước khi scroll (ms) |
| `offset` | number | 0 | Vị trí scroll offset từ đầu trang |
| `enabled` | boolean | true | Bật/tắt tính năng |

## Ví dụ sử dụng nâng cao

### 1. Scroll với delay cho trang có animation
```tsx
<ScrollToTop delay={300} behavior="smooth" />
```

### 2. Nút Back to Top với style tùy chỉnh
```tsx
<BackToTopButton 
  threshold={400}
  style={{
    bottom: '20px',
    right: '20px',
    backgroundColor: '#00b14f',
    borderColor: '#00b14f'
  }}
/>
```

### 3. Hook với điều kiện
```tsx
const MyComponent = () => {
  const [shouldScroll, setShouldScroll] = useState(true);
  
  useScrollToTop({
    behavior: 'smooth',
    enabled: shouldScroll
  });

  return <div>My Component</div>;
};
```

## Lợi ích

### 1. UX/UI
- Cải thiện trải nghiệm người dùng
- Tự động scroll về đầu trang khi chuyển route
- Nút Back to Top tiện lợi cho trang dài

### 2. Performance
- Lightweight components
- Event listeners được cleanup đúng cách
- Không ảnh hưởng đến performance

### 3. Accessibility
- Nút Back to Top có aria-label
- Hỗ trợ keyboard navigation
- Smooth scroll animation

## Troubleshooting

### 1. Scroll không hoạt động
- Kiểm tra React Router đã được setup đúng
- Kiểm tra component đã được import và sử dụng
- Kiểm tra console để xem có lỗi không

### 2. Nút Back to Top không hiển thị
- Kiểm tra threshold có phù hợp không
- Kiểm tra CSS có bị override không
- Kiểm tra z-index có đủ cao không

### 3. Scroll behavior không mượt
- Kiểm tra browser có hỗ trợ smooth scroll không
- Thử thay đổi behavior thành 'auto' hoặc 'instant'
- Kiểm tra có CSS animation conflict không

## Tương lai

### 1. Tính năng có thể thêm
- Scroll progress indicator
- Custom scroll animations
- Scroll to specific sections
- Mobile-optimized scroll behavior

### 2. Cải tiến
- Intersection Observer API
- Throttled scroll events
- Better mobile support
- Custom scroll triggers
