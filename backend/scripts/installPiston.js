const axios = require('axios');

async function installPiston() {
    // Trong container Docker, backend kết nối tới Piston qua http://piston:2000/api/v2
    let baseUrl = process.env.PISTON_API_URL 
        ? process.env.PISTON_API_URL.replace(/\/execute\/?$/, '') 
        : 'http://piston:2000/api/v2';

    console.log(`📡 Đang kết nối tới Piston API tại: ${baseUrl}...`);

    // Chờ Piston khởi động xong (thử tối đa 10 lần)
    let isReady = false;
    for (let i = 1; i <= 10; i++) {
        try {
            await axios.get(`${baseUrl}/packages`, { timeout: 3000 });
            isReady = true;
            break;
        } catch (e) {
            console.log(`⏳ Đang đợi Piston khởi động xong (lần thử ${i}/10)...`);
            await new Promise(r => setTimeout(r, 2000));
        }
    }

    if (!isReady) {
        console.error(`❌ Không thể kết nối tới Piston tại ${baseUrl}. Vui lòng kiểm tra container piston_api.`);
        process.exit(1);
    }

    // Kiểm tra các ngôn ngữ đã cài sẵn trong Piston
    let currentRuntimes = [];
    try {
        const checkRes = await axios.get(`${baseUrl}/runtimes`, { timeout: 5000 });
        currentRuntimes = checkRes.data.map(r => r.language.toLowerCase());
    } catch (e) {}

    const packagesToInstall = [
        { language: 'node', check: 'javascript', label: 'JavaScript / Node.js' },
        { language: 'python', check: 'python', label: 'Python' },
        { language: 'gcc', check: 'c++', label: 'C / C++ (GCC)' }
    ];

    for (const pkg of packagesToInstall) {
        if (currentRuntimes.includes(pkg.check) || currentRuntimes.includes(pkg.language)) {
            console.log(`⏩ ${pkg.label} (${pkg.language}) đã được cài đặt sẵn, bỏ qua.`);
            continue;
        }

        try {
            console.log(`⏳ Đang tải và cài đặt ${pkg.label}... (Vui lòng đợi vài phút do file lớn)`);
            const res = await axios.post(`${baseUrl}/packages`, { language: pkg.language, version: '*' }, { timeout: 600000 });
            console.log(`✅ Cài thành công ${pkg.label}: ${res.data.language} v${res.data.version}`);
        } catch (err) {
            const msg = err.response?.data?.message || err.message;
            console.error(`⚠️ Kết quả cài ${pkg.label}: ${msg}`);
        }
    }

    try {
        const runtimes = await axios.get(`${baseUrl}/runtimes`, { timeout: 5000 });
        console.log('\n🎉 Danh sách ngôn ngữ hiện có sẵn trong Piston:');
        if (runtimes.data.length === 0) {
            console.log(' (Chưa có ngôn ngữ nào. Bạn hãy thử khởi động lại Piston: docker restart piston_api rồi chạy lại script này).');
        } else {
            runtimes.data.forEach(r => {
                const aliases = r.aliases?.length ? ` [aliases: ${r.aliases.join(', ')}]` : '';
                console.log(` - ${r.language} (${r.version})${aliases}`);
            });
        }
        console.log('\n✨ Hoàn tất kiểm tra môi trường Piston!\n');
    } catch (err) {
        console.error('❌ Không thể lấy danh sách runtimes:', err.message);
    }
}

installPiston();
