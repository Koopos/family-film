const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const QRCode = require('qrcode');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// 提供二维码图片访问
app.get('/qrcode.png', (req, res) => {
    const qrPath = path.join(__dirname, 'qrcode.png');
    if (fs.existsSync(qrPath)) {
        res.sendFile(qrPath);
    } else {
        res.status(404).send('二维码未生成');
    }
});

// 确保上传目录存在
const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// 配置 multer 存储
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        // 保持原始文件名，添加时间戳避免重名
        const uniqueName = Date.now() + '-' + file.originalname;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 500 * 1024 * 1024 } // 限制 500MB
});

// API 路由

// 获取文件列表
app.get('/api/files', (req, res) => {
    try {
        const files = fs.readdirSync(UPLOAD_DIR).map(filename => {
            const filePath = path.join(UPLOAD_DIR, filename);
            const stats = fs.statSync(filePath);
            return {
                name: filename,
                size: stats.size,
                uploadTime: stats.mtime,
                originalName: filename.substring(filename.indexOf('-') + 1)
            };
        }).sort((a, b) => b.uploadTime - a.uploadTime);

        res.json({ success: true, files });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 上传文件
app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    res.json({
        success: true,
        file: {
            name: req.file.filename,
            originalName: req.file.originalname,
            size: req.file.size
        }
    });
});

// 下载文件
app.get('/api/download/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(UPLOAD_DIR, filename);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ success: false, error: 'File not found' });
    }

    res.download(filePath);
});

// 删除文件
app.delete('/api/delete/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(UPLOAD_DIR, filename);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ success: false, error: 'File not found' });
    }

    fs.unlinkSync(filePath);
    res.json({ success: true, message: 'File deleted' });
});

// 获取本机 IP 地址
function getLocalIP() {
    const interfaces = require('os').networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}

// 启动服务器
app.listen(PORT, '0.0.0.0', async () => {
    const localIP = getLocalIP();
    const lanURL = `http://${localIP}:${PORT}`;

    console.log('=================================');
    console.log('   文件共享服务器已启动！');
    console.log('=================================');
    console.log(`   本地访问: http://localhost:${PORT}`);
    console.log(`   局域网访问: ${lanURL}`);
    console.log('=================================');
    console.log('');
    console.log('   正在生成二维码...');

    // 生成二维码图片
    const qrPath = path.join(__dirname, 'qrcode.png');
    try {
        await QRCode.toFile(qrPath, lanURL, {
            width: 400,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        });
        console.log('');
        console.log('   ✅ 二维码已生成!');
        console.log(`   📱 图片路径: ${qrPath}`);
        console.log('');
        console.log('   请用手机扫码打开图片: qrcode.png');
        console.log('   或者访问: http://localhost:3000/qrcode.png');
        console.log('');
    } catch (err) {
        console.error('   生成二维码失败:', err);
    }
    console.log('=================================');
});
