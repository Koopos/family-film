# 文件共享服务器

局域网内快速文件共享解决方案，支持二维码扫描访问。

## 功能特性

- 文件上传与下载
- 文件列表浏览（按上传时间排序）
- 文件删除
- 自动生成二维码，手机扫码即可访问
- 局域网内多设备访问
- 单文件最大支持 500MB

## 安装

```bash
npm install
```

## 使用

启动服务器：

```bash
npm start
```

或者

```bash
npm run dev
```

服务器启动后会显示：

```
=================================
   文件共享服务器已启动！
=================================
   本地访问: http://localhost:3000
   局域网访问: http://192.168.x.x:3000
=================================

   正在生成二维码...

   二维码已生成!
   📱 图片路径: /path/to/qrcode.png

   请用手机扫码打开图片: qrcode.png
   或者访问: http://localhost:3000/qrcode.png
=================================
```

## 自定义端口

通过环境变量 `PORT` 指定端口：

```bash
PORT=8080 npm start
```

## API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/files` | 获取文件列表 |
| POST | `/api/upload` | 上传文件 |
| GET | `/api/download/:filename` | 下载文件 |
| DELETE | `/api/delete/:filename` | 删除文件 |
| GET | `/qrcode.png` | 获取二维码图片 |

## 技术栈

- [Express](https://expressjs.com/) - Web 框架
- [Multer](https://github.com/expressjs/multer) - 文件上传处理
- [QRCode](https://github.com/soldair/node-qrcode) - 二维码生成
- [CORS](https://github.com/expressjs/cors) - 跨域支持

## License

ISC
