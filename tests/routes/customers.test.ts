import mongoose from "mongoose";
import request from "supertest";
import { afterEach, describe, expect, it, beforeEach } from "vitest";
import { Customer, ICustomer } from "../../src/models/customer";
import { server } from "../../src/server";

describe("/api/genres", () => {
  afterEach(async () => {
    server.close();
    await Customer.deleteMany({});
  });

  describe("GET /", () => {
    // TODO: should return all customers if user is logged in
    it("should return all customers", async () => {
      await Customer.collection.insertMany([
        { name: "customer1", phone: "123456" },
        { name: "customer2", phone: "654321" },
      ]);

      const res = await request(server).get("/api/customers");

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(
        res.body.some(
          (c: ICustomer) => c.name === "customer1" && c.phone === "123456"
        )
      ).toBeTruthy();
      expect(
        res.body.some(
          (c: ICustomer) => c.name === "customer2" && c.phone === "654321"
        )
      ).toBeTruthy();
    });
  });
});
