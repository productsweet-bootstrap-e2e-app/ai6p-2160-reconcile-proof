// Backend wiring for the Amplify client.
//
// This file is REGENERATED at deploy time by `scripts/gen-aws-config.mjs`, which
// reads the project's DECLARED runtime-config contract from SSM before
// `vite build`. The field set below is generated from that same contract
// (AI6P-2068), so it always matches what the deploy build will write.
//
// The values are local-development placeholders so `npm run build` and
// `npm run dev` work before any deploy. In `managed` backend mode the deploy
// build overwrites them (and falls back to them if the backend is not deployed
// yet). In `external` backend mode the deploy build FAILS rather than falling
// back — these values are never correct in a deployed environment.
// See README "Backend wiring".
export const awsConfig = {
  region: 'ap-southeast-2',
  graphqlEndpoint: 'https://localhost.invalid/graphql-endpoint',
  userPoolId: 'local-dev-user-pool-id',
  userPoolClientId: 'local-dev-user-pool-client-id',
  cognitoWebDomain: 'https://localhost.invalid/cognito-web-domain',
} as const;
