import loginRoutes from './login-routes'
import { type Router } from 'express'

export const routes: Array<(router: Router) => void> = [loginRoutes]
