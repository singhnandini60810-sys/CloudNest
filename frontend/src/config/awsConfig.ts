import { Amplify } from "aws-amplify";

const region = import.meta.env.VITE_AWS_REGION;
const userPoolId = import.meta.env.VITE_COGNITO_USER_POOL_ID;
const userPoolClientId =
  import.meta.env.VITE_COGNITO_APP_CLIENT_ID;

if (!region || !userPoolId || !userPoolClientId) {
  throw new Error(
    "CloudNest Cognito configuration is missing. Check frontend/.env.",
  );
}

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId,
      userPoolClientId,
      loginWith: {
        email: true,
      },
      signUpVerificationMethod: "code",
      userAttributes: {
        email: {
          required: true,
        },
        name: {
          required: true,
        },
      },
    },
  },
});

export const awsConfig = {
  region,
  userPoolId,
  userPoolClientId,
};