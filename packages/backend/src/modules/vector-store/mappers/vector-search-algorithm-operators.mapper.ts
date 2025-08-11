import { VectorSearchAlgorithm } from '../enums/vector-search-algorithm.enum';

export const VSAlogirthmOperatorsMapper: Record<VectorSearchAlgorithm, string> =
  {
    [VectorSearchAlgorithm.CosineDistance]: '<=>',
    [VectorSearchAlgorithm.HammingDistance]: '<~>',
    [VectorSearchAlgorithm.JaccardDistance]: '<%>',
    [VectorSearchAlgorithm.L1Distance]: '<+>',
    [VectorSearchAlgorithm.L2Distance]: '<->',
    [VectorSearchAlgorithm.NegativeInnerProduct]: '<#>',
  } as const;
