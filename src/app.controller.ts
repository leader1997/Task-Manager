import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { SkipThrottle, ThrottlerGuard } from '@nestjs/throttler';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('ping')
@Controller()
export class AppController {
  @ApiResponse({
    status: 200,
    description: 'The server is running',
    schema: {
      example: 'Server is running',
    },
  })
  @UseGuards(ThrottlerGuard)
  @Get('ping')
  ping(): string {
    return 'Server is running';
  }

  //@UseGuards   (Auth0Guard)
  @SkipThrottle()
  @UseGuards(AuthGuard('jwt'))
  @Get('test')
  test(): string {
    return 'test';
  }
}
