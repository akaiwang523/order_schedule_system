// 多張照片管理的 API 端點
// 添加到 orderItem 路由中

export const photoRoutes = {
  addPhoto: protectedProcedure
    .input(z.object({
      itemId: z.number(),
      photoUrl: z.string(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Database connection failed',
        });
      }
      
      await db.execute(
        `INSERT INTO orderItemPhotos (itemId, photoUrl) VALUES (?, ?)`
        , [input.itemId, input.photoUrl]
      );
      return { success: true };
    }),

  getPhotos: protectedProcedure
    .input(z.object({ itemId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Database connection failed',
        });
      }
      
      const result = await db.query(
        `SELECT id, photoUrl, createdAt FROM orderItemPhotos WHERE itemId = ? ORDER BY createdAt ASC`
        , [input.itemId]
      );
      return result || [];
    }),

  deletePhoto: protectedProcedure
    .input(z.object({ photoId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Database connection failed',
        });
      }
      
      await db.execute(
        `DELETE FROM orderItemPhotos WHERE id = ?`
        , [input.photoId]
      );
      return { success: true };
    }),
};
