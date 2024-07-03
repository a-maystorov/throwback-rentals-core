import mongoose from "mongoose";
import request from "supertest";
import { afterEach, describe, expect, it, beforeEach } from "vitest";
import { Genre, IGenre } from "../../src/models/genre";
import { server } from "../../src/server";

describe("/api/genres", () => {
  afterEach(async () => {
    server.close();
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

  describe("GET /:id", () => {
    it("should return a genre if valid id is passed", async () => {
      const genre = new Genre({ name: "genre1" });
      await genre.save();

      const res = await request(server).get("/api/genres/" + genre._id);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("name", genre.name);
    });

    it("should return 404 if invalid id is passed", async () => {
      const res = await request(server).get("/api/genres/1");

      expect(res.status).toBe(404);
    });

    it("should return 404 if no genre with the given id exists", async () => {
      const id = new mongoose.Types.ObjectId();

      const res = await request(server).get("/api/genres/" + id);

      expect(res.status).toBe(404);
    });
  });

  describe("POST /", () => {
    let name: string;

    const exe = async () => {
      return await request(server).post("/api/genres").send({ name });
    };

    beforeEach(() => {
      name = "genre1";
    });

    // TODO:
    // it("should return 401 if client is not loggend in", async () => {});

    it("should return 400 if genre is less than 3 characters", async () => {
      name = "ab";

      const res = await exe();

      expect(res.status).toBe(400);
    });

    it("should return 400 if genre is more than 50 characters", async () => {
      name = new Array(52).join("a");

      const res = await exe();

      expect(res.status).toBe(400);
    });

    it("should save the genre if it is valid", async () => {
      await exe();

      const genre = await Genre.find({ name: "genre1" });

      expect(genre).not.toBeNull();
    });

    it("should return the genre if it is valid", async () => {
      const res = await exe();

      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("name", "genre1");
    });
  });
});
