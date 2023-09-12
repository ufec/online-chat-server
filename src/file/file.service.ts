import { type MultipartFile } from '@fastify/multipart';
import { Injectable } from '@nestjs/common';
import * as fs from 'node:fs';

@Injectable()
export class FileService {
  uploadAvatar(file: MultipartFile) {
    // 将文件保存到根目录的 uploads 文件夹下，并根据年月日生成文件夹
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const path = `uploads/${year}/${month}/${day}`;
    // 如果文件夹不存在则创建
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path, { recursive: true });
    }
    // 生成随机文件名
    const filename = `${Date.now()}-${Math.floor(Math.random() * 10000)}.${file.filename}`;
    // 保存文件
    file.file.pipe(fs.createWriteStream(`${path}/${filename}`));
    return `/${path}/${filename}`;
  }
}
