import {
  ListType,
  StringType,
  ObjectType,
} from '../../exports';

const ProductTypes = {
  rootType: new ObjectType({
    name: 'ProductRootType',
    description: 'The (qty) most popular products.',
    fields: () => ({
      title: {
        type: StringType,
        description: 'Name of the product.',
      },
      flavor: {
        type: StringType,
        description: 'The flavor for the product (if applicable).',
      },
      price: {
        type: StringType,
        description: 'The price of the product.',
      },
      routeTag: {
        type: StringType,
        description: 'The name of the unique route for the product',
      },
      images: {
        type: new ListType(
          new ObjectType({
            name: 'ProductImageType',
            fields: () => ({
              purpose: { type: StringType },
              url: { type: StringType },
            }),
          }),
        ),
        description: 'Product images.',
      },
    }),
  }),
};
export default ProductTypes;
