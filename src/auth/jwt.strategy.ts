import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Role } from '../generated/prisma/client.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  validate(payload: { sub: number; email: string; role: Role; timestamp: number }) {
    const expiryMs = Number(process.env.EXPIRY_TIME_MS);
    if (Date.now() - payload.timestamp > expiryMs) {
      throw new UnauthorizedException('Token wygasł');
    }
    return { id: payload.sub, email: payload.email, role: payload.role };
  }
}
