import { Controller, Get } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
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
  @Get('ping')
  ping(): string {
    return 'Server is running';
  }
}
