import { type ExceptionFilter, Catch, type ArgumentsHost, HttpException } from '@nestjs/common';
import { type FastifyReply as Response, type FastifyRequest as Request } from 'fastify';
import { DefaultLogger as Logger } from '../libs/log4j';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  async catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();
    let msg: string = exception.message;
    if (typeof exceptionResponse === 'object' && exceptionResponse != null) {
      if (this.assertExceptionResponsePropertyType(exceptionResponse)) {
        msg = exceptionResponse.error + ': ' + exceptionResponse.message?.join(', ');
      }
    }
    const logFormat = `-----------------------------------------------------------------------
        Request original url: ${request.url}
        Method: ${request.method}
        IP: ${request.ip}
        Status code: ${status}
        Response: ${JSON.stringify(exception)}
        -----------------------------------------------------------------------
        `;
    Logger.info(logFormat);
    await response.status(status).send({
      code: status,
      msg,
    });
  }

  private assertExceptionResponseHasProperty(
    it: unknown
  ): it is { message: string[]; statusCode: number; error: string } {
    return (
      typeof it === 'object' &&
      it !== null &&
      'message' in it &&
      'statusCode' in it &&
      'error' in it
    );
  }

  private assertExceptionResponsePropertyType(
    it: unknown
  ): it is { message: string[]; statusCode: number; error: string } {
    return (
      this.assertExceptionResponseHasProperty(it) &&
      it.message instanceof Array &&
      typeof it.statusCode === 'number' &&
      typeof it.error === 'string'
    );
  }
}
