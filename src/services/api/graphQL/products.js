import { create } from 'apisauce';

const {
  NODE_ENV,
  GRAPHQL_PORT,
  LAMBDA_GRAPHQL,
} = process.env;
const graphqlURL = NODE_ENV === 'production' ? LAMBDA_GRAPHQL : `http://localhost:${GRAPHQL_PORT}/graphql`;

if (!graphqlURL) throw new Error(`Cannot create API: "graphqlURL" = ${typeof graphqlURL}.`);
console.info('graphqlURL: ', graphqlURL); // eslint-disable-line

const createAPI = () => {
  const api = create({
    baseURL: graphqlURL,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    credentials: 'omit',
  });

  const FetchProductById = _id => api.post('', {
    query: `query FetchProductById($_id: String!) {
      FetchProductById(_id: $_id) {
        _id
        mainTitle
        title
        price
        images {
          purpose
          url
        }
        nicotineStrength
        routeTag
      }
    }`,
    variables: {
      _id,
    },
  });
  const FetchPopularProducts = qty => api.post('', {
    query: `query PopularProducts($qty: Int!) {
      PopularProducts(qty: $qty) {
        _id
        product {
          title
          routeTag
          flavor
          images {
            purpose
            url
          }
        }
      }
    }`,
    variables: {
      qty,
    },
  });

  const FetchMultipleProducts = ids => api.post('', {
    query: `
    query FetchMultipleProducts($ids: [ID]!){
      FetchMultipleProducts(ids: $ids){
        _id
        product {
          title
          flavor
          price
          sku
          routeTag
          vendor
          images{
            purpose
            url
          }
        }
      }
    }
    `,
    variables: {
      ids: [...ids],
    },
  });

  return {
    FetchProductById,
    FetchPopularProducts,
    FetchMultipleProducts,
  };
};
export default { createAPI };
