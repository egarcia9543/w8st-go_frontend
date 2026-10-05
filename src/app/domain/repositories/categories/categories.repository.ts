import { Observable } from 'rxjs';
import { CategoryCatalog } from '../../entities/category.entity';

export abstract class CategoriesRepository {
  abstract getCatalog(): Observable<CategoryCatalog>;
}
