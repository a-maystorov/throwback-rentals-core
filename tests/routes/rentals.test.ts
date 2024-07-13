import { Types } from "mongoose";
import request from "supertest";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { Customer, ICustomer } from "../../src/models/customer";
import { Game, IGame } from "../../src/models/game";
import { Genre } from "../../src/models/genre";
import { IRental, Rental } from "../../src/models/rental";
import { User } from "../../src/models/user";
import { server } from "../../src/server";

describe("/api/rentals", () => {
  afterEach(async () => {
    await Game.deleteMany({});
    await Customer.deleteMany({});
    await Rental.deleteMany({});
    server.close();
  });

  describe("GET /", () => {
    let token: string;

    beforeEach(() => {
      token = new User().generateAuthToken();
    });

    it("should return 401 if user is not logged in", async () => {
      token = "";

      const res = await request(server).get("/api/rentals").set("x-auth-token", token);

      expect(res.status).toBe(401);
    });

    it("should return all rentals", async () => {
      const customer1 = new Customer({ name: "customer1", phone: "123456" });
      const customer2 = new Customer({ name: "customer2", phone: "654321" });

      await customer1.save();
      await customer2.save();

      const genre1 = new Genre({ name: "genre1" });
      const genre2 = new Genre({ name: "genre2" });

      await genre1.save();
      await genre2.save();

      const game1 = new Game({
        title: "game1",
        genre: genre1._id,
        numberInStock: 1,
        dailyRentalRate: 2,
        purchasePrice: 39.99,
      });

      const game2 = new Game({
        title: "game2",
        genre: genre2._id,
        numberInStock: 3,
        dailyRentalRate: 4,
        purchasePrice: 59.99,
      });

      await game1.save();
      await game2.save();

      const rentals: IRental[] = [
        {
          customer: customer1._id,
          game: game1._id,
          dateOut: new Date(),
        },
        {
          customer: customer2._id,
          game: game2._id,
          dateOut: new Date(),
        },
      ];

      await Rental.collection.insertMany(rentals);

      const res = await request(server).get("/api/rentals").set("x-auth-token", token);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(
        res.body.some((r: IRental) => (r.customer as ICustomer).name === "customer1")
      ).toBeTruthy();
      expect(res.body.some((r: IRental) => (r.game as IGame).title === "game1")).toBeTruthy();
      expect(
        res.body.some((r: IRental) => (r.customer as ICustomer).phone === "654321")
      ).toBeTruthy();
      expect(res.body.some((r: IRental) => (r.game as IGame).dailyRentalRate === 4)).toBeTruthy();
    });
  });

  describe("GET /:id", () => {
    let token: string;

    beforeEach(() => {
      token = new User().generateAuthToken();
    });

    it("should return 401 if user is not logged in", async () => {
      token = "";

      const res = await request(server).get("/api/rentals").set("x-auth-token", token);

      expect(res.status).toBe(401);
    });

    it("should return a rental if valid id is passed", async () => {
      const customer = new Customer({ name: "customer1", phone: "123456" });
      await customer.save();

      const genre = new Genre({ name: "genre1" });
      await genre.save();

      const game = new Game({
        title: "game1",
        genre: genre._id,
        numberInStock: 1,
        dailyRentalRate: 2,
        purchasePrice: 39.99,
      });

      await game.save();

      const rental = new Rental({
        customer: customer._id,
        game: game._id,
      });

      await rental.save();

      const res = await request(server)
        .get("/api/rentals/" + rental._id)
        .set("x-auth-token", token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("customer");
      expect(res.body.customer).toHaveProperty("name", "customer1");
      expect(res.body).toHaveProperty("game");
      expect(res.body.game).toHaveProperty("dailyRentalRate", 2);
      expect(res.body.game).toHaveProperty("purchasePrice", 39.99);
    });

    it("should return 404 if invalid id is passed", async () => {
      const res = await request(server).get("/api/rentals/1").set("x-auth-token", token);

      expect(res.status).toBe(404);
    });

    it("should return 404 if no customer with the given id exists", async () => {
      const id = new Types.ObjectId();

      const res = await request(server)
        .get("/api/rentals/" + id)
        .set("x-auth-token", token);

      expect(res.status).toBe(404);
    });
  });

  describe("POST /", () => {
    let token: string;
    let customerId: string;
    let gameId: string;
    let customer: InstanceType<typeof Customer>;
    let game: InstanceType<typeof Game>;

    const exe = async () => {
      return await request(server)
        .post("/api/rentals")
        .set("x-auth-token", token)
        .send({ customer: customerId, game: gameId });
    };

    beforeEach(async () => {
      token = new User().generateAuthToken();
      customerId = new Types.ObjectId().toHexString();
      gameId = new Types.ObjectId().toHexString();

      const genre = new Genre({ name: "genre1" });
      await genre.save();

      customer = new Customer({
        _id: customerId,
        name: "customer1",
        phone: "123456",
      });
      await customer.save();

      game = new Game({
        _id: gameId,
        title: "title1",
        genre: genre._id,
        numberInStock: 2,
        dailyRentalRate: 1,
        purchasePrice: 59.99,
      });
      await game.save();
    });

    it("should return 401 if user is not loggend in", async () => {
      token = "";

      const res = await exe();

      expect(res.status).toBe(401);
    });

    it("should return 400 if customerId is not provided", async () => {
      customerId = "";

      const res = await exe();

      expect(res.status).toBe(400);
    });

    it("should return 400 if customerId is invalid", async () => {
      customerId = "123";

      const res = await exe();

      expect(res.status).toBe(400);
    });

    it("should return 400 if gameId is not provided", async () => {
      gameId = "";

      const res = await exe();

      expect(res.status).toBe(400);
    });

    it("should return 400 if gameId is invalid", async () => {
      gameId = "123";

      const res = await exe();

      expect(res.status).toBe(400);
    });

    it("should return 400 if game is out of stock", async () => {
      game.numberInStock = 0;
      await game.save();

      const res = await exe();

      expect(res.status).toBe(400);
    });

    it("should decrease the game stock if input is valid", async () => {
      await exe();

      const gameInDb = await Game.findById(gameId);

      expect(gameInDb!.numberInStock).toBe(game.numberInStock - 1);
    });

    it("should return 200 if we have a valid request", async () => {
      const res = await exe();

      expect(res.status).toBe(200);
    });

    it("should return the rental if it is valid", async () => {
      const res = await exe();

      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("customer");
      expect(res.body.customer).toHaveProperty("name", "customer1");
      expect(res.body).toHaveProperty("game");
      expect(res.body.game).toHaveProperty("dailyRentalRate", 1);
      expect(res.body).toHaveProperty("dateOut");
    });
  });
});
