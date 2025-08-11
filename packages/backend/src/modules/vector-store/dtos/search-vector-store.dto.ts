import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { VectorSearchAlgorithm } from '../enums/vector-search-algorithm.enum';

export class SearchVectorStoreDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  query: string;

  @ApiPropertyOptional({
    default: 5,
    description:
      'The number of top results to return from the vector store search.',
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  topK: number = 5;

  @ApiPropertyOptional({
    default: VectorSearchAlgorithm.CosineDistance,
    description:
      'The algorithm to use for vector search. Default is Cosine Distance.',
    type: 'string',
    enum: Object.values(VectorSearchAlgorithm),
  })
  @IsOptional()
  @IsEnum(VectorSearchAlgorithm)
  algorithm: VectorSearchAlgorithm = VectorSearchAlgorithm.CosineDistance;
}
