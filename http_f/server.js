const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const os = require('os');

const app = express();
const PORT = 3001;  // 端口与你本地测试一致，可自定义（如80、8080）

// ========== 1. 全局配置 ==========
// 跨域配置（允许前端跨域请求，适配所有场景）
app.use(cors({
  origin: '*',        // 测试/内网环境允许所有源，生产环境改为具体域名（如http://192.168.1.100）
  methods: ['GET', 'POST', 'OPTIONS'],  // 允许的HTTP方法
  allowedHeaders: ['Content-Type'],    // 允许的请求头
  credentials: false                   // 关闭Cookie携带（避免跨域冲突）
}));

// 解析JSON请求体（适配前端上报的JSON数据，扩大限制）
app.use(express.json({ limit: '2mb' }));

// 托管前端静态文件（可选，把web.html/web.js放public目录即可通过HTTP访问）
const PUBLIC_DIR = path.join(__dirname, 'public');
if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR);
app.use(express.static(PUBLIC_DIR));  // 访问http://UbuntuIP:3001/web.html即可打开前端

// 日志存储目录（自动创建，保存设备上报的数据）
const LOG_DIR = path.join(__dirname, 'device-logs');
if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR);

// ========== 2. 核心HTTP接口（接收设备上报数据） ==========
// POST接口：/api/device-report（与前端上报地址对应）
app.post('/api/device-report', (req, res) => {
  try {
    // 1. 获取前端上报的设备数据
    const deviceData = req.body;
    console.log(`[${new Date().toLocaleString()}] 收到设备数据：`, deviceData);

    // 2. 保存数据到本地JSON文件（按时间戳+设备指纹命名）
    const visitorId = deviceData.fingerprint?.visitorId || 'unknown';
    const fileName = `${Date.now()}_${visitorId}.json`;
    const filePath = path.join(LOG_DIR, fileName);
    fs.writeFileSync(filePath, JSON.stringify(deviceData, null, 2), 'utf8');

    // 3. 返回成功响应给前端
    res.status(200).json({
      code: 0,
      msg: '数据接收成功',
      data: { id: fileName, timestamp: Date.now() }
    });
  } catch (error) {
    console.error(`[${new Date().toLocaleString()}] 处理数据失败：`, error);
    res.status(500).json({
      code: -1,
      msg: '服务器处理失败',
      error: error.message
    });
  }
});

// ========== 3. 辅助接口（可选，查看服务器状态） ==========
app.get('/api/status', (req, res) => {
  res.status(200).json({
    status: 'running',
    port: PORT,
    ip: getLocalIp(),
    timestamp: Date.now()
  });
});

// ========== 4. 工具函数：获取Ubuntu本机局域网IP ==========
function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const devName in interfaces) {
    const iface = interfaces[devName];
    for (let i = 0; i < iface.length; i++) {
      const alias = iface[i];
      if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
        return alias.address;
      }
    }
  }
  return '127.0.0.1';
}

// ========== 5. 启动HTTP服务 ==========
app.listen(PORT, '0.0.0.0', () => {
  const localIp = getLocalIp();
  console.log(`=== HTTP服务启动成功 ===`);
  console.log(`本地访问：http://localhost:${PORT}`);
  console.log(`局域网访问：http://${localIp}:${PORT}`);
  console.log(`设备上报接口：http://${localIp}:${PORT}/api/device-report`);
  console.log(`前端页面访问：http://${localIp}:${PORT}/web.html`);
});