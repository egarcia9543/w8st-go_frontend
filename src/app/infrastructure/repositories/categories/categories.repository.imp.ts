import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { CategoryCatalog } from '../../../domain/entities/category.entity';
import { CategoriesRepository } from '../../../domain/repositories/categories/categories.repository';
import { CategoriesApiDatasource } from '../../datasources/categories/categories.api.datasource';
import { CategoryMapper } from '../../mappers/categories/category.mapper';

@Injectable()
export class CategoriesRepositoryImp implements CategoriesRepository {
  private readonly categoriesDatasource = inject(CategoriesApiDatasource);

  getCatalog(): Observable<CategoryCatalog> {
    return this.categoriesDatasource
      .getCatalog()
      .pipe(map((dto) => CategoryMapper.catalogToDomain(dto)));
  }
}
