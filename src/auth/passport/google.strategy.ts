import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: 'http://localhost:4000/auth/google/google-redirect',
      scope: ['email', 'profile'],
      passReqToCallback: true,
    });
  }

  validate(
    req: Request,
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ) {
    const { name, emails, photos } = profile;
    const user = {
      email: emails[0]?.value,
      firstName: name?.givenName,
      lastName: name?.familyName,
      picture: photos[0]?.value,
      accessToken,
      refreshToken,
    };
    console.log(
      'You are in validate function of google.strategy.ts file: ' +
        JSON.stringify(req.query.state),
    );
    done(null, user);
  }

  authenticate(req: Request) {
    if (req.query.myData) {
      // /auth
      return super.authenticate(req, {
        state: req.query.myData,
      });
    }
    // /auth/callback
    return super.authenticate(req);
  }
}
