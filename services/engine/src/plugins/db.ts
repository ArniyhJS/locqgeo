import { db, queryClient } from "@locqgeo/database";
import type { FastifyPluginAsync } from "fastify";

export const dbPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.decorate("db", db);
  fastify.decorate("queryClient", queryClient);

  fastify.addHook("onClose", async () => {
    await queryClient.end();
  });
};
