import { ConflictException, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createBookingDto: CreateBookingDto, userId: number) {
    const { resourceId, startTime, endTime } = createBookingDto;

    const overlapping = await this.prisma.booking.findFirst({
      where: {
        resourceId,
        status: 'CONFIRMED',
        startTime: { lt: new Date(endTime) },
        endTime: { gt: new Date(startTime) },
      },
    });

    if (overlapping) {
      throw new ConflictException('Zasób jest już zarezerwowany w tym przedziale czasowym');
    }

    return this.prisma.booking.create({
      data: { ...createBookingDto, userId, startTime: new Date(startTime), endTime: new Date(endTime) },
    });
  }

  findAll() {
    return this.prisma.booking.findMany();
  }

  async findOne(id: number) {
    const booking = await this.prisma.booking.findUnique({ where: { id } });
    if (!booking) throw new NotFoundException(`Rezerwacja o id ${id} nie istnieje`);
    return booking;
  }

  update(id: number, updateBookingDto: UpdateBookingDto) {
    return this.prisma.booking.update({ where: { id }, data: updateBookingDto });
  }

  async remove(id: number, userId: number) {
    const booking = await this.findOne(id);
    if (booking.userId !== userId) {
      throw new ForbiddenException('Nie możesz anulować cudzej rezerwacji');
    }
    return this.prisma.booking.delete({ where: { id } });
  }
}
