import { type Type, applyDecorators } from '@nestjs/common';
import { ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import {
  type SchemaObject,
  type ReferenceObject,
} from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import { PaginatedDto } from '../dto/common-data.dto';
import { ResultDto } from '../dto/common-result.dto';
/**
 * 封装 swagger 统一返回格式 装饰器
 * @param model 返回数据类型
 * @param isArray 是否为数组
 * @param isPaginated 是否为分页
 */
export function ApiResult<T extends Type>(model: T, isArray = false, isPaginated = false) {
  const data: SchemaObject | ReferenceObject = isPaginated
    ? {
        type: 'object',
        allOf: [
          {
            $ref: getSchemaPath(PaginatedDto),
          },
          {
            properties: {
              list: {
                type: 'array',
                items: {
                  $ref: getSchemaPath(model),
                },
              },
            },
          },
        ],
      }
    : isArray
    ? { type: 'array', items: { $ref: getSchemaPath(model) } }
    : { $ref: getSchemaPath(model) };
  return applyDecorators(
    ApiOkResponse({
      schema: {
        title: model.name,
        allOf: [
          { $ref: getSchemaPath(ResultDto) },
          {
            properties: { data },
          },
        ],
      },
    })
  );
}
