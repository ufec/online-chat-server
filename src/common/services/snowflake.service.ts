import { Injectable } from '@nestjs/common';

@Injectable()
export class SnowflakeService {
  private readonly twepoch = 1679824443953n; // 定义起始时间戳
  private readonly workerIdBits: number = 5; // 定义workerId的位数
  private readonly datacenterIdBits: number = 5; // 定义datacenterId的位数
  private readonly sequenceBits: number = 12; // 定义序列号的位数
  private readonly maxWorkerId: number = -1 ^ (-1 << this.workerIdBits); // 定义workerId的最大值
  private readonly maxDatacenterId: number = -1 ^ (-1 << this.datacenterIdBits); // 定义datacenterId的最大值
  private readonly workerIdShift: number = this.sequenceBits; // 定义workerId的位移
  private readonly datacenterIdShift: number = this.sequenceBits + this.workerIdBits; // 定义datacenterId的位移
  private readonly timestampLeftShift: number =
    this.sequenceBits + this.workerIdBits + this.datacenterIdBits; // 定义时间戳的位移

  private readonly sequenceMask: number = -1 ^ (-1 << this.sequenceBits); // 定义序列号的掩码
  private sequence = 0; // 初始化序列号
  private lastTimestamp = -1; // 初始化上一次的时间戳

  constructor(private readonly workerId: number, private readonly datacenterId: number) {
    if (workerId > this.maxWorkerId || workerId < 0) {
      // 判断workerId是否合法
      throw new Error(`worker Id can't be greater than ${this.maxWorkerId} or less than 0`);
    }
    if (datacenterId > this.maxDatacenterId || datacenterId < 0) {
      // 判断datacenterId是否合法
      throw new Error(`datacenter Id can't be greater than ${this.maxDatacenterId} or less than 0`);
    }
  }

  private timeGen(): number {
    return Date.now();
  }

  nextId(): string {
    let timestamp = this.timeGen(); // 获取当前时间戳
    if (timestamp < this.lastTimestamp) {
      // 判断时间戳是否合法
      throw new Error(
        `Clock moved backwards. Refusing to generate id for ${
          this.lastTimestamp - timestamp
        } milliseconds`
      );
    }
    if (this.lastTimestamp === timestamp) {
      // 判断是否在同一毫秒内
      this.sequence = (this.sequence + 1) & this.sequenceMask; // 序列号自增
      if (this.sequence === 0) {
        // 序列号达到最大值时，等待下一毫秒
        timestamp = this.tilNextMillis(this.lastTimestamp);
      }
    } else {
      this.sequence = 0; // 序列号重置为0
    }
    this.lastTimestamp = timestamp; // 更新上一次的时间戳
    const id =
      ((BigInt(timestamp) - BigInt(this.twepoch)) << BigInt(this.timestampLeftShift)) | // 时间戳左移
      (BigInt(this.datacenterId) << BigInt(this.datacenterIdShift)) | // datacenterId左移
      (BigInt(this.workerId) << BigInt(this.workerIdShift)) | // workerId左移
      BigInt(this.sequence); // 序列号
    return id.toString();
  }

  private tilNextMillis(lastTimestamp: number): number {
    let timestamp = this.timeGen();
    while (timestamp <= lastTimestamp) {
      // 循环等待下一毫秒
      timestamp = this.timeGen();
    }
    return timestamp;
  }
}
