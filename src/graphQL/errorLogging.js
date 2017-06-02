/* eslint-disable no-console, no-alert */
const {
  NODE_ENV,
  GRAPHQL_PORT,
  LAMBDA_GRAPHQL,
} = process.env;

const graphiqlUrl = NODE_ENV === 'production' ? LAMBDA_GRAPHQL : `http://localhost:${GRAPHQL_PORT}/graphiql`;

let processedRequests = 0;
const requests = {};
const requestIdHeader = 'x-req-id';

export const storeQueriesMiddleware = {
  applyMiddleware({ request, options }, next) {
    const requestId = `r${(processedRequests += 1)}-${request.operationName}`;
    if (!options.headers) options.headers = {};
    options.headers[requestIdHeader] = requestId;
    requests[requestId] = request;
    next();
  },
};
const processGqlResponseErrors = (request, requestId) => {
  const params = [];

  console.group(`processGqlResponseErrors(${requestId})`);
  let value = '';

  Object.keys(request).forEach((key) => {
    if (key === 'query') {
      value = request[key].loc.source.body;
    } else {
      const jsonResponseElement = JSON.stringify(request[key]);

      value = (jsonResponseElement.length > 300) ? `${jsonResponseElement.substr(0, 300)} ... ` : jsonResponseElement;
    }
    console.log(key);
    console.log(value);
    params.push(`${key}=${encodeURIComponent(value)}`);
  });
  console.groupEnd(`processGqlResponseErrors(${requestId})`);

  if (typeof confirm === 'function') {
    if (
      confirm(`
        Open failed GQL request: ${request.operationName} query in GraphiQL?
        `)
    ) window.open(`${graphiqlUrl}?${params.join('&')}`);
  }
};

export const processGQLErrors = {
  applyAfterware({ response, options }, next) {
    const requestId = options.headers[requestIdHeader];
    const request = requests[requestId];
    delete requests[requestId];

    if (!response.ok) {
      response
      .clone()
      .text()
      .then((bodyText) => {
        const theBodyText = (bodyText.length > 500) ? `${bodyText.slice(0, bodyText.length)} ...` : bodyText;
        console.error(`Network Error: ${response.status} (${response.statusText}) - ${theBodyText}`);
        processGqlResponseErrors(request, requestId);
        next();
      });
    } else {
      response.clone().json().then(({ errors }) => {
        if (errors) {
          console.error('GraphQL Errors:', errors.map(e => e.message));
          processGqlResponseErrors(request, requestId);
        }
        next();
      });
    }
  },
};