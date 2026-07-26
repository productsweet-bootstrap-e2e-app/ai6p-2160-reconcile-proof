import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Amplify } from 'aws-amplify';
import App from './App';
import { awsConfig } from './aws-config';
// Token-driven baseline: `tokens.css` exposes the `--ps-*` custom properties
// generated from `.agent/design-tokens.json`; `base.css` consumes them. Editing
// the token file restyles the app (and the /__preview specimen kit) with no
// code change.
import './tokens.css';
import './base.css';

// Wire the Amplify client to this tenant's backend (AppSync API + Cognito user
// pool). The values come from `src/aws-config.ts`, which the deploy build
// regenerates from the backend CDK stack outputs (published to SSM by
// `deploy-backend.yml`). See README "Backend wiring".
Amplify.configure({
  API: {
    GraphQL: {
      endpoint: awsConfig.graphqlEndpoint,
      region: awsConfig.region,
      defaultAuthMode: 'userPool',
    },
  },
  Auth: {
    Cognito: {
      userPoolId: awsConfig.userPoolId,
      userPoolClientId: awsConfig.userPoolClientId,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
