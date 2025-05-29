import { Test, TestingModule } from '@nestjs/testing';
import { MicrosoftGraphController } from './microsoft_graph.controller';
import { MicrosoftGraphService } from './microsoft_graph.service';

describe('MicrosoftGraphController', () => {
  let controller: MicrosoftGraphController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MicrosoftGraphController],
      providers: [MicrosoftGraphService],
    }).compile();

    controller = module.get<MicrosoftGraphController>(MicrosoftGraphController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
