import request from "supertest";
import { afterEach, describe, expect, it } from "vitest";
import { Genre, IGenre } from "../../src/models/genre";
import { server } from "../../src/server";

describe("/api/genres", () => {
  afterEach(async () => {
    await server.close();
    await Genre.deleteMany({});
  });

  describe("GET /", () => {
    it("should return all genres", async () => {
      await Genre.collection.insertMany([
        { name: "genre1" },
        { name: "genre2" },
      ]);

      const res = await request(server).get("/api/genres");

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some((g: IGenre) => g.name === "genre1")).toBeTruthy();
      expect(res.body.some((g: IGenre) => g.name === "genre2")).toBeTruthy();
    });
  });
});
