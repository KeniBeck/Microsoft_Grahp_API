import { Test, TestingModule } from '@nestjs/testing';
import { MicrosoftGraphService } from './microsoft_graph.service';

describe('MicrosoftGraphService', () => {
  let service: MicrosoftGraphService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MicrosoftGraphService],
    }).compile();

    service = module.get<MicrosoftGraphService>(MicrosoftGraphService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
