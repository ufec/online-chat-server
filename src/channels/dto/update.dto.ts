import { PartialType } from '@nestjs/swagger';
import { CreateChannelDto } from './create.dto';

export class UpdateChannelDto extends PartialType(CreateChannelDto) {}
