import { createAdminEntityRoutes } from "@/lib/admin-entity-crud";

const routes = createAdminEntityRoutes("region");

export const GET = routes.GET;
export const POST = routes.POST;
export const PUT = routes.PUT;
export const DELETE = routes.DELETE;
