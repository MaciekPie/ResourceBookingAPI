import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { ResourceType } from '../../generated/prisma/client.js';

export class CreateResourceDto {
  @IsString()
  name: string;

  @IsEnum(ResourceType)
  type: ResourceType;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;
}
