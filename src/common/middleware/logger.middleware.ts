import { Injectable, type NestMiddleware } from '@nestjs/common';
// import { DefaultLogger } from '../libs/log4j';
import { type FastifyRequest as Request, type FastifyReply as Response } from 'fastify';
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: (error?: any) => void) {
    next();
  }

  // use: (req: Request, res: Response, next: (error?: any) => void) => void = (
  //   req: Request,
  //   res: Response,
  //   next: (error?: any) => void,
  // ) => {
  //   next();
  //   // const logFormat = `
  //   //   RequestOriginalUrl: ${req.url}
  //   //   RequestMethod: ${req.method}
  //   //   RequestBody: ${JSON.stringify(req.body)}
  //   //   RequestQuery: ${JSON.stringify(req.query)}
  //   //   ResponseStatusCode: ${res.statusCode}
  //   //   RequestTime: ${new Date().toLocaleString()}
  //   //   RequestIP: ${req.ip}
  //   // `;
  //   // DefaultLogger.debug(logFormat);
  // };
}
