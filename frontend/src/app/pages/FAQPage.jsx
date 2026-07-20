import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const faqData = [
  {
    category: 'Khóa học & Bài học',
    questions: [
      {
        q: 'Làm sao để đăng ký khóa học?',
        a: 'Để đăng ký khóa học, bạn cần đăng nhập vào tài khoản, chọn khóa học mong muốn, sau đó nhấn nút "Đăng ký". Với khóa học miễn phí, bạn có thể đăng ký ngay. Với khóa học có phí, bạn sẽ được hướng dẫn thanh toán.'
      },
      {
        q: 'Tôi có thể học trên điện thoại không?',
        a: 'Có! HK Learning được thiết kế responsive, hoạt động tốt trên cả máy tính, tablet và điện thoại. Bạn có thể học mọi lúc mọi nơi.'
      },
      {
        q: 'Khóa học có thời hạn không?',
        a: 'Không! Khi đã đăng ký khóa học, bạn có thể học không giới hạn thời gian. Tiến độ học tập của bạn sẽ được lưu lại để bạn có thể tiếp tục bất cứ lúc nào.'
      }
    ]
  },
  {
    category: 'Thanh toán & Hoàn tiền',
    questions: [
      {
        q: 'HK Learning có những phương thức thanh toán nào?',
        a: 'Hiện tại chúng tôi hỗ trợ thanh toán qua thẻ ATM nội địa, thẻ Visa/Mastercard và các ví điện tử phổ biến như MoMo, ZaloPay, VNPay.'
      },
      {
        q: 'Chính sách hoàn tiền như thế nào?',
        a: 'Nếu bạn không hài lòng với khóa học trong vòng 7 ngày kể từ ngày đăng ký, bạn có thể yêu cầu hoàn tiền 100%. Liên hệ bộ phận hỗ trợ để được xử lý.'
      },
      {
        q: 'Tôi có thể chuyển khóa học cho người khác không?',
        a: 'Khóa học được gắn với tài khoản của bạn và không thể chuyển cho người khác. Tuy nhiên, bạn có thể đăng ký nhiều tài khoản nếu muốn tặng cho người thân.'
      }
    ]
  },
  {
    category: 'Tài khoản & Bảo mật',
    questions: [
      {
        q: 'Làm sao để đặt lại mật khẩu?',
        a: 'Tại trang đăng nhập, nhấn "Quên mật khẩu" và nhập email đã đăng ký. Chúng tôi sẽ gửi link đặt lại mật khẩu vào email của bạn.'
      },
      {
        q: 'Tôi có thể thay đổi thông tin cá nhân không?',
        a: 'Có! Đăng nhập và vào "Trang cá nhân" hoặc "Cài đặt" để cập nhật thông tin như tên, avatar, email và mật khẩu.'
      },
      {
        q: 'Tài khoản của tôi có an toàn không?',
        a: 'Chúng tôi sử dụng mã hóa hiện đại và các biện pháp bảo mật cao cấp để bảo vệ thông tin của bạn. Mật khẩu được hash và không bao giờ được lưu dưới dạng plain text.'
      }
    ]
  },
  {
    category: 'Kỹ thuật & Hỗ trợ',
    questions: [
      {
        q: 'Trình biên dịch code hỗ trợ những ngôn ngữ nào?',
        a: 'Hiện tại chúng tôi hỗ trợ JavaScript, Python, C++, Java và nhiều ngôn ngữ khác. Danh sách đầy đủ được cập nhật thường xuyên.'
      },
      {
        q: 'AI Trợ giảng hoạt động như thế nào?',
        a: 'AI Trợ giảng là trợ lý ảo thông minh, có thể phân tích code của bạn, gợi ý sửa lỗi, giải thích khái niệm và đánh giá mức độ tối ưu của thuật toán.'
      },
      {
        q: 'Làm sao để liên hệ với bộ phận hỗ trợ?',
        a: 'Bạn có thể liên hệ qua email: 52300032@student.tdtu.edu.vn hoặc gửi tin nhắn qua trang Liên hệ. Đội ngũ hỗ trợ sẽ phản hồi trong vòng 24 giờ.'
      }
    ]
  }
];

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{
      borderBottom: '1px solid #e5e7eb',
      marginBottom: '8px'
    }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 0',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left'
        }}
      >
        <span style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a1a', paddingRight: '16px' }}>
          {question}
        </span>
        {isOpen ? (
          <ChevronUp size={20} color="#f05123" />
        ) : (
          <ChevronDown size={20} color="#666" />
        )}
      </button>
      {isOpen && (
        <div style={{
          paddingBottom: '16px',
          fontSize: '15px',
          lineHeight: 1.7,
          color: '#555'
        }}>
          {answer}
        </div>
      )}
    </div>
  );
};

export const FAQPage = () => {
  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', paddingBottom: '60px' }}>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #f05123 0%, #ff6b35 100%)',
        padding: '60px 20px',
        textAlign: 'center',
        color: 'white'
      }}>
        <h1 style={{ fontSize: '42px', fontWeight: 800, marginBottom: '16px' }}>
          Câu hỏi thường gặp
        </h1>
        <p style={{ fontSize: '18px', opacity: 0.9, maxWidth: '500px', margin: '0 auto' }}>
          Tìm câu trả lời nhanh cho những thắc mắc phổ biến nhất
        </p>
      </div>

      {/* FAQ Content */}
      <div className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
        {faqData.map((category, index) => (
          <div key={index} style={{ marginBottom: '40px' }}>
            <h2 style={{ 
              fontSize: '22px', 
              fontWeight: 700, 
              color: '#1a1a1a', 
              marginBottom: '16px',
              paddingBottom: '8px',
              borderBottom: '2px solid #f05123'
            }}>
              {category.category}
            </h2>
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '8px 20px' }}>
              {category.questions.map((item, qIndex) => (
                <FAQItem key={qIndex} question={item.q} answer={item.a} />
              ))}
            </div>
          </div>
        ))}

        {/* Liên hệ hỗ trợ */}
        <div style={{
          backgroundColor: '#fff7ed',
          borderRadius: '16px',
          padding: '32px',
          textAlign: 'center',
          marginTop: '40px'
        }}>
          <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px', color: '#1a1a1a' }}>
            Không tìm thấy câu trả lời?
          </h3>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            Đừng lo lắng! Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng giúp đỡ bạn.
          </p>
          <a 
            href="mailto:52300032@student.tdtu.edu.vn"
            style={{
              display: 'inline-block',
              padding: '12px 32px',
              backgroundColor: '#f05123',
              color: 'white',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 600
            }}
          >
            Liên hệ hỗ trợ
          </a>
        </div>
      </div>
    </div>
  );
};
