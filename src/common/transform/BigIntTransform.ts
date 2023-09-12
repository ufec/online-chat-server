import { Injectable, type ArgumentMetadata, type PipeTransform } from '@nestjs/common';

// @Injectable()
// export class BigIntTransform implements PipeTransform {
//   transform(value: unknown, metadata: ArgumentMetadata) {
//     const stack: Array<{
//       obj: unknown;
//       key: string | number;
//     }> = [{ obj: value, key: '' }];
//     const result = {};
//     while (stack.length) {
//       const { obj, key = '' } = stack.pop() ?? {};
//       if (typeof obj === 'bigint') {
//         result[key] = obj.toString();
//       } else if (Array.isArray(obj)) {
//         result[key] = [];
//         for (let i = obj.length - 1; i >= 0; i--) {
//           stack.push({ obj: obj[i], key: i });
//         }
//       } else if (typeof obj === 'object' && obj !== null) {
//         result[key] = {};
//         for (const k in obj) {
//           if (Object.prototype.hasOwnProperty.call(obj, k)) {
//             stack.push({ obj: obj[k], key: k });
//           }
//         }
//       } else {
//         result[key] = obj;
//       }
//     }
//     return result;
//   }
// }

@Injectable()
export class BigIntTransform implements PipeTransform {
  transform(value: unknown, metadata: ArgumentMetadata) {
    const loop = (val: any): unknown => {
      if (typeof val === 'bigint') {
        return val.toString();
      } else if (Array.isArray(val)) {
        return val.map((item) => loop(item)) as unknown;
      } else if (typeof val === 'object' && val !== null) {
        const result = {};
        for (const key in val) {
          if (Object.prototype.hasOwnProperty.call(val, key)) {
            result[key] = loop(val[key]);
          }
        }
        return result;
      }
      return val;
    };
    return loop(value);
  }
}
