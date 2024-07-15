import request from "supertest";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { Genre } from "../../src/models/genre";
import { User } from "../../src/models/user";
import server from "../../src/server";

describe("auth middleware", () => {
  let token: string;

  const exe = () => {
    return request(server).post("/api/genres").set("x-auth-token", token).send({ name: "genre1" });
  };

  beforeEach(() => {
    token = new User().generateAuthToken();
  });

  afterEach(async () => {
    await Genre.deleteMany({});
    server.close();
  });

  it("should return 401 if no token is provided", async () => {
    token = "";

    const res = await exe();

    expect(res.status).toBe(401);
  });

  it("should return 400 if token is invalid", async () => {
    token = "a";

    const res = await exe();

    expect(res.status).toBe(400);
  });

  it("should return 200 if token is valid", async () => {
    const res = await exe();

    expect(res.status).toBe(200);
  });
});
