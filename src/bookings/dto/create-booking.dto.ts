import { IsDateString, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateBookingDto {
  @IsInt()
  resourceId: number;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;

  @IsOptional()
  @IsString()
  purpose?: string;
}
