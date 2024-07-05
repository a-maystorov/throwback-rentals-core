import mongoose from "mongoose";
import request from "supertest";
import { afterEach, describe, expect, it, beforeEach } from "vitest";
import { Customer, ICustomer } from "../../src/models/customer";
import { server } from "../../src/server";

describe("/api/customers", () => {
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

  describe("POST /", () => {
    let name: string;
    let phone: string;
    let isGold: boolean;

    const exe = async () => {
      return await request(server).post("/api/customers").send({ name, phone });
    };

    beforeEach(() => {
      name = "customer1";
      phone = "123456";
      isGold = false;
    });

    // TODO:
    // it("should return 401 if user is not loggend in", async () => {});

    it("should return 400 if name is less than 3 characters", async () => {
      name = "ab";

      const res = await exe();

      expect(res.status).toBe(400);
    });

    it("should return 400 if name is more than 20 characters", async () => {
      name = "a".repeat(21);

      const res = await exe();

      expect(res.status).toBe(400);
    });

    it("should return 400 if phone is less than 6 characters", async () => {
      phone = "12345";

      const res = await exe();

      expect(res.status).toBe(400);
    });

    it("should return 400 if phone is more than 20 characters", async () => {
      phone = "1".repeat(21);

      const res = await exe();

      expect(res.status).toBe(400);
    });

    it("should save the customer if it is valid", async () => {
      await exe();

      const customer = await Customer.find({ name: "customer1" });

      expect(customer).not.toBeNull();
    });

    it("should return the customer if it is valid", async () => {
      const res = await exe();

      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("name", "customer1");
      expect(res.body).toHaveProperty("phone", "123456");
      expect(res.body).toHaveProperty("isGold", false);
    });
  });
});
