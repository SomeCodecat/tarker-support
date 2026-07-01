import { GraphQLClient } from "graphql-request";

export const TARKOV_API_ENDPOINT = "https://api.tarkov.dev/graphql";

export function createClient(endpoint: string = TARKOV_API_ENDPOINT): GraphQLClient {
  return new GraphQLClient(endpoint);
}
