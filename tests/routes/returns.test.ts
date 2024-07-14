import moment from "moment";
import { Types } from "mongoose";
import request from "supertest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Customer } from "../../src/models/customer";
import { Game } from "../../src/models/game";
import { Genre } from "../../src/models/genre";
import { Rental } from "../../src/models/rental";
import { User } from "../../src/models/user";
import { server } from "../../src/server";

describe("/api/returns", () => {
  let customerId: Types.ObjectId | string;
  let gameId: Types.ObjectId | string;
  let rental: InstanceType<typeof Rental>;
  let token: string;
  let game: InstanceType<typeof Game>;

  const exe = () => {
    return request(server)
      .post("/api/returns")
      .set("x-auth-token", token)
      .send({ customerId, gameId });
  };

  beforeEach(async () => {
    customerId = new Types.ObjectId();
    gameId = new Types.ObjectId();
    token = new User().generateAuthToken();

    const customer = new Customer({ _id: customerId, name: "customer1", phone: "123456" });
    await customer.save();

    const genre = new Genre({ name: "genre1" });
    await genre.save();

    game = new Game({
      _id: gameId,
      title: "12345",
      dailyRentalRate: 3,
      genre: genre._id,
      numberInStock: 10,
      purchasePrice: 49.99,
    });

    await game.save();

    rental = new Rental({
      customer: customerId,
      game: gameId,
    });

    await rental.save();
  });

  afterEach(async () => {
    await Rental.deleteMany({});
    await Game.deleteMany({});
    await Genre.deleteMany({});
    server.close();
  });

  it("should return 401 if client is not logged in", async () => {
    token = "";

    const res = await exe();

    expect(res.status).toBe(401);
  });

  it("should return 400 if customerId is not provided", async () => {
    customerId = "";

    const res = await exe();

    expect(res.status).toBe(400);
  });

  it("should return 400 if gameId is not provided", async () => {
    gameId = "";

    const res = await exe();

    expect(res.status).toBe(400);
  });

  it("should return 404 if no rental found for the customer/game", async () => {
    await Rental.deleteMany({});

    const res = await exe();

    expect(res.status).toBe(404);
  });

  it("should return 400 if return is already processed", async () => {
    rental.dateReturned = new Date();
    await rental.save();

    const res = await exe();

    expect(res.status).toBe(400);
  });

  it("should return 200 if we have a valid request", async () => {
    const res = await exe();

    expect(res.status).toBe(200);
  });

  it("should set the returnDate if input is valid", async () => {
    await exe();

    const rentalInDb = await Rental.findById(rental._id);
    const diff = new Date().getTime() - rentalInDb!.dateReturned!.getTime();

    expect(diff).toBeLessThan(10 * 1000);
  });

  it("should set the rentalFee if input is valid", async () => {
    rental.dateOut = moment().subtract(7, "days").toDate();
    await rental.save();

    await exe();

    const rentalInDb = await Rental.findById(rental._id);
    const dateOut = moment(rentalInDb!.dateOut);
    const dateReturned = moment(rentalInDb!.dateReturned);
    const daysRented = dateReturned.diff(dateOut, "days");

    const expectedRentalFee = daysRented * game.dailyRentalRate;

    expect(rentalInDb!.rentalFee).toBe(expectedRentalFee);
  });

  it("should increase the game stock if input is valid", async () => {
    await exe();

    const gameInDb = await Game.findById(gameId);

    expect(gameInDb!.numberInStock).toBe(game.numberInStock + 1);
  });

  it("should return the rental if input is valid ", async () => {
    const res = await exe();

    await Rental.findById(rental._id);

    expect(Object.keys(res.body)).toEqual(
      expect.arrayContaining(["dateOut", "dateReturned", "rentalFee", "customer", "game"])
    );
  });
});
