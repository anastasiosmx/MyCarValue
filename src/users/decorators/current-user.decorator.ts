import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// Will take the user data from the custom interceptor
export const CurrentUser = createParamDecorator(
  (data: never, context: ExecutionContext) => {
    // ExecutionCOntext is accualy the request data
    const request = context.switchToHttp().getRequest();

    return request.currentUser;
  },
);
