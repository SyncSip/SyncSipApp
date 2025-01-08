import { Test, TestingModule } from '@nestjs/testing';
import { GrindersService } from './grinders.service';

describe('GrindersService', () => {
  let service: GrindersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GrindersService],
    }).compile();

    service = module.get<GrindersService>(GrindersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
