import { createBrowserRouter } from 'react-router';

import { SignInPage } from '@/features/auth/pages/SignInPage';
import { SignUpPage } from '@/features/auth/pages/SignUpPage';
import { GuestRoute, ProtectedRoute } from '@/features/auth/routeGuards';
import { ProductsPage } from '@/features/products/pages/ProductsPage';

import { AppLayout } from './layouts/AppLayout';
import { NotFoundPage } from './NotFoundPage';

export const router = createBrowserRouter([
  {
    element: <GuestRoute />,
    children: [
      { path: '/sign-in', element: <SignInPage /> },
      { path: '/sign-up', element: <SignUpPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/', element: <ProductsPage /> },
          {
            path: '/chat',
            lazy: async () => {
              const { ChatPage } = await import('@/features/chat/pages/ChatPage');
              return { Component: ChatPage };
            },
          },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);
