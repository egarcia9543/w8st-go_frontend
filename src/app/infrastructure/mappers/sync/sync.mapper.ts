import { SyncResult } from '../../../domain/entities/sync.entity';
import { SyncDto } from '../../models/sync.dto';

export class SyncMapper {
  static toDomain(dto: SyncDto): SyncResult {
    return {
      transactionsSynced: dto.created,
      transactionsFailed: dto.skipped,
    };
  }
}
