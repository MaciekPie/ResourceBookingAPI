import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';

@Injectable()
export class ResourcesService {
  constructor(private readonly prisma: PrismaService) {}

  create(createResourceDto: CreateResourceDto) {
    return this.prisma.resource.create({ data: createResourceDto });
  }

  findAll() {
    return this.prisma.resource.findMany();
  }

  findOne(id: number) {
    return this.prisma.resource.findUnique({ where: { id } });
  }

  update(id: number, updateResourceDto: UpdateResourceDto) {
    return this.prisma.resource.update({ where: { id }, data: updateResourceDto });
  }

  remove(id: number) {
    return this.prisma.resource.delete({ where: { id } });
  }
}
