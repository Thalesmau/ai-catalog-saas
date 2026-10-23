import { Router } from 'express';

import { CreateProductController } from '@application/controllers/products/CreateProductController';
import { DeleteProductController } from '@application/controllers/products/DeleteProductController';
import { GetProductController } from '@application/controllers/products/GetProductController';
import { ListCategoriesController } from '@application/controllers/products/ListCategoriesController';
import { ListProductsController } from '@application/controllers/products/ListProductsController';
import { UpdateProductController } from '@application/controllers/products/UpdateProductController';
import { expressHttpAdapter } from '@main/adapters/expressHttpAdapter';
import { authenticate } from '@main/middlewares/authenticate';
import { authorize } from '@main/middlewares/authorize';

export const productsRoutes = Router();

productsRoutes.use('/products', authenticate);

productsRoutes.get('/products', expressHttpAdapter(ListProductsController));
productsRoutes.get('/products/categories', expressHttpAdapter(ListCategoriesController));
productsRoutes.get('/products/:id', expressHttpAdapter(GetProductController));

productsRoutes.post('/products', authorize('admin'), expressHttpAdapter(CreateProductController));
productsRoutes.patch('/products/:id', authorize('admin'), expressHttpAdapter(UpdateProductController));
productsRoutes.delete('/products/:id', authorize('admin'), expressHttpAdapter(DeleteProductController));
