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
    // TODO:
    // it("should return 401 if user is not logged in", async () => {});

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

  describe("GET /:id", () => {
    // TODO:
    // it("should return 401 if user is not logged in", async () => {});

    it("should return a customer if valid id is passed", async () => {
      const customer = new Customer({ name: "customer1", phone: "123456" });
      await customer.save();

      const res = await request(server).get("/api/customers/" + customer._id);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("name", customer.name);
      expect(res.body).toHaveProperty("phone", customer.phone);
    });

    it("should return 404 if invalid id is passed", async () => {
      const res = await request(server).get("/api/customers/1");

      expect(res.status).toBe(404);
    });

    it("should return 404 if no customer with the given id exists", async () => {
      const id = new mongoose.Types.ObjectId();

      const res = await request(server).get("/api/customers/" + id);

      expect(res.status).toBe(404);
    });
  });
});
