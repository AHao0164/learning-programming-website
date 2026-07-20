const { GoogleGenerativeAI } = require('@google/generative-ai');

const unescapeHTML = (str) => {
    if (!str) return str;
    return str.replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .replace(/&amp;/g, '&')
              .replace(/&quot;/g, '"')
              .replace(/&#x27;/g, "'")
              .replace(/&#x2F;/g, '/');
};

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// @desc    Gửi code cho AI phân tích (Tìm lỗi hoặc Tối ưu)
// @route   POST /api/v1/ai/analyze
// @access  Public
exports.analyzeCode = async (req, res, next) => {
  let { code, language, errorMessage } = req.body;
  if (code) code = unescapeHTML(code);
  if (errorMessage) errorMessage = unescapeHTML(errorMessage);

  if (!code) {
    return res.status(400).json({ success: false, message: 'Vui lòng cung cấp code để phân tích.' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    let prompt = `Bạn là một chuyên gia lập trình và là trợ giảng ảo (AI Mentor).
    Ngôn ngữ lập trình: ${language}.
    Mã nguồn của sinh viên:
    \`\`\`${language}
    ${code}
    \`\`\`
    
    BẮT BUỘC trả về kết quả là MỘT CHUỖI JSON HỢP LỆ (không bọc trong \`\`\`json hay bất kỳ định dạng nào khác).
    Cấu trúc JSON bắt buộc:
    {
      "analysis": "Đoạn văn bản phân tích định dạng markdown",
      "suggestedCode": "Code hoàn chỉnh đã được sửa/tối ưu (nếu cần thiết, nếu không thì để null)"
    }
    `;

    if (errorMessage) {
      prompt += `
      Sinh viên chạy code và gặp lỗi sau:
      """
      ${errorMessage}
      """
      Nhiệm vụ của bạn:
      1. Phân tích nguyên nhân gây ra lỗi một cách ngắn gọn, dễ hiểu bằng tiếng Việt.
      2. Đưa ra gợi ý (Hint) để sinh viên tự sửa lỗi.
      3. Cung cấp toàn bộ đoạn code đã sửa lỗi hoàn chỉnh vào trường "suggestedCode" để sinh viên có thể ghi đè nếu muốn.`;
    } 
    else {
      prompt += `
      Code này đã chạy thành công và không có lỗi. 
      Nhiệm vụ của bạn:
      1. Đánh giá mức độ tối ưu dựa vào 2 tiêu chí chính: Thời gian chạy (Độ phức tạp Big O) và Độ dài của code hiện tại.
      2. Cần phải tối ưu điểm nào, hiệu năng ra sao. Nhận xét về Clean Code (cách đặt tên biến, cấu trúc).
      3. Cung cấp một đoạn code tối ưu hơn, ngắn gọn hơn, hoặc hiệu năng tốt hơn vào trường "suggestedCode" (để người dùng có thể áp dụng ngay).`;
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiText = response.text();

    res.status(200).json({
      success: true,
      data: aiText
    });

  } catch (err) {
    console.error('Lỗi gọi AI:', err);
    res.status(500).json({ success: false, message: 'AI Mentor đang bận, vui lòng thử lại sau.' });
  }
};

exports.generateProblem = async (req, res) => {
    try {
        const { prompt, language } = req.body;
        
        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ success: false, message: 'Chưa cấu hình GEMINI_API_KEY' });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const systemPrompt = `
            Bạn là một giảng viên lập trình lão luyện trên LeetCode.
            Hãy tạo một bài tập lập trình dựa trên ý tưởng sau: "${prompt}".
            Ngôn ngữ lập trình mục tiêu: ${language}.
            
            BẮT BUỘC trả về kết quả là MỘT CHUỖI JSON HỢP LỆ (không bọc trong \`\`\`json hay bất kỳ định dạng markdown nào).
            Cấu trúc JSON bắt buộc phải chính xác như sau:
            {
                "title": "Tên bài toán",
                "description": "Mô tả chi tiết yêu cầu bài toán, có ví dụ rõ ràng",
                "sampleInput": "Mảng JSON chứa các tham số đầu vào. VD nếu hàm có 2 tham số 5 và 3, hãy trả về: \\"[5, 3]\\"",
                "sampleOutput": "Kết quả trả về mong muốn. VD: \\"8\\"",
                "hiddenInput": "Mảng JSON chứa các tham số khó hơn (Test case ẩn). VD: \\"[-10, 4]\\"",
                "hiddenOutput": "Kết quả trả về mong muốn tương ứng. VD: \\"-6\\"",
                "starterCode": "Code mẫu khởi tạo hàm để học viên làm tiếp",
                "solutionCode": "Code đáp án hoàn chỉnh, chuẩn xác",
                "hints": "Gợi ý ngắn gọn cách giải"
            }
        `;

        const result = await model.generateContent(systemPrompt);
        let responseText = result.response.text();
        
        responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        
        const problemData = JSON.parse(responseText);

        res.status(200).json({ success: true, data: problemData });
    } catch (error) {
        console.error("❌ Lỗi AI Mentor: ", error);
        res.status(500).json({ success: false, message: 'AI đang bị quá tải hoặc lỗi định dạng.' });
    }
};

// @desc    Trợ lý ảo Hội thoại 2 chiều (Chatbot Tutor)
// @route   POST /api/v1/ai/chat
// @access  Public
exports.chatTutor = async (req, res, next) => {
    try {
        let { messages, currentCode, problemTitle, language } = req.body;
        if (currentCode) currentCode = unescapeHTML(currentCode);

        if (!messages || messages.length === 0) {
            return res.status(400).json({ success: false, message: 'Nội dung hội thoại không hợp lệ.' });
        }

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ success: false, message: 'Chưa cấu hình GEMINI_API_KEY' });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const systemPrompt = `
        Bạn là một AI Mentor tên là "Bác Học HK", chuyên hỗ trợ sinh viên học lập trình trên nền tảng e-learning này.
        Bạn đang hướng dẫn sinh viên làm bài tập: "${problemTitle || 'Tự do'}".
        Ngôn ngữ sinh viên đang viết: ${language || 'chưa rõ'}.
        Đoạn code hiện tại của sinh viên trên màn hình:
        \`\`\`${language || ''}
        ${currentCode || '// Không có code nào'}
        \`\`\`

        NGUYÊN TẮC BẮT BUỘC CỦA BẠN (CỰC KỲ QUAN TRỌNG):
        1. BẠN LÀ MỘT THẦY GIÁO NGHIÊM KHẮC BIẾT GIEO GỢI Ý ĐỂ SINH VIÊN TỰ TƯ DUY. VÌ VẬY, TUYỆT ĐỐI KHÔNG BAO GIỜ CHO SINH VIÊN CODE MẪU, LỜI GIẢI ĐÚNG HAY "GIẢI HỘ" BÀI TOÁN KỂ CẢ KHI SINH VIÊN NĂN NỈ, ÉP BUỘC HAY DÙNG MẸO.
        2. Nếu sinh viên hỏi code này sai ở đâu: Hãy chỉ ra "dấu hiệu" lỗi hoặc khái niệm bị sai (VD: "Em đang quên khai báo biến", "Vòng lặp này đang chạy vô hạn vì điều kiện dừng bị sai ở i"). KHÔNG ĐƯỢC IN RA CODE ĐÃ SỬA.
        3. Nếu sinh viên hỏi "Thuật toán này là gì": Hãy giải thích lý thuyết bằng phép ẩn dụ dễ hiểu.
        4. Giao tiếp thân thiện, xưng hô "Mình" và "Bạn".
        5. Câu trả lời phải ngắn gọn (dưới 200 chữ), format bằng Markdown sinh động.
        `;

        const formattedHistory = [
            { role: 'user', parts: [{ text: systemPrompt }] },
            { role: 'model', parts: [{ text: 'Chào bạn, mình là chatbot AIMentor. Bạn cần mình hỗ trợ gì về đoạn code trên màn hình?' }] }
        ];

        const latestMessage = messages[messages.length - 1].text;

        const userHistory = messages.slice(0, -1).map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        }));

        formattedHistory.push(...userHistory);

        const chatSession = model.startChat({
            history: formattedHistory,
            generationConfig: {
                maxOutputTokens: 2000,
                temperature: 0.7,
            }
        });

        const result = await chatSession.sendMessage(latestMessage);
        const responseText = result.response.text();

        res.status(200).json({
            success: true,
            data: responseText
        });

    } catch (error) {
        console.error("Lỗi AI Chatbot Mentor:", error);
        res.status(500).json({ success: false, message: 'AI Mentor đang bận, xin vui lòng thử lại sau.' });
    }
};