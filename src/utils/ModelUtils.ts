import { Sequelize } from 'sequelize-typescript';
import { FindAndCountOptions, ModelCtor, Op, OrderItem, WhereOptions } from 'sequelize';
import { Col, Fn, Literal } from 'sequelize/types/utils';

export interface ListData<Data> {
  count: number;
  rows: Data[];
}

export const listDataWithPagination = async (
  page: number = 1,
  perPage: number = 25,
  sort: [Col | Fn | Literal, string] | string[] | undefined,
  query: string = '',
  queryFields: (string | Col)[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: ModelCtor<any>,
  countColumn?: string,
  orderColumn?: string,
  additionalOptions?: FindAndCountOptions
): Promise<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rows: any[];
  count: number;
}> => {
  const defaultCountColumn = `${model.name}.id`;
  const defaultOrderColumn = orderColumn || 'id';

  let order: OrderItem = [defaultOrderColumn, 'ASC'];

  if (sort && Array.isArray(sort) && sort.length > 1) {
    const direction = sort[1] && ['ASC', 'DESC'].includes(sort[1].toUpperCase()) ? sort[1].toUpperCase() : 'ASC';

    if (typeof sort[0] === 'string') {
      order = [...sort[0].split('.'), direction] as OrderItem;
    } else {
      order = [sort[0], direction];
    }
  }

  const whereAnd: WhereOptions[] = [];

  if (query?.length && queryFields.length) {
    whereAnd.push({
      [Op.or]: queryFields.map((queryFieldName) =>
        typeof queryFieldName === 'string'
          ? Sequelize.where(Sequelize.cast(Sequelize.col(queryFieldName), 'text'), 'ILIKE', `%${query}%`)
          : Sequelize.where(queryFieldName, 'ILIKE', `%${query}%`)
      ),
    });
  }

  if (additionalOptions?.where) {
    whereAnd.push(additionalOptions.where);
  }

  return model.findAndCountAll({
    distinct: true,
    col: countColumn || defaultCountColumn,
    order: [order],
    offset: (page - 1) * perPage,
    ...(perPage ? { limit: perPage } : null),
    ...additionalOptions,
    where: {
      [Op.and]: whereAnd,
    },
  });
};

export const upsert = async <Model>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: ModelCtor<any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  values: { [key: string]: any },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  where: { [key: string]: any }
): Promise<Model> => {
  const foundRecord = await model.findOne({ where });

  if (foundRecord) {
    return foundRecord.update(values);
  }

  return model.create({
    ...where,
    ...values,
  });
};
